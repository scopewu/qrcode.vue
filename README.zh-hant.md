# qrcode.vue

⚠️ 如果你正在使用 Vue 3，請升級 `qrcode.vue` 到 `3.x`;

🔒 如果你正在使用 Vue 2，請保持 `qrcode.vue` 的版本爲 `1.x`;

一款 Vue.js 二維碼組件(QR Code)，同時支援 Vue 2 和 Vue 3.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/main/LICENSE)

## 快速開始

快速添加 `qrcode.vue` 組件到項目中

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

或者，在獨有單文件擴展 `*.vue` 中使用：

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
    :gradient="gradient"
    :gradient-type="gradientType"
    :gradient-start-color="gradientStartColor"
    :gradient-end-color="gradientEndColor"
    :image-settings='imageSettings'
    :radius="radius"
  />
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import QrcodeVue from 'qrcode.vue'
  import type { Level, RenderAs, GradientType, ImageSettings } from 'qrcode.vue'

  const value = ref('qrcode')
  const level = ref<Level>('M')
  const renderAs = ref<RenderAs>('svg')
  const background = ref('#ffffff')
  const foreground = ref('#000000')
  const margin = ref(0)
  
  // 可傳入二維碼圖片相關的屬性，支持二維碼 LOGO；
  const imageSettings = ref<ImageSettings>({
    src: 'https://github.com/scopewu.png',
    width: 30,
    height: 30,
    // x: 10,
    // y: 10,
    excavate: true,
    // crossOrigin: 'anonymous', // 如需把 canvas 導出為圖片，請設置此項。
  })

  // 可傳入漸變相關的屬性，支持漸變：
  const gradient = ref(false)
  const gradientType = ref<GradientType>('linear')
  const gradientStartColor = ref('#000000')
  const gradientEndColor = ref('#38bdf8')
  // 可傳入圓角半徑：
  const radius = ref(0)
</script>
```

## Component props

### `value`

- 類型：`string`
- 默認值：`''`

二維碼的內容值。

### `size`

- 類型：`number`
- 默認值：`100`

二維碼大小。

### `render-as`

- 類型：`RenderAs('canvas' | 'svg')`
- 默認值：`canvas`

生成二維碼的 HTML 標籤，可選 `canvas` 或 `svg`。其中 `svg` 可以用於 SSR。

### `margin`

- 類型：`number`
- 默認值：`0`

定義空白區的寬度應該是多少。

### `level`

- 類型：`Level('L' | 'M' | 'Q' | 'H')`
- 默認值：`L`

二維碼的容錯能力等級，取值爲 'L', 'M', 'Q', 'H' 之一。瞭解更多，[維基百科：QR_code](https://en.wikipedia.org/wiki/QR_code#Error_correction)。

### `background`

- 類型：`string`
- 默認值：`#ffffff`

二維碼背景顏色。

### `foreground`

- 類型：`string`
- 默認值：`#000000`

二維碼前景顏色。

### `image-settings`

- 類型: `ImageSettings`
- 默認值: `{}`

  ```ts
  export type ImageSettings = {
    src: string, // 圖片的地址。
    x?: number,  // 水平橫向偏移。沒有設定值時，圖片劇中
    y?: number,  // 垂直豎向偏移。沒有設定值時，圖片劇中
    height: number, // 圖片的高度
    width: number,  // 圖片的寬度
    // 是否“挖掘”圖像周圍的模塊。
    // 這意味着嵌入圖像重疊的任何模塊都將使用背景顏色。
    // 使用此選項可確保圖像周圍的邊緣清晰。嵌入透明圖像時也很有用。
    excavate?: boolean,
    borderRadius?: number, // 圖片的邊框圓角。
    crossOrigin?: 'anonymous' | 'use-credentials' | '', // 圖片的 CORS 屬性。如需導出 canvas 為圖片，請設置此項。
  }
  ```

二維碼圖片 logo 配置。

### `radius`

- 類型：`number`
- 默認值：`0`

每個二維碼模塊的圓角半徑，相對於模塊寬度的比例。接受 `0` 到 `0.5` 的值。

- `0`（默認）- 方形模塊，直角
- `0.5` - 最大圓角，模塊變爲圓形

圓角是上下文感知的：相鄰深色模塊之間的內角保持直角，外角則圓角化。

```html
<qrcode-vue value="test" :radius="0.35" />
```

### `id`

- 類型：`string`
- 默認值：`undefined`

自定義 SVG 內部元素（漸變、裁剪路徑）的 ID。SSR 水合一致性需要此屬性 — 傳入 `useId()` 以確保服務端和客戶端生成匹配的 ID。

```html
<script setup>
  // 僅 vue 3.5+
  import { useId } from 'vue'
  const uid = useId()

  // vue 3.4 及以下版本
  // const uid = 'qrcode-1'
  // const uid2 = 'qrcode-2'
</script>
<qrcode-svg value="test" :id="uid" render-as="svg" />
```

省略時使用模塊級計數器，該計數器在多請求的 SSR 環境中不安全。

### `gradient`

- 類型: `boolean`
- 默認值: `false`

啓用二維碼的漸變填充。

### `gradient-type`

- 類型: `GradientType('linear' | 'radial')`
- 默認值: `linear`

指定漸變類型。

### `gradient-start-color`

- 類型: `string`
- 默認值: `#000000`

漸變的起始顏色。

### `gradient-end-color`

- 類型: `string`
- 默認值: `#ffffff`

漸變的結束顏色。

### `class`

- 類型：`string`
- 默認值：`''`

傳遞給二維碼根元素的類名。

## 模板 Ref 方法（`QrcodeCanvas` / `QrcodeSvg`）

`QrcodeCanvas` 與 `QrcodeSvg` 都透過模板 ref 暴露以下方法。`QrcodeVue` 會根據目前的 `render-as` 轉發這些方法。

### `QrcodeCanvas`

```html
<script setup>
import { ref } from 'vue'
import { QrcodeCanvas } from 'qrcode.vue'

const qrRef = ref()
const handleDownload = () => {
  qrRef.value?.download('my-qrcode.png')
}
</script>

<qrcode-canvas ref="qrRef" value="https://example.com" />
```

| 方法 | 簽名 | 說明 |
|------|------|------|
| `toDataURL` | `(type?: string, quality?: number) => string \| undefined` | 將 canvas 轉換為 Data URL。 |
| `download` | `(filename?: string) => void` | 觸發下載二維碼 PNG 圖片。 |

> **CORS 注意：** 當二維碼包含跨域 Logo 圖片時，請確保設置 `imageSettings.crossOrigin: 'anonymous'`，且圖片伺服器返回 `Access-Control-Allow-Origin` 響應頭。否則 canvas 會被「污染」，導致 `toDataURL` / `download` 拋出 `SecurityError`。

### `QrcodeSvg`

```html
<script setup>
import { ref } from 'vue'
import { QrcodeSvg } from 'qrcode.vue'

const qrRef = ref()
const handleDownload = () => {
  qrRef.value?.download('my-qrcode.svg')
}
</script>

<qrcode-svg ref="qrRef" value="https://example.com" />
```

| 方法 | 簽名 | 說明 |
|------|------|------|
| `toDataURL` | `() => string \| undefined` | 將 SVG 元素轉換為 Data URL。 |
| `download` | `(filename?: string) => void` | 觸發下載二維碼 SVG 圖片。 |

## `QrcodeVue` 3.5+

`QrcodeVue` 3.5+ 後導出獨立的 `QrcodeCanvas` 和 `QrcodeSvg` 組件，爲此修改了 rollup 的配置：

```
// rollup.config.js

-    exports: 'default',
+    exports: 'named',
```

現在在 common.js 和 cdn 直接引用 `QrcodeVue` 需要使用 `default` 字段：

```js
const QrcodeVue = require('qrcode.vue').default
const { default: QrcodeVue, QrcodeCanvas, QrcodeSvg } = require('qrcode.vue')
```

```html
<!--With HTML-->
<div id="root">
  <p class="flex space-x">
  <qrcode-vue :value="test" render-as="svg"></qrcode-vue>
  <qrcode-canvas :value="test"></qrcode-canvas>
  </p>
<p><input v-model="test" /></p>
</div>
<script src="https://cdn.jsdelivr.net/npm/vue@3.5/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode.vue@3.5/dist/qrcode.vue.browser.min.js"></script>

<script>
Vue.createApp({
  data() { return {
    test: 'Hello World',
  }},
  components: {
    QrcodeVue: QrcodeVue.default,
    QrcodeCanvas: QrcodeVue.QrcodeCanvas,
  },
}).mount('#root')
</script>
```

## 軟件許可

copyright &copy; 2021 scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/main/LICENSE)
