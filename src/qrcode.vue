<template>
  <div :class="className">
    <canvas :style="{width: size, height: size}" :height="size" :width="size" ref="qrcode-vue"></canvas>
  </div>
</template>
<script>
  import QRCode from 'qr.js/lib/QRCode';
  import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel'

  function getBackingStorePixelRatio(ctx) {
    return (
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1
    );
  }

  export default {
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
        type: Number,
        default: 100
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
        const {value, size, level, background, foreground} = this;

        // We'll use type===-1 to force QRCode to automatically pick the best type
        const qrCode = new QRCode(-1, ErrorCorrectLevel[level]);
        qrCode.addData(value);
        qrCode.make();

        const canvas = this.$refs['qrcode-vue'];

        const ctx = canvas.getContext('2d');
        const cells = qrCode.modules;
        const tileW = size / cells.length;
        const tileH = size / cells.length;
        const scale = (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx);
        canvas.height = canvas.width = size * scale;
        ctx.scale(scale, scale);

        cells.forEach(function (row, rdx) {
          row.forEach(function (cell, cdx) {
            ctx.fillStyle = cell ? foreground : background;
            const w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW));
            const h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH));
            ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h);
          });
        });
      }
    },
    mounted() {
      this.render();

      this.$watch('$props', this.render, {deep: true})

      // this.$options._propKeys.forEach(key => this.$watch(key, this.render))
    }
  }
</script>
