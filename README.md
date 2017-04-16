# qrcode.vue
A Vue component for QR_code.

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
    value: 'https://example'
  },
  template: `<qrcode-vue :value="value"></qrcode-vue>`,
  components: {
    QrcodeVue
  }
})
```

## Component props

| prop | type | default value | expain |
|------|------|--------------|---------|
|`value`|`String`|`''`| qrcode value |
|`className`|`String`|`''`| qrcode element className |
|`size`|`Number`|`100`| qrcode element size |
|`level`|`String`|`L`| error level |
|`background`|`String`|`#fff`| qrcode background color|
|`foreground`|`String`|`#000`| qrcode color|

## thanks
["qr.js"](https://github.com/defunctzombie/qr.js) ["qrcode.react"](https://github.com/zpao/qrcode.react)

## License
[MIT](https://github.com/scopewu/qrcode.vue/blob/master/LICENSE)