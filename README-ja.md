# qrcode.vue

⚠️ 現在、Vue 3.xを使用している場合は、`qrcode.vue` を`3.x`にアップグレードしてください。

🔒 Vue 2.xを使用している場合は、バージョン `1.x` を使用し続けてください。

[QRコード](https://en.wikipedia.org/wiki/QR_code)を生成するための Vue.js コンポーネントです。Vue 2 と Vue 3 の両方をサポートしています。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/main/LICENSE)

[English](./README.md)

## インストール

`qrcode.vue`コンポーネントを Vue.js アプリに使用できます。

```bash
npm install --save qrcode.vue # yarn add qrcode.vue
```

```
dist/
|--- qrcode.vue.cjs.js         // CommonJS
|--- qrcode.vue.esm.js         // ESモジュール
|--- qrcode.vue.browser.js     // ブラウザまたはrequire.jsまたはCommonJS用のUMD
|--- qrcode.vue.browser.min.js // 最小サイズのUMD
```

## 使用方法

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

または、`*.vue` 拡張子の単一ファイルコンポーネントで使用します：

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

Vue 3で `TypeScript` を使用する場合：

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
  
  // 画像の設定
  const imageSettings = ref<ImageSettings>({
    src: 'https://github.com/scopewu.png',
    width: 30,
    height: 30,
    // x: 10,
    // y: 10,
    excavate: true,
  })

  // グラデーション
  const gradient = ref(false)
  const gradientType = ref<GradientType>('linear')
  const gradientStartColor = ref('#000000')
  const gradientEndColor = ref('#38bdf8')
</script>
```

## コンポーネントプロパティ

### `value`

- タイプ：`string`
- デフォルト：`''`

QRコードの内容。

### `size`

- タイプ：`number`
- デフォルト：`100`

QRコード要素のサイズ。

### `render-as`

- タイプ：`RenderAs('canvas' | 'svg')`
- デフォルト：`canvas`

`canvas`または`svg`としてQRコードを生成します。`svg`プロパティはSSRで動作します。

### `margin`

- タイプ：`number`
- デフォルト：`0`

静かなゾーンの幅を定義します。

### `level`

- タイプ：`Level('L' | 'M' | 'Q' | 'H')`
- デフォルト：`H`

QRコードの誤り訂正レベル（'L'、'M'、'Q'、'H'のいずれか）。詳細については、[wikipedia: QR_code](https://en.wikipedia.org/wiki/QR_code#Error_correction)を参照してください。

### `background`

- タイプ：`string`
- デフォルト：`#ffffff`

QRコードの背景色。

### `foreground`

- タイプ：`string`
- デフォルト：`#000000`

QRコードの前景色。

### `image-settings`

- タイプ: `ImageSettings`
- デフォルト: `{}`

  ```ts
  export type ImageSettings = {
    src: string, // The URL of image.
    x?: number,  // The horizontal offset. When not specified, will center the image.
    y?: number,  // The vertical offset. When not specified, will center the image.
    height: number, // The height of image
    width: number,  // The height of image
    excavate?: boolean, // Whether or not to "excavate" the modules around the image.
  }
  ```

The settings to support qrcode image logo.

### `gradient`

- タイプ：`boolean`
- デフォルト：`false`

QRコードのグラデーション塗りつぶしを有効にします。

### `gradient-type`

- タイプ：`GradientType('linear' | 'radial')`
- デフォルト：`linear`

グラデーションの種類を指定します。

### `gradient-start-color`

- タイプ：`string`
- デフォルト：`#000000`

グラデーションの開始色。

### `gradient-end-color`

- タイプ：`string`
- デフォルト：`#ffffff`

グラデーションの終了色。

### `class`

- タイプ：`string`
- デフォルト：`''`

QRコード要素のクラス名。

## `QrcodeVue` 3.5+

`QrcodeVue` 3.5+ exports separate `QrcodeCanvas` and `QrcodeSvg` components, for which the rollup configuration has been modified:

```
// rollup.config.js

-    exports: 'default',
+    exports: 'named',
```

Direct references to `QrcodeVue` in common.js and cdn now require the `default` field:

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

## ライセンス

copyright &copy; 2021 @scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/main/LICENSE)
