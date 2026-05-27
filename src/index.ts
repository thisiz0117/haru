import { Hono } from 'hono'
import oauthApi from './apis/oauth.api'
import { jwt, JwtVariables } from 'hono/jwt';
import signRoute from './routes/sign.route';
import signApi from './apis/sign.api';


type Variable = {
  JwtVariables: JwtVariables
}

export type Binding = {
  GOOGLE_AUTH_CLIENT: string
  GOOGLE_AUTH_SECRET: string
  GOOGLE_REDIRECT_URI: string
  COOKIE_SECRET: string
  JWT_SECRET: string
  DB_ROOT_URL: string
  DB_USER_URL: string
  DB_ADMIN_URl: string
  BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Binding, Variables: Variable }>()

// app.use('*', (c, next) => {
//   const jwtMiddleware = jwt({
//     secret: c.env.JWT_SECRET,
//     alg: 'HS256'
//   })
//   return jwtMiddleware(c, next)
// })

app.route('/api/oauth', oauthApi)
app.route('/api/auth', signApi)
app.route('/', signRoute)

app.get('/', (c) => {
  return c.html(
    `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <a href="/api/oauth/v1/google">google login</a>
    </body>
    </html>
    `,
  )
})

export default app
