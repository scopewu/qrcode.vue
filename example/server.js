import http from 'node:http'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { QrcodeSvg } from '../dist/qrcode.vue.esm.js'

const PORT = process.env.PORT ?? 3000

http
  .createServer(async (_request, response) => {
    try {
      // Use a separate app instance for each request to avoid shared SSR state.
      const app = createSSRApp({
        render: () =>
          h(QrcodeSvg, {
            value: 'Hello QrcodeVue',
            size: 100,
          }),
      })

      const qrCode = await renderToString(app)

      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      })

      response.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Qrcode.vue SSR Example</title>
</head>
<body>
  <div>${qrCode}</div>
</body>
</html>`)
    } catch (error) {
      console.error(error)
      response.writeHead(500, {
        'Content-Type': 'text/plain; charset=utf-8',
      })
      response.end('Internal Server Error')
    }
  })
  .listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`)
  })
