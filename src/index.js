import QRCode from 'qr.js/lib/QRCode'
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel'

function getBackingStorePixelRatio(ctx) {
  return (
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1
  )
}

/**
 * Encode UTF16 to UTF8.
 * See: http://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/
 * @param str {string}
 * @returns {string}
 */
function toUTF8String(str) {
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
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      utf8Str += String.fromCharCode(0xf0 | (charCode >> 18))
      utf8Str += String.fromCharCode(0x80 | ((charCode >> 12) & 0x3f))
      utf8Str += String.fromCharCode(0x80 | ((charCode >> 6) & 0x3f))
      utf8Str += String.fromCharCode(0x80 | (charCode & 0x3f))
    }
  }
  return utf8Str
}

const QrcodeVue = {
  render(createElement) {
    const { className, value, level, background, foreground, size } = this

    return createElement(
      'div',
      {
        'class': className,
        attrs: { value, level, background, foreground }
      },
      [
        createElement(
          'canvas',
          {
            attrs: { height: size, width: size },
            style: { width: size + 'px', height: size + 'px' },
            ref: 'qrcode-vue'
          },
          []
        )
      ]
    )
  },
  props: {
    value: {
      type: String,
      required: true,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: 100,
      validator: s => isNaN(Number(s)) !== true
    },
    level: {
      type: String,
      default: 'L',
      validator: l => ['L', 'Q', 'M', 'H'].indexOf(l) > -1
    },
    background: {
      type: String,
      default: '#fff'
    },
    foreground: {
      type: String,
      default: '#000'
    }
  },
  methods: {
    render() {
      const { value, size, level, background, foreground } = this
      const _size = size >>> 0 // size to number

      // We'll use type===-1 to force QRCode to automatically pick the best type
      const qrCode = new QRCode(-1, ErrorCorrectLevel[level])
      qrCode.addData(toUTF8String(value))
      qrCode.make()

      const canvas = this.$refs['qrcode-vue']

      const ctx = canvas.getContext('2d')
      const cells = qrCode.modules
      const tileW = _size / cells.length
      const tileH = _size / cells.length
      const scale = (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx)
      canvas.height = canvas.width = _size * scale
      ctx.scale(scale, scale)

      cells.forEach(function (row, rdx) {
        row.forEach(function (cell, cdx) {
          ctx.fillStyle = cell ? foreground : background
          const w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW))
          const h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH))
          ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h)
        })
      })
    }
  },
  updated() {
    this.render()
  },
  mounted() {
    this.render()
  }
}

export default QrcodeVue
