---
name: qrcode-vue
description: Generate QR codes in Vue 3 apps with the qrcode.vue component library. Use this skill whenever the user wants to render, style, or download a QR code in Vue — including QR with a logo/image, gradient or rounded modules, SVG vs canvas output, SSR/Nuxt usage, or TypeScript typing — even if they don't name the library explicitly.
---

# qrcode.vue

A Vue.js component to generate QR codes. Version 3.x targets **Vue 3 only** (Vue 2 apps must use qrcode.vue 1.x). Peer dependency: `vue@^3.0.0`. No other runtime dependencies.

## Install

```bash
npm install --save qrcode.vue   # or: yarn add qrcode.vue
```

## Exports

```ts
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'
import type { Level, RenderAs, GradientType, ImageSettings } from 'qrcode.vue'
```

- `QrcodeVue` (default) — switches between canvas and SVG via the `render-as` prop.
- `QrcodeCanvas` / `QrcodeSvg` (named) — single-renderer components. Prefer these when the renderer is fixed.

CommonJS / CDN note: exports are named since 3.5 — use `require('qrcode.vue').default` or `QrcodeVue.default` when loading the UMD bundle.

## Props

All three components share these props (`render-as` exists only on `QrcodeVue`):

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | `string` | `''` | **Required.** QR content. |
| `size` | `number` | `100` | Element size in px. |
| `render-as` | `'canvas' \| 'svg'` | `'canvas'` | `QrcodeVue` only. Use `'svg'` for SSR. |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'L'` | Error correction. Use `'H'` when embedding a logo. |
| `background` | `string` | `'#fff'` | Background color. |
| `foreground` | `string` | `'#000'` | Module color (ignored when `gradient` is on). |
| `margin` | `number` | `0` | Quiet-zone width in modules, `>= 0`. |
| `radius` | `number` | `0` | Module corner radius, `0`–`0.5`. `0.5` = circular modules. Inner corners between adjacent modules stay sharp. |
| `gradient` | `boolean` | `false` | Enable gradient fill. |
| `gradient-type` | `'linear' \| 'radial'` | `'linear'` | Gradient direction type. |
| `gradient-start-color` | `string` | `'#000'` | Gradient start. |
| `gradient-end-color` | `string` | `'#fff'` | Gradient end. |
| `image-settings` | `ImageSettings` | `{}` | Embedded logo, see below. |
| `id` | `string` | `undefined` | ID base for internal SVG defs. Pass `useId()` (Vue 3.5+) for SSR hydration safety. |

```ts
type ImageSettings = {
  src: string                                          // image URL
  x?: number; y?: number                               // offset; centered when omitted
  height?: number; width?: number                      // default: 10% of `size`
  excavate?: boolean                                   // clear modules behind the image
  borderRadius?: number
  crossOrigin?: 'anonymous' | 'use-credentials' | ''   // required to export canvas with a cross-origin logo
}
```

## Template ref methods

Expose `toDataURL` and `download` on all components (`QrcodeVue` forwards to the active renderer):

```html
<script setup>
import { ref } from 'vue'
import { QrcodeCanvas } from 'qrcode.vue'

const qrRef = ref()
const save = () => qrRef.value?.download('qrcode.png')
</script>

<template>
  <qrcode-canvas ref="qrRef" value="https://example.com" />
  <button @click="save">Download</button>
</template>
```

- Canvas: `toDataURL(type?, quality?)`, `download(filename?)` → PNG.
- SVG: `toDataURL()`, `download(filename?)` → SVG.

## Recipes

QR with a centered logo — always raise `level` so the code stays scannable:

```html
<qrcode-svg
  value="https://example.com"
  :size="300"
  level="H"
  :image-settings="{ src: logoUrl, width: 60, height: 60, excavate: true, borderRadius: 8 }"
/>
```

Gradient + rounded modules:

```html
<qrcode-vue
  value="https://example.com"
  render-as="svg"
  gradient
  gradient-type="radial"
  gradient-start-color="#000000"
  gradient-end-color="#38bdf8"
  :radius="0.35"
/>
```

SSR / Nuxt — render as SVG and pass a stable `id`:

```html
<script setup>
import { useId } from 'vue'
import { QrcodeSvg } from 'qrcode.vue'
const uid = useId() // Vue 3.5+; on older versions pass any unique string
</script>

<template>
  <qrcode-svg value="https://example.com" :id="uid" />
</template>
```

## Pitfalls

- **Vue 2**: do not use 3.x — install `qrcode.vue@1.x`.
- **Tainted canvas**: with a cross-origin logo, set `imageSettings.crossOrigin: 'anonymous'` and ensure the image server sends `Access-Control-Allow-Origin`, or `toDataURL`/`download` throws `SecurityError`.
- **SSR hydration**: without an explicit `id`, internal SVG IDs come from a module-level counter and can mismatch between server and client. Always pass `useId()` under SSR.
- **Scannability**: keep contrast high between `foreground`/`gradient` and `background`; a logo covering too much area breaks scanning even at level `H`.
- **Multiple instances with gradients**: `id` keeps each SVG's `<defs>` unique; collisions cause one QR's gradient to leak into another.
