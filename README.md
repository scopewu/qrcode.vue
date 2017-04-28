# qrcode.vue
A Vue component for QRCode.

## Start quick
the `qrcode.vue` component can use in you Vue app.
```bash
npm install --save qrcode.vue
```

## Usage
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
Or single-file components with a *.vue extension:
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

| prop | type | default value | expain |
|------|------|--------------|---------|
|`value`|`String`|`''`| qrcode value |
|`className`|`String`|`''`| qrcode element className |
|`size`|`Number`|`100`| qrcode element size |
|`level`|`String`|`L`| Error correction level ('L', 'M', 'Q', 'H') |
|`background`|`String`|`#fff`| qrcode background color|
|`foreground`|`String`|`#000`| qrcode color|

## thanks
["qr.js"](https://github.com/defunctzombie/qr.js) ["qrcode.react"](https://github.com/zpao/qrcode.react)

## License
[MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)