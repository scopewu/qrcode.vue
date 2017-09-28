# qrcode.vue
一款 Vue.js 二维码组件.

[![Build Status](https://travis-ci.org/scopewu/qrcode.vue.svg?branch=master)](https://travis-ci.org/scopewu/qrcode.vue)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)

## 快速开始
快速添加 `qrcode.vue` 组件到 app 中
```bash
npm install --save qrcode.vue # yarn add qrcode.vue
```

## 使用例子
e.g.
```javascript
import Vue from 'vue';
import QrcodeVue from 'qrcode.vue';

new Vue({
  el: '#root',
  data: {
    value: 'https://example.com'
  },
  template: '<qrcode-vue :value="value"></qrcode-vue>',
  components: {
    QrcodeVue
  }
})
```
或者，在独有单文件扩展 *.vue 中使用：
```html
<template>
<div>
  <qrcode-vue :value="value" :size="size" level="H"></qrcode-vue>
</div>
</template>
<script>
import QrcodeVue from 'qrcode.vue';

export default {
  data() {
    return {
      value: 'https://example.com',
      size: 300
    }
  },
  components: {
    QrcodeVue
  }
}
</script>
```

## Component props

| 属性 | 类型 | 默认值 | 属性描述 |
|------|------|--------------|---------|
| value | String |`''`| qrcode value |
| className | String |`''`| qrcode element className |
| size | Number |`100`| qrcode element size |
| level | String |`L`| Error correction level ('L', 'M', 'Q', 'H') |
| background | String |`#fff`| qrcode background color|
| foreground | String |`#000`| qrcode color|

## 参考代码
["qr.js"](https://github.com/defunctzombie/qr.js) ["qrcode.react"](https://github.com/zpao/qrcode.react)

## 软件许可
copyright &copy; 2017 scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)