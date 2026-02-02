import { defineComponent, Fragment, h, onMounted, PropType, ref, computed, watchEffect } from 'vue'
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

const defaultErrorCorrectLevel: Level = 'L'

const DEFAULT_QR_SIZE = 100
const DEFAULT_MARGIN = 0
const DEFAULT_IMAGE_SIZE_RATIO = 0.1

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
  let path = ''
  modules.forEach(function (row, y) {
    let start: number | null = null
    row.forEach(function (cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        path += `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
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
          path += `M${x + margin},${y + margin} h1v1H${x + margin}z`
        } else {
          // Otherwise finish the current line.
          path += `M${start + margin},${y + margin} h${x + 1 - start}v1H${
            start + margin
          }z`
        }
        return
      }

      if (cell && start === null) {
        start = x
      }
    })
  })
  return path
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
    const c = QR.QrCode.encodeText(props.value, ErrorCorrectLevelMap[level]).getModules()
    return c
  })
  const numCells = computed(() => cells.value.length + margin.value * 2)
  const imageSettingsData = computed(() => {
    if (!props.imageSettings.src) return null
    return getImageSettings(cells.value, props.size, margin.value, props.imageSettings)
  })
  const fgPath = computed(() => generatePath(cells.value, margin.value))
  const imageProps = computed(() => imageSettingsData.value ? {
    x: imageSettingsData.value.x + margin.value,
    y: imageSettingsData.value.y + margin.value,
    width: imageSettingsData.value.w,
    height: imageSettingsData.value.h,
    borderRadius: imageSettingsData.value.borderRadius,
  } : { x: 0, y: 0, width: 0, height: 0, borderRadius: 0 })

  return { margin, numCells, imageSettingsData, cells, fgPath, imageProps }
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
    const { margin, numCells, imageSettingsData, fgPath, imageProps } = useQRCode(props)

    const borderProps = computed(() => {
      if (!props.imageSettings.excavate || !props.imageSettings.src) return null
      const borderThickness = 2 / (props.size / numCells.value)
      return {
        x: imageProps.value.x - borderThickness,
        y: imageProps.value.y - borderThickness,
        width: imageProps.value.width + (borderThickness * 2),
        height: imageProps.value.height + (borderThickness * 2),
        borderRadius: imageProps.value.borderRadius,
      }
    })

    const qrGradientId = 'qrcode.vue-gradient'
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

    const qrLogoClipPathId = 'qrcode.vue-logo-clip-path'
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
        borderProps.value && h('rect', {
          x: borderProps.value.x,
          y: borderProps.value.y,
          width: borderProps.value.width,
          height: borderProps.value.height,
          fill: props.background,
          rx: borderProps.value.borderRadius,
          ry: borderProps.value.borderRadius,
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
    const { margin, cells, numCells, imageSettingsData, imageProps } = useQRCode(props)

    const canvasEl = ref<HTMLCanvasElement | null>(null)
    const imageRef = ref<HTMLImageElement | null>(null)

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

      const qrCells = cells.value

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
        canvasCtx.fill(new Path2D(generatePath(qrCells, margin.value)))
      } else {
        qrCells.forEach(function (row, rdx) {
          row.forEach(function (cell, cdx) {
            if (cell) {
              canvasCtx.fillRect(cdx + margin.value, rdx + margin.value, 1, 1)
            }
          })
        })
      }

      const showImage = props.imageSettings.src && image && image.naturalWidth !== 0 && image.naturalHeight !== 0

      if (showImage) {
        if (props.imageSettings.excavate) {
          const borderThickness = 2 / (props.size / numCells.value)
          const borderX = imageProps.value.x - borderThickness
          const borderY = imageProps.value.y - borderThickness
          const borderW = imageProps.value.width + (borderThickness * 2)
          const borderH = imageProps.value.height + (borderThickness * 2)
          const borderRadius = imageProps.value.borderRadius

          canvasCtx.fillStyle = props.background
          canvasCtx.beginPath()
          if (canvasCtx.roundRect) {
            canvasCtx.roundRect(borderX, borderY, borderW, borderH, borderRadius)
          } else {
            canvasCtx.rect(borderX, borderY, borderW, borderH)
          }
          canvasCtx.fill()
        }

        const borderRadius = imageProps.value.borderRadius
        if (borderRadius > 0) {
          canvasCtx.save()
          canvasCtx.beginPath()
          if (canvasCtx.roundRect) {
            canvasCtx.roundRect(
              imageProps.value.x,
              imageProps.value.y,
              imageProps.value.width,
              imageProps.value.height,
              borderRadius
            )
          } else {
            // Fallback for browsers without roundRect support
            canvasCtx.rect(
              imageProps.value.x,
              imageProps.value.y,
              imageProps.value.width,
              imageProps.value.height
            )
          }
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
