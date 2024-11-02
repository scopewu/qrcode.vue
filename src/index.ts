import { defineComponent, Fragment, h, onMounted, onUpdated, PropType, ref } from 'vue'
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
}
type Excavation = {
  x: number,
  y: number,
  w: number,
  h: number,
}

const defaultErrorCorrectLevel: Level = 'L'

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
  const ops: string[] = []
  modules.forEach(function (row, y) {
    let start: number | null = null
    row.forEach(function (cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(
          `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
        )
        start = null
        return
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          return
        }
        if (start === null) {
          // Just a single dark module.
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
        } else {
          // Otherwise finish the current line.
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
  excavation: Excavation | null
} {
  const { width, height, x: imageX, y: imageY } = imageSettings
  const numCells = cells.length + margin * 2
  const defaultSize = Math.floor(size * 0.1)
  const scale = numCells / size
  const w = (width || defaultSize) * scale
  const h = (height || defaultSize) * scale
  const x = imageX == null ? cells.length / 2 - w / 2 : imageX * scale
  const y = imageY == null ? cells.length / 2 - h / 2 : imageY * scale

  let excavation = null
  if (imageSettings.excavate) {
    let floorX = Math.floor(x)
    let floorY = Math.floor(y)
    let ceilW = Math.ceil(w + x - floorX)
    let ceilH = Math.ceil(h + y - floorY)
    excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH }
  }

  return { x, y, h, w, excavation }
}

function excavateModules(modules: Modules, excavation: Excavation): Modules {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row
    }
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.w) {
        return cell
      }
      return false
    })
  })
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
    const numCells = ref(0)
    const fgPath = ref('')
    let imageProps: { x: number, y: number, width: number, height: number }

    const generate = () => {
      const { value, level: _level, margin: _margin } = props
      const margin = _margin >>> 0
      const level = validErrorCorrectLevel(_level) ? _level : defaultErrorCorrectLevel

      let cells = QR.QrCode.encodeText(value, ErrorCorrectLevelMap[level]).getModules()
      numCells.value = cells.length + margin * 2

      if(props.imageSettings.src) {
        const imageSettings = getImageSettings(cells, props.size, margin, props.imageSettings)
        imageProps = {
          x: imageSettings.x + margin,
          y: imageSettings.y + margin,
          width: imageSettings.w,
          height: imageSettings.h,
        }

        if (imageSettings.excavation) {
          cells = excavateModules(cells, imageSettings.excavation)
        }
      }

      // Drawing strategy: instead of a rect per module, we're going to create a
      // single path for the dark modules and layer that on top of a light rect,
      // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
      // way faster than DOM ops.
      // For level 1, 441 nodes -> 2
      // For level 40, 31329 -> 2
      fgPath.value = generatePath(cells, margin)
    }

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
          id: 'qr-gradient',
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

    generate()

    onUpdated(generate)

    return () => h(
      'svg',
      {
        width: props.size,
        height: props.size,
        'shape-rendering': `crispEdges`,
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${numCells.value} ${numCells.value}`,
      },
      [
        h('defs', {}, [renderGradient()]),
        h('rect', {
          width: '100%',
          height: '100%',
          fill: props.background,
        }),
        h('path', {
          fill: props.gradient ? 'url(#qr-gradient)' : props.foreground,
          d: fgPath.value,
        }),
        props.imageSettings.src && h('image', {
          href: props.imageSettings.src,
          ...imageProps,
        }),
      ]
    )
  },
})

export const QrcodeCanvas = defineComponent({
  name: 'QRCodeCanvas',
  props: QRCodeProps,
  setup(props, ctx) {
    const canvasEl = ref<HTMLCanvasElement | null>(null)
    const imageRef = ref<HTMLImageElement | null>(null)

    const generate = () => {
      const {
        value,
        level: _level,
        size,
        margin: _margin,
        background,
        foreground,
        gradient,
        gradientType,
        gradientStartColor,
        gradientEndColor,
      } = props
      const margin = _margin >>> 0
      const level = validErrorCorrectLevel(_level) ? _level : defaultErrorCorrectLevel

      const canvas = canvasEl.value

      if (!canvas) {
        return
      }

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return
      }

      let cells = QR.QrCode.encodeText(value, ErrorCorrectLevelMap[level]).getModules()
      const numCells = cells.length + margin * 2

      const image = imageRef.value
      let imageProps = { x: 0, y: 0, width: 0, height: 0 }
      const showImage = props.imageSettings.src && image != null && image.naturalWidth !== 0 && image.naturalHeight !== 0

      if(showImage) {
        const imageSettings = getImageSettings(cells, props.size, margin, props.imageSettings)
        imageProps = {
          x: imageSettings.x + margin,
          y: imageSettings.y + margin,
          width: imageSettings.w,
          height: imageSettings.h,
        }

        if (imageSettings.excavation) {
          cells = excavateModules(cells, imageSettings.excavation)
        }
      }

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
            numCells / 2,
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

      if (showImage) {
        ctx.drawImage(
          image,
          imageProps.x,
          imageProps.y,
          imageProps.width,
          imageProps.height
        );
      }
    }

    onMounted(generate)
    onUpdated(generate)

    const { style } = ctx.attrs

    return () => h(
      Fragment,
      [
        h(
          'canvas',
          {
            ...ctx.attrs,
            ref: canvasEl,
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
  render() {
    const {
      renderAs,
      value,
      size,
      margin,
      level,
      background,
      foreground,
      imageSettings,
      gradient,
      gradientType,
      gradientStartColor,
      gradientEndColor,
    } = this.$props

    return h(
      renderAs === 'svg' ? QrcodeSvg : QrcodeCanvas,
      {
        value,
        size,
        margin,
        level,
        background,
        foreground,
        imageSettings,
        gradient,
        gradientType,
        gradientStartColor,
        gradientEndColor,
      },
    )
  },
  props: QRCodeVueProps,
})

export default QrcodeVue
