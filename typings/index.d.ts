declare module 'qr.js'

// shims-vue.d.ts
declare module '*.vue' {
  import { Component } from 'vue'
  const component: Component
  export default component
}
