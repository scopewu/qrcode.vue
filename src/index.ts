import { computed, defineComponent, ExtractPropTypes, Fragment, h, onMounted, PropType, ref, useId, watchEffect } from 'vue'
import QR from './qrcodegen'

type Modules = ReturnType<QR.QrCode['getModules']>
export type Level = 'L' | 'M' | 'Q' | 'H'
export type RenderAs = 'canvas' | 'svg'
export type GradientType = 'linear' | 'radial'
export type ImageSettings = {
  src: string,
  x?: number,
  y?: number,
  height?: number,
  width?: number,
  excavate?: boolean,
  borderRadius?: number,
}

let _uid = 0

function getUid(): string {
  if (typeof useId === 'function') {
    return `${useId()}-${_uid++}`
  }
  return `vue-${Math.random().toString(36).slice(2)}-${_uid++}`
}

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

function getNeighborFlags(modules: Modules, row: number, col: number): {
  nw: boolean
  ne: boolean
  se: boolean
  sw: boolean
} {
  const north = row > 0 ? modules[row - 1][col] : false
  const south = row < modules.length - 1 ? modules[row + 1][col] : false
  const west = col > 0 ? modules[row][col - 1] : false
  const east = col < modules[row].length - 1 ? modules[row][col + 1] : false

  return {
    nw: !north && !west,
    ne: !north && !east,
    se: !south && !east,
    sw: !south && !west,
  }
}

function generateRoundedPath(modules: Modules, margin: number = 0, radius: number = 0): string {
  const pathSegments: string[] = []
  const r = Math.min(radius, 0.5)

  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (!modules[row][col]) continue

      const { nw, ne, se, sw } = getNeighborFlags(modules, row, col)
      const x = col + margin
      const y = row + margin

      pathSegments.push(
        `M${x + (nw ? r : 0)} ${y}`,
        `L${x + 1 - (ne ? r : 0)} ${y}`,
      )

      if (ne) {
        pathSegments.push(`A${r} ${r} 0 0 1 ${x + 1} ${y + r}`)
      }

      pathSegments.push(`L${x + 1} ${y + 1 - (se ? r : 0)}`)

      if (se) {
        pathSegments.push(`A${r} ${r} 0 0 1 ${x + 1 - r} ${y + 1}`)
      }

      pathSegments.push(`L${x + (sw ? r : 0)} ${y + 1}`)

      if (sw) {
        pathSegments.push(`A${r} ${r} 0 0 1 ${x} ${y + 1 - r}`)
      }

      pathSegments.push(`L${x} ${y + (nw ? r : 0)}`)

      if (nw) {
        pathSegments.push(`A${r} ${r} 0 0 1 ${x + r} ${y}`)
      }

      pathSegments.push('z')
    }
  }

  return pathSegments.join('')
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

  return { x, y, h, w, borderRadius }
}

type QRCodePropsType = ExtractPropTypes<typeof QRCodeProps>

function useQRCode(props: QRCodePropsType) {
  const margin = computed(() => (props.margin ?? DEFAULT_MARGIN) >>> 0)
  const cells = computed(() => {
    const level = validErrorCorrectLevel(props.level) ? props.level : defaultErrorCorrectLevel
    return QR.QrCode.encodeText(props.value, ErrorCorrectLevelMap[level]).getModules()
  })
  const numCells = computed(() => cells.value.length + margin.value * 2)
  const fgPath = computed(() => {
    if (props.radius > 0) {
      return generateRoundedPath(cells.value, margin.value, props.radius)
    }
    return generatePath(cells.value, margin.value)
  })
  const imageProps = computed(() => {
    if (!props.imageSettings.src) return null

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
    if (!props.imageSettings.excavate || !imageProps.value) return null
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
  radius: {
    type: Number,
    required: false,
    default: 0,
    validator: (r: any) => !isNaN(r) && r >= 0 && r <= 0.5,
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
    const uid = getUid()
    const qrGradientId = `qrcode.vue-gradient-${uid}`
    const qrLogoClipPathId = `qrcode.vue-logo-clip-path-${uid}`
    const gradientVNode = computed(() => {
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
    })

    const clipPathVNode = computed(() => {
      if (!imageProps.value) return null

      const borderRadius = imageProps.value.borderRadius
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
    })

    return () => h(
      'svg',
      {
        width: props.size,
        height: props.size,
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${numCells.value} ${numCells.value}`,
        role: 'img',
        'aria-label': props.value,
      },
      [
        h('defs', {}, [gradientVNode.value, clipPathVNode.value]),
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
        props.imageSettings.src && imageProps.value && h('image', {
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
    const imageEl = ref<HTMLImageElement | null>(null)

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

      const image = imageEl.value

      const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      const scale = (size / numCells.value) * devicePixelRatio
      canvas.height = canvas.width = size * devicePixelRatio
      canvasCtx.setTransform(scale, 0, 0, scale, 0, 0)

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

      if (showImage && imageProps.value) {
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
            style: { ...(ctx.attrs.style as Object), width: `${props.size}px`, height: `${props.size}px` },
          },
        ),
        props.imageSettings.src && h('img', {
          ref: imageEl,
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
        radius: props.radius,
      },
    )
  },
})

export default QrcodeVue
