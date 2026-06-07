import { Hono } from 'hono'
import { html } from 'hono/html';

const testRoute = new Hono()

testRoute.get('/x', (c) => {
  return c.html(
    html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" />
        <link rel="stylesheet" href="/out.css" />
        <title>테스트 페이지</title>
      </head>
      <body>
        <span class="nes-text is-primary">Primary</span>
        <span class="nes-text is-success">Success</span>
        <span class="nes-text is-warning">Warning</span>
        <span class="nes-text is-error">Error</span>
        <span class="nes-text is-disabled">Disabled</span>
      </body>
    </html>,
    `
  )
})

export default testRoute
