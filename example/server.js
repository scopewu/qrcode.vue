import http from 'http'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import QrcodeVue from '../dist/qrcode.vue.esm.js'

const PORT = process.env.PORT ?? 3000

const app = createSSRApp({
  data: () => ({ value: 'Hello QrcodeVue', size: 100 }),
  components: { QrcodeVue },
  template: '<QrcodeVue :value="value" :size="size" render-as="svg" />',
});

http.createServer(async (request, response) => {
  const _html = await renderToString(app)

  const html = `
    <!DOCTYPE html>
    <html lang='en'>
      <head>
      <meta charset='utf-8'>
        <title>Qrcode.vue SSR Example</title>
      </head>
      <body>
        <div>${_html}</div>
      </body>
    </html>
    `

  response.writeHead(200, {
    'Content-Type': 'text/html',
  })

  response.end(html)
}).listen(PORT)

console.log(`The server running at http://localhost:${PORT}`)
