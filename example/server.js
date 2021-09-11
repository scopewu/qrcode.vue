const http = require('http')
const { createSSRApp } = require('vue')
const { renderToString } = require('@vue/server-renderer')
const QrcodeVue = require('../dist/qrcode.vue.cjs')

const app = createSSRApp({
  components: { QrcodeVue },
  template: '<QrcodeVue value="123" :size="100" render-as="svg" />',
});

http.createServer(async (request, response) => {
  const html = await renderToString(app)

  response.writeHead(200, {
    'Content-Type': 'text/html',
  })

  response.end(html)
}).listen(process.env.PORT || 3000)

console.log('The server running at http: localhost:3000')
