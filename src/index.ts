import { defineComponent, h, onMounted, onUpdated, PropType, ref } from 'vue'
import QR from './qrcodegen'

type Modules = ReturnType<QR.QrCode['getModules']>
export type Level = 'L' | 'M' | 'Q' | 'H'
export type RenderAs = 'canvas' | 'svg'
export type GradientType = 'linear' | 'radial'

const defaultErrorCorrectLevel = 'H'

const ErrorCorrectLevelMap: Readonly<Record<Level, QR.QrCode.Ecc>> = {
	L: QR.QrCode.Ecc.LOW,
	M: QR.QrCode.Ecc.MEDIUM,
	Q: QR.QrCode.Ecc.QUARTILE,
	H: QR.QrCode.Ecc.HIGH,
}

// Thanks the `qrcode.react`
const SUPPORTS_PATH2D: boolean = (function () {
	try {
		new Path2D().addPath(new Path2D())
	} catch (e) {
		return false
	}
	return true
})()

function validErrorCorrectLevel(level: string): boolean {
	return level in ErrorCorrectLevelMap
}

function generatePath(modules: Modules, margin: number = 0): string {
	const ops: string[] = []
	modules.forEach(function (row, y) {
		let start: number | null = null
		row.forEach(function (cell, x) {
			if (!cell && start !== null) {
				ops.push(
					`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
				)
				start = null
				return
			}
			if (x === row.length - 1) {
				if (!cell) return
				if (start === null) {
					ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
				} else {
					ops.push(
						`M${start + margin},${y + margin} h${x + 1 - start}v1H${
							start + margin
						}z`
					)
				}
				return
			}
			if (cell && start === null) {
				start = x
			}
		})
	})
	return ops.join('')
}

const QRCodeProps = {
	value: {
		type: String,
		required: true,
		default: '',
	},
	size: {
		type: Number,
		default: 100,
	},
	level: {
		type: String as PropType<Level>,
		default: defaultErrorCorrectLevel,
		validator: (l: any) => validErrorCorrectLevel(l),
	},
	background: {
		type: String,
		default: '#fff',
	},
	foreground: {
		type: String,
		default: '#000',
	},
	margin: {
		type: Number,
		required: false,
		default: 0,
	},
	gradient: {
		type: Boolean,
		required: false,
		default: false,
	},
	gradientType: {
		type: String as PropType<GradientType>,
		required: false,
		default: 'linear',
		validator: (t: any) => ['linear', 'radial'].indexOf(t) > -1,
	},
	gradientStartColor: {
		type: String,
		required: false,
		default: '#000',
	},
	gradientEndColor: {
		type: String,
		required: false,
		default: '#fff',
	},
}

const QRCodeVueProps = {
	...QRCodeProps,
	renderAs: {
		type: String as PropType<RenderAs>,
		required: false,
		default: 'canvas',
		validator: (as: any) => ['canvas', 'svg'].indexOf(as) > -1,
	},
}

const QRCodeSvg = defineComponent({
	name: 'QRCodeSvg',
	props: QRCodeProps,
	setup(props) {
		const numCells = ref(0)
		const fgPath = ref('')

		const generate = () => {
			const { value, level, margin } = props
			const cells = QR.QrCode.encodeText(
				value,
				ErrorCorrectLevelMap[level]
			).getModules()
			numCells.value = cells.length + margin * 2
			fgPath.value = generatePath(cells, margin)
		}

		generate()
		onUpdated(generate)

		return () =>
			h(
				'svg',
				{
					width: props.size,
					height: props.size,
					'shape-rendering': `crispEdges`,
					xmlns: 'http://www.w3.org/2000/svg',
					viewBox: `0 0 ${numCells.value} ${numCells.value}`,
				},
				[
					h(
						'defs',
						{},
						props.gradient
							? h(
									props.gradientType === 'linear'
										? 'linearGradient'
										: 'radialGradient',
									{
										id: 'grad',
										...(props.gradientType === 'linear'
											? {
													x1: '0%',
													y1: '0%',
													x2: '100%',
													y2: '100%',
												}
											: {
													cx: '50%',
													cy: '50%',
													r: '50%',
													fx: '50%',
													fy: '50%',
												}),
									},
									[
										h('stop', {
											offset: '0%',
											style: {
												stopColor:
													props.gradientStartColor,
											},
										}),
										h('stop', {
											offset: '100%',
											style: {
												stopColor:
													props.gradientEndColor,
											},
										}),
									]
								)
							: h('')
					),
					h('rect', {
						width: '100%',
						height: '100%',
						fill: props.background,
					}),
					h('path', {
						fill: props.gradient ? 'url(#grad)' : props.foreground,
						d: fgPath.value,
					}),
				]
			)
	},
})

const QRCodeCanvas = defineComponent({
	name: 'QRCodeCanvas',
	props: QRCodeProps,
	setup(props) {
		const canvasEl = ref<HTMLCanvasElement | null>(null)

		const generate = () => {
			const {
				value,
				level,
				size,
				margin,
				background,
				foreground,
				gradient,
				gradientType,
				gradientStartColor,
				gradientEndColor,
			} = props
			const canvas = canvasEl.value
			if (!canvas) return
			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const cells = QR.QrCode.encodeText(
				value,
				ErrorCorrectLevelMap[level]
			).getModules()
			const numCells = cells.length + margin * 2
			const devicePixelRatio = window.devicePixelRatio || 1
			const scale = (size / numCells) * devicePixelRatio
			canvas.height = canvas.width = size * devicePixelRatio
			ctx.scale(scale, scale)

			ctx.fillStyle = background
			ctx.fillRect(0, 0, numCells, numCells)

			if (gradient) {
				let grad
				if (gradientType === 'linear') {
					grad = ctx.createLinearGradient(0, 0, numCells, numCells)
				} else {
					grad = ctx.createRadialGradient(
						numCells / 2,
						numCells / 2,
						0,
						numCells / 2,
						numCells / 2,
						numCells / 2
					)
				}
				grad.addColorStop(0, gradientStartColor)
				grad.addColorStop(1, gradientEndColor)
				ctx.fillStyle = grad
			} else {
				ctx.fillStyle = foreground
			}

			if (SUPPORTS_PATH2D) {
				ctx.fill(new Path2D(generatePath(cells, margin)))
			} else {
				cells.forEach(function (row, rdx) {
					row.forEach(function (cell, cdx) {
						if (cell) {
							ctx.fillRect(cdx + margin, rdx + margin, 1, 1)
						}
					})
				})
			}
		}

		onMounted(generate)
		onUpdated(generate)

		return () =>
			h('canvas', {
				ref: canvasEl,
				style: { width: `${props.size}px`, height: `${props.size}px` },
			})
	},
})

const QrcodeVue = defineComponent({
	name: 'Qrcode',
	render() {
		const {
			renderAs,
			value,
			size: _size,
			margin: _margin,
			level: _level,
			background,
			foreground,
			gradient,
			gradientType,
			gradientStartColor,
			gradientEndColor,
		} = this.$props
		const size = _size >>> 0
		const margin = _margin >>> 0
		const level = validErrorCorrectLevel(_level)
			? _level
			: defaultErrorCorrectLevel

		return h(renderAs === 'svg' ? QRCodeSvg : QRCodeCanvas, {
			value,
			size,
			margin,
			level,
			background,
			foreground,
			gradient,
			gradientType,
			gradientStartColor,
			gradientEndColor,
		})
	},
	props: QRCodeVueProps,
})

export default QrcodeVue
