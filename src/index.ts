import { computed, defineComponent, Fragment, h, onMounted, PropType, ref, watchEffect } from 'vue'
import QR from './qrcodegen'

type Modules = ReturnType<QR.QrCode['getModules']>
export type Level = 'L' | 'M' | 'Q' | 'H'
export type RenderAs = 'canvas' | 'svg'
export type GradientType = 'linear' | 'radial'
export type ImageSettings = {
  src: string,
  x?: number,
  y?: number,
  height: number,
  width: number,
  excavate?: boolean,
  borderRadius?: number,
}
type Excavation = {
  x: number,
  y: number,
  w: number,
  h: number,
}

let _uid = 0

const defaultErrorCorrectLevel: Level = 'L'

const DEFAULT_QR_SIZE = 100
const DEFAULT_MARGIN = 0
const DEFAULT_IMAGE_SIZE_RATIO = 0.1
const IMAGE_EXCAVATE_THICKNESS = 2

const ErrorCorrectLevelMap : Readonly<Record<Level, QR.QrCode.Ecc>> = {
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
  const pathSegments: string[] = []

  for (let y = 0; y < modules.length; y++) {
    const row = modules[y]
    let start: number | null = null

    for (let x = 0; x < row.length; x++) {
      const cell = row[x]

      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        pathSegments.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`)
        start = null
        continue
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          continue
        }
        if (start === null) {
          // Just a single dark module.
          pathSegments.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
        } else {
          // Otherwise finish the current line.
          pathSegments.push(`M${start + margin},${y + margin} h${x + 1 - start}v1H${start + margin}z`)
        }
        continue
      }

      if (cell && start === null) {
        start = x
      }
    }
  }

  return pathSegments.join('')
}

function getImageSettings(
  cells: Modules,
  size: number,
  margin: number,
  imageSettings: ImageSettings
) : {
  x: number
  y: number
  h: number
  w: number
  borderRadius: number,
  excavation: Excavation | null
} {
  const { width, height, x: imageX, y: imageY } = imageSettings
  const numCells = cells.length + margin * 2
  const defaultSize = Math.floor(size * DEFAULT_IMAGE_SIZE_RATIO)
  const scale = numCells / size
  const w = (width || defaultSize) * scale
  const h = (height || defaultSize) * scale
  const x = imageX == null ? cells.length / 2 - w / 2 : imageX * scale
  const y = imageY == null ? cells.length / 2 - h / 2 : imageY * scale
  const borderRadius = (imageSettings.borderRadius || 0) * scale

  let excavation = null
  if (imageSettings.excavate) {
    let floorX = Math.floor(x)
    let floorY = Math.floor(y)
    let ceilW = Math.ceil(w + x - floorX)
    let ceilH = Math.ceil(h + y - floorY)

    excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH }
  }

  return { x, y, h, w, borderRadius, excavation }
}

function useQRCode(props: {
  value: string
  level: Level
  margin: number
  size: number
  imageSettings: ImageSettings
}) {
  const margin = computed(() => (props.margin ?? DEFAULT_MARGIN) >>> 0)
  const cells = computed(() => {
    const level = validErrorCorrectLevel(props.level) ? props.level : defaultErrorCorrectLevel
    return QR.QrCode.encodeText(props.value, ErrorCorrectLevelMap[level]).getModules()
  })
  const numCells = computed(() => cells.value.length + margin.value * 2)
  const fgPath = computed(() => generatePath(cells.value, margin.value))
  const imageProps = computed(() => {
    if (!props.imageSettings.src) {
      return { x: 0, y: 0, width: 0, height: 0, borderRadius: 0 }
    }

    const settings = getImageSettings(cells.value, props.size, margin.value, props.imageSettings)
    return  {
      x: settings.x + margin.value,
      y: settings.y + margin.value,
      width: settings.w,
      height: settings.h,
      borderRadius: settings.borderRadius,
    }
  })

  const imageBorderProps = computed(() => {
    if (!props.imageSettings.excavate || !props.imageSettings.src) return null
    const borderThickness = IMAGE_EXCAVATE_THICKNESS / (props.size / numCells.value)
    return {
      x: imageProps.value.x - borderThickness,
      y: imageProps.value.y - borderThickness,
      width: imageProps.value.width + borderThickness * 2,
      height: imageProps.value.height + borderThickness * 2,
      borderRadius: imageProps.value.borderRadius,
    }
  })

  return { margin, numCells, cells, fgPath, imageProps, imageBorderProps }
}

const QRCodeProps = {
  value: {
    type: String,
    required: true,
    default: '',
  },
  size: {
    type: Number,
    default: DEFAULT_QR_SIZE,
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
    default: DEFAULT_MARGIN,
  },
  imageSettings: {
    type: Object as PropType<ImageSettings>,
    required: false,
    default: () => ({}),
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

export const QrcodeSvg = defineComponent({
  name: 'QRCodeSvg',
  props: QRCodeProps,
  setup(props) {
    const { numCells, fgPath, imageProps, imageBorderProps } = useQRCode(props)
    const uid = _uid++
    const qrGradientId = `qrcode.vue-gradient-${uid}`
    const qrLogoClipPathId = `qrcode.vue-logo-clip-path-${uid}`
    const renderGradient = () => {
      if (!props.gradient) return null

      const gradientProps = props.gradientType === 'linear'
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
          }

      return h(
        props.gradientType === 'linear' ? 'linearGradient' : 'radialGradient',
        {
          id: qrGradientId,
          ...gradientProps,
        },
        [
          h('stop', {
            offset: '0%',
            style: { stopColor: props.gradientStartColor },
          }),
          h('stop', {
            offset: '100%',
            style: { stopColor: props.gradientEndColor },
          }),
        ]
      )
    }

    const renderClipPath = () => {
      const borderRadius = imageProps.value.borderRadius
      if (!props.imageSettings.src) return null
      if (borderRadius <= 0) return null

      return h(
        'clipPath',
        { id: qrLogoClipPathId },
        [
          h('rect', {
            x: imageProps.value.x,
            y: imageProps.value.y,
            width: imageProps.value.width,
            height: imageProps.value.height,
            rx: borderRadius,
            ry: borderRadius,
          }),
        ],
      )
    }

    return () => h(
      'svg',
      {
        width: props.size,
        height: props.size,
        'shape-rendering': `crispEdges`,
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${numCells.value} ${numCells.value}`,
        role: 'img',
        'aria-label': props.value,
      },
      [
        h('defs', {}, [renderGradient(), renderClipPath()]),
        h('rect', {
          width: '100%',
          height: '100%',
          fill: props.background,
        }),
        h('path', {
          fill: props.gradient ? `url(#${qrGradientId})` : props.foreground,
          d: fgPath.value,
        }),
        imageBorderProps.value && h('rect', {
          x: imageBorderProps.value.x,
          y: imageBorderProps.value.y,
          width: imageBorderProps.value.width,
          height: imageBorderProps.value.height,
          fill: props.background,
          rx: imageBorderProps.value.borderRadius,
          ry: imageBorderProps.value.borderRadius,
        }),
        props.imageSettings.src && h('image', {
          href: props.imageSettings.src,
          ...imageProps.value,
          ...(imageProps.value.borderRadius > 0 ? { 'clip-path': `url(#${qrLogoClipPathId})` } : {}),
        }),
      ]
    )
  },
})

