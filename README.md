# qrcode.vue

⚠️ Now when you are using Vue 3.x, please upgrade `qrcode.vue` to `3.x`

For those using vue-cli you will need to add this option into your `vue.config.js` file to enable runtime compilation

```javascript
module.exports = { runtimeCompiler: true }
```

For those using webpack you will need to set this option in your `webpack.config.js` file to enable esm bundling.

```javascript
resolve: {
  alias: {
    vue: 'vue/dist/vue.esm-bundler.js',
  },
},
```

🔒 if you are using Vue 2.x, please keep using version `1.x`;

A Vue.js component to generate [QRCode](https://en.wikipedia.org/wiki/QR_code).

[![Build Status](https://travis-ci.org/scopewu/qrcode.vue.svg?branch=master)](https://travis-ci.org/scopewu/qrcode.vue)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)

[中文](./README-zh_cn.md)

## install

the `qrcode.vue` component can use in you Vue.js app.

```bash
npm install --save qrcode.vue # yarn add qrcode.vue
```

```
dist/
|--- qrcode.vue.cjs.js         // CommonJS
|--- qrcode.vue.esm.js         // ES module
|--- qrcode.vue.browser.js     // IIFE for browser
|--- qrcode.vue.browser.min.js // IIFE Minimum size for browser 
```

## Usage

e.g.

```javascript
import Vue from 'vue'
import QrcodeVue from 'qrcode.vue'

new Vue({
  el: '#root',
  data: {
    value: 'https://example.com',
  },
  template: '<qrcode-vue :value="value"></qrcode-vue>',
  components: {
    QrcodeVue,
  },
})
```

Or single-file components with a `*.vue` extension:

```html
<template>
  <div>
    <qrcode-vue :value="value" :size="size" level="H"></qrcode-vue>
  </div>
</template>
<script>
  import QrcodeVue from 'qrcode.vue'

  export default {
    data() {
      return {
        value: 'https://example.com',
        size: 300,
      }
    },
    components: {
      QrcodeVue,
    },
  }
</script>
```

## Component props

### value

- Type: `string`
- Default: `''`

The value content of qrcode

### level

- Type: `string`
- Default: `H`

qrcode Error correction level (one of 'L', 'M', 'Q', 'H'). Know more, [wikipedia: QR_code](https://en.wikipedia.org/wiki/QR_code#Error_correction)

### size

- Type: `number`
- Default: `100`

The size of qrcode element.

### margin

- Type: `number`
- Default: `0`

Define how much wide the quiet zone should be.

### renderAs

- Type: `string`
- Default: `canvas`

Generate QRcode as `canvas` or `svg`.

### background

- Type: `string`
- Default: `#ffffff`

The background color of qrcode.

### foreground

- Type: `string`
- Default: `#000000`

The foreground color of qrcode.

### class

- Type: `string`
- Default: `''`

The class name of qrcode element.

## License

copyright &copy; 2021 @scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)
