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

const QrcodeVue = {
  render(createElement) {
    const {className, value, level, background, foreground, size} = this

    return createElement(
      'div',
      {
        'class': className,
        attrs: {value, level, background, foreground}
      },
      [
        createElement(
          'canvas',
          {
            attrs: {height: size, width: size},
            style: {width: size + 'px', height: size + 'px'},
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
      const {value, size, level, background, foreground} = this
      const _size = size >>> 0 // size to number

      // We'll use type===-1 to force QRCode to automatically pick the best type
      const qrCode = new QRCode(-1, ErrorCorrectLevel[level])
      qrCode.addData(value)
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
