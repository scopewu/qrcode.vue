# qrcode.vue

⚠️ 如果你正在使用 Vue 3，请升级 `qrcode.vue` 到 `3.x`;

🔒 如果你正在使用 Vue 2，请保持 `qrcode.vue` 的版本为 `1.x`;

一款 Vue.js 二维码组件.

[![Build Status](https://travis-ci.org/scopewu/qrcode.vue.svg?branch=master)](https://travis-ci.org/scopewu/qrcode.vue)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)

## 快速开始

快速添加 `qrcode.vue` 组件到项目中

```bash
npm install --save qrcode.vue # yarn add qrcode.vue
```

## 使用

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

或者，在独有单文件扩展 `*.vue` 中使用：

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

二维码的内容值。

### level

- Type: `string`
- Default: `L`

二维码的容错能力等级，取值为 'L', 'M', 'Q', 'H' 之一。了解更多，[维基百科：QR_code](https://en.wikipedia.org/wiki/QR_code#Error_correction)。

### size

- Type: `number`
- Default: `100`

二维码大小。

### renderAs

- Type: `string`
- Default: `canvas`

生成二维码的 HTML 标签，可选 `canvas` 或 `svg`。

### background

- Type: `string`
- Default: `#ffffff`

二维码背景颜色。

### foreground

- Type: `string`
- Default: `#000000`

二维码前景颜色。

### class

- Type: `string`
- Default: `''`

传递给二维码根元素的类名。

## 软件许可

copyright &copy; 2017 scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)
