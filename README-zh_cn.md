# qrcode.vue

⚠️ 如果你正在使用 Vue 3，请升级 `qrcode.vue` 到 `3.x`;

🔒 如果你正在使用 Vue 2，请保持 `qrcode.vue` 的版本为 `1.x`;

一款 Vue.js 二维码组件，同时支持 Vue 2 和 Vue 3.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)

## 快速开始

快速添加 `qrcode.vue` 组件到项目中

```bash
npm install --save qrcode.vue # yarn add qrcode.vue
```

```
dist/
|--- qrcode.vue.cjs.js         // CommonJS
|--- qrcode.vue.esm.js         // ES module
|--- qrcode.vue.browser.js     // UMD for browser or require.js or CommonJS
|--- qrcode.vue.browser.min.js // UMD Minimum size
```

## 使用

e.g.

```javascript
import { createApp } from 'vue'
import QrcodeVue from 'qrcode.vue'

createApp({
  data: {
    value: 'https://example.com',
  },
  template: '<qrcode-vue :value="value"></qrcode-vue>',
  components: {
    QrcodeVue,
  },
}).mount('#root')
```

或者，在独有单文件扩展 `*.vue` 中使用：

```html
<template>
  <qrcode-vue :value="value" :size="size" level="H" />
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

在 Vue 3 中配合 `TypeScript` 使用：

```html
<template>
  <qrcode-vue
    :value="value"
    :level="level"
    :render-as="renderAs"
    :background="background"
    :foreground='foreground'
    :image-settings='imageSettings'
  />
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import QrcodeVue from 'qrcode.vue'
  import type { Level, RenderAs, ImageSettings } from 'qrcode.vue'

  const value = ref('qrcode')
  const level = ref<Level>('M')
  const renderAs = ref<RenderAs>('svg')
  const background = ref('#ffffff')
  const foreground = ref('#000000')
  const margin = ref(0)
  const imageSettings = ref<ImageSettings>({
    src: 'https://github.com/scopewu.png',
    width: 30,
    height: 30,
    // x: 10,
    // y: 10,
    excavate: true,
  })
</script>
```

## Component props

### `value`

- 类型：`string`
- 默认值：`''`

二维码的内容值。

### `size`

- 类型：`number`
- 默认值：`100`

二维码大小。

### `render-as`

- 类型：`RenderAs('canvas' | 'svg')`
- 默认值：`canvas`

生成二维码的 HTML 标签，可选 `canvas` 或 `svg`。其中 `svg` 可以用于 SSR。

### `margin`

- 类型：`number`
- 默认值：`0`

定义空白区的宽度应该是多少。

### `level`

- 类型：`Level('L' | 'M' | 'Q' | 'H')`
- 默认值：`L`

二维码的容错能力等级，取值为 'L', 'M', 'Q', 'H' 之一。了解更多，[维基百科：QR_code](https://en.wikipedia.org/wiki/QR_code#Error_correction)。

### `background`

- 类型：`string`
- 默认值：`#ffffff`

二维码背景颜色。

### `foreground`

- 类型：`string`
- 默认值：`#000000`

二维码前景颜色。

### `image-settings`

- 类型: `ImageSettings`
- 默认值: `{}`

  ```ts
  export type ImageSettings = {
    src: string, // 图片的地址。
    x?: number,  // 水平横向偏移。没有设定值时，图片剧中
    y?: number,  // 垂直竖向偏移。没有设定值时，图片剧中
    height: number, // 图片的高度
    width: number,  // 图片的宽度
    // 是否“挖掘”图像周围的模块。
    // 这意味着嵌入图像重叠的任何模块都将使用背景颜色。
    // 使用此选项可确保图像周围的边缘清晰。嵌入透明图像时也很有用。
    excavate?: boolean,
  }
  ```

二维码图片 logo 配置。

### `class`

- 类型：`string`
- 默认值：`''`

传递给二维码根元素的类名。

## 软件许可

copyright &copy; 2021 scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/main/LICENSE)
