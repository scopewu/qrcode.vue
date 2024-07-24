# qrcode.vue

⚠️ 現在、Vue 3.xを使用している場合は、`qrcode.vue`を`3.x`にアップグレードしてください。

🔒 Vue 2.xを使用している場合は、バージョン`1.x`を使用し続けてください。

[QRコード](https://en.wikipedia.org/wiki/QR_code)を生成するためのVue.jsコンポーネントです。Vue 2とVue 3の両方をサポートしています。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)

[English](./README.md)

## インストール

`qrcode.vue`コンポーネントをVue.jsアプリに使用できます。

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

例：

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

または、`*.vue`拡張子の単一ファイルコンポーネントで使用します：

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

Vue 3で`TypeScript`を使用する場合：

```html
<template>
  <qrcode-vue :value="value" :level="level" :render-as="renderAs" />
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import QrcodeVue from 'qrcode.vue'
  import type { Level, RenderAs } from 'qrcode.vue'

  const value = ref('qrcode')
  const level = ref<Level>('M')
  const renderAs = ref<RenderAs>('svg')
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

### `class`

- タイプ：`string`
- デフォルト：`''`

QRコード要素のクラス名。

## ライセンス

copyright &copy; 2021 @scopewu, license by [MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)
