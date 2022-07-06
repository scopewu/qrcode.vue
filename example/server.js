const http = require('http')
const { createSSRApp } = require('vue')
const { renderToString } = require('vue/server-renderer')
const QrcodeVue = require('../dist/qrcode.vue.cjs')

const PORT = process.env.PORT || 3000

const app = createSSRApp({
  data: () => ({ value: 'Hello QrcodeVue', size: 100 }),
  components: { QrcodeVue },
  template: '<QrcodeVue :value="value" :size="size" render-as="svg" />',
});

http.createServer(async (request, response) => {
  const _html = await renderToString(app)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
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

console.log(`The server running at http: localhost:${PORT}`)