export const QrcodeCanvas = defineComponent({
  name: 'QRCodeCanvas',
  props: QRCodeProps,
  setup(props, ctx) {
    const { margin, cells, numCells, fgPath, imageProps, imageBorderProps } = useQRCode(props)

    const canvasEl = ref<HTMLCanvasElement | null>(null)
    const imageRef = ref<HTMLImageElement | null>(null)

    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius)
      } else {
        ctx.rect(x, y, width, height)
      }
    }

    const generate = () => {
      const {
        size,
        background,
        foreground,
        gradient,
        gradientType,
        gradientStartColor,
        gradientEndColor,
      } = props

      const canvas = canvasEl.value

      if (!canvas) {
        return
      }

      const canvasCtx = canvas.getContext('2d')

      if (!canvasCtx) {
        return
      }

      const image = imageRef.value

      const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      const scale = (size / numCells.value) * devicePixelRatio
      canvas.height = canvas.width = size * devicePixelRatio
      canvasCtx.scale(scale, scale)

      canvasCtx.fillStyle = background
      canvasCtx.fillRect(0, 0, numCells.value, numCells.value)

      if (gradient) {
        let grad
        if (gradientType === 'linear') {
          grad = canvasCtx.createLinearGradient(0, 0, numCells.value, numCells.value)
        } else {
          grad = canvasCtx.createRadialGradient(
            numCells.value / 2,
            numCells.value / 2,
            0,
            numCells.value / 2,
            numCells.value / 2,
            numCells.value / 2,
          )
        }
        grad.addColorStop(0, gradientStartColor)
        grad.addColorStop(1, gradientEndColor)
        canvasCtx.fillStyle = grad
      } else {
        canvasCtx.fillStyle = foreground
      }

      if (SUPPORTS_PATH2D) {
        canvasCtx.fill(new Path2D(fgPath.value))
      } else {
        cells.value.forEach(function (row, rdx) {
          row.forEach(function (cell, cdx) {
            if (cell) {
              canvasCtx.fillRect(cdx + margin.value, rdx + margin.value, 1, 1)
            }
          })
        })
      }

      const showImage = props.imageSettings.src && image && image.naturalWidth !== 0 && image.naturalHeight !== 0

      if (showImage) {
        if (imageBorderProps.value) {
          const imageBorder = imageBorderProps.value

          canvasCtx.fillStyle = props.background
          drawRoundedRect(
            canvasCtx,
            imageBorder.x,
            imageBorder.y,
            imageBorder.width,
            imageBorder.height,
            imageBorder.borderRadius,
          )
          canvasCtx.fill()
        }

        const borderRadius = imageProps.value.borderRadius
        if (borderRadius > 0) {
          canvasCtx.save()
          drawRoundedRect(
            canvasCtx,
            imageProps.value.x,
            imageProps.value.y,
            imageProps.value.width,
            imageProps.value.height,
            borderRadius,
          )
          canvasCtx.clip()
          canvasCtx.drawImage(
            image,
            imageProps.value.x,
            imageProps.value.y,
            imageProps.value.width,
            imageProps.value.height,
          )
          canvasCtx.restore()
        } else {
          canvasCtx.drawImage(
            image,
            imageProps.value.x,
            imageProps.value.y,
            imageProps.value.width,
            imageProps.value.height,
          )
        }
      }
    }

    onMounted(generate)
    watchEffect(generate)

    const { style } = ctx.attrs

    return () => h(
      Fragment,
      [
        h(
          'canvas',
          {
            ...ctx.attrs,
            ref: canvasEl,
            role: 'img',
            'aria-label': props.value,
            style: { ...(style as Object), width: `${props.size}px`, height: `${props.size}px`},
          },
        ),
        props.imageSettings.src && h('img', {
          ref: imageRef,
          src: props.imageSettings.src,
          style: {display: 'none'},
          onLoad: generate,
        })
      ],
    )
  },
})

const QrcodeVue = defineComponent({
  name: 'Qrcode',
  props: QRCodeVueProps,
  setup(props) {
    return () => h(
      props.renderAs === 'svg' ? QrcodeSvg : QrcodeCanvas,
      {
        value: props.value,
        size: props.size,
        margin: props.margin,
        level: props.level,
        background: props.background,
        foreground: props.foreground,
        imageSettings: props.imageSettings,
        gradient: props.gradient,
        gradientType: props.gradientType,
        gradientStartColor: props.gradientStartColor,
        gradientEndColor: props.gradientEndColor,
      },
    )
  },
})

export default QrcodeVue
