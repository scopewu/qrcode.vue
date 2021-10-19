declare module 'qr.js/lib/QRCode.js'
declare module 'qr.js/lib/ErrorCorrectLevel.js'

// shims-vue.d.ts
declare module '*.vue' {
  import { Component } from 'vue'
  const component: Component
  export default component
}
