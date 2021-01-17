import { defineComponent, h } from 'vue'
import QR, { ErrorCorrectLevel } from 'qr.js'

const defaultErrorCorrectLevel = 'H'

// Thanks the `qrcode.react`
const SUPPORTS_PATH2D: boolean = (function () {
  try {
    new Path2D().addPath(new Path2D())
  } catch (e) {
    return false
  }
  return true
})()

function QRCode(data: string, errorCorrectLevel: number): { modules: boolean[][] } {
  // We'll use type===-1 to force QRCode to automatically pick the best type
  return new QR(data, { typeNumber: -1, errorCorrectLevel })
}

function validErrorCorrectLevel(level: string): boolean {
  return level in ErrorCorrectLevel
}

/**
 * Encode UTF16 to UTF8.
 * See: http://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/
 * @param str {string}
 * @returns {string}
 */
function toUTF8String(str: string): string {
  let utf8Str = ''
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i)
    if (charCode < 0x0080) {
      utf8Str += String.fromCharCode(charCode)
    } else if (charCode < 0x0800) {
      utf8Str += String.fromCharCode(0xc0 | (charCode >> 6))
      utf8Str += String.fromCharCode(0x80 | (charCode & 0x3f))
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8Str += String.fromCharCode(0xe0 | (charCode >> 12))
      utf8Str += String.fromCharCode(0x80 | ((charCode >> 6) & 0x3f))
      utf8Str += String.fromCharCode(0x80 | (charCode & 0x3f))
    } else {
      // surrogate pair
      i++
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charCode =
        0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      utf8Str += String.fromCharCode(0xf0 | (charCode >> 18))
      utf8Str += String.fromCharCode(0x80 | ((charCode >> 12) & 0x3f))
      utf8Str += String.fromCharCode(0x80 | ((charCode >> 6) & 0x3f))
      utf8Str += String.fromCharCode(0x80 | (charCode & 0x3f))
    }
  }
  return utf8Str
}

function generatePath(modules: boolean[][], margin: number = 0): string {
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
    type: String,
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
} as const

const QRCodeVueProps = {
  ...QRCodeProps,
  renderAs: {
    type: String,
    required: false,
    default: 'canvas',
    validator: (as: any) => ['canvas', 'svg'].indexOf(as) > -1,
  },
} as const

const QRCodeSvg = defineComponent({
  render() {
    const {
      size,
      background,
      foreground,
      numCells,
      fgPath,
    } = this

    return h(
      'svg',
      {
        width: size,
        height: size,
        'shape-rendering': `crispEdges`,
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${numCells} ${numCells}`,
      },
      [
        h('path', { fill: background, d: `M0,0 h${numCells}v${numCells}H0z` }),
        h('path', { fill: foreground, d: fgPath }),
      ]
    )
  },
  props: QRCodeProps,
  data() {
    return {
      numCells: 0,
      fgPath: '',
    }
  },
  created() {
    this.generate()
  },
  updated() {
    this.generate()
  },
  methods: {
    generate() {
      const {
        value,
        level,
        margin,
      } = this

      const { modules: cells } = QRCode(toUTF8String(value), ErrorCorrectLevel[level])

      this.numCells = cells.length + margin * 2

      // Drawing strategy: instead of a rect per module, we're going to create a
      // single path for the dark modules and layer that on top of a light rect,
      // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
      // way faster than DOM ops.
      // For level 1, 441 nodes -> 2
      // For level 40, 31329 -> 2
      this.fgPath = generatePath(cells, margin)
    }
  },
})

const QRCodeCanvas = defineComponent({
  render() {
    const {
      size,
    } = this

    return h(
      'canvas',
      {
        style: { width: `${size}px`, height: `${size}px`},
      },
    )
  },
  props: QRCodeProps,
  data() {
    return {
      numCells: 0,
      fgPath: '',
    }
  },
  mounted() {
    this.generate()
  },
  updated() {
    this.generate()
  },
  methods: {
    generate() {
      const {
        value,
        level,
        size,
        margin,
        background,
        foreground,
      } = this

      const { modules: cells } = QRCode(toUTF8String(value), ErrorCorrectLevel[level])
      const numCells = cells.length + margin * 2
      const canvas: HTMLCanvasElement = this.$el

      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return;
      }

      const devicePixelRatio = window.devicePixelRatio || 1

      const scale = (size / numCells) * devicePixelRatio
      canvas.height = canvas.width = size * devicePixelRatio
      ctx.scale(scale, scale)

      ctx.fillStyle = background
      ctx.fillRect(0, 0, numCells, numCells)

      ctx.fillStyle = foreground

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
  },
})

const QrcodeVue = defineComponent({
  render() {
    const {
      renderAs,
      value,
      size: _size,
      margin: _margin,
      level: _level,
      background,
      foreground,
    } = this.$props
    const size = _size >>> 0
    const margin = _margin >>> 0
    const level = validErrorCorrectLevel(_level) ? _level : defaultErrorCorrectLevel

    return h(
      renderAs === 'svg' ? QRCodeSvg : QRCodeCanvas,
      { value, size, margin, level, background, foreground },
      )
  },
  props: QRCodeVueProps,
})

export default QrcodeVue
