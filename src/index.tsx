import { Hono, type Context } from 'hono'
import oauthApi from './apis/oauth.api'
import { JwtVariables } from 'hono/jwt'
import signApi, { User } from './apis/sign.api'
import { indexRoute } from './routes/index.route'
import { jsxRenderer } from 'hono/jsx-renderer'
import { signRoute } from './routes/sign.route';
import { userRoute } from './routes/user.route';

export type Variable = {
  JwtVariables: JwtVariables
  acsTknPayload: AccessTokenPayload
  refTknPayload: RefreshTokenPayload
  routePageTitle: string
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
  REFRESH_TOKEN_SECRET: string
  ACCESS_TOKEN_SECRET: string
}

const app = new Hono<{ Bindings: Binding; Variables: Variable }>()

export interface AccessTokenPayload {
  user: User
  exp: number // 15분 뒤
}

export interface RefreshTokenPayload {
  user_id: number
  exp: number
  jti: string
}

app.use(
  '*',
  jsxRenderer(({ children }, c: Context) => {
    const title = c.get('routePageTitle') ?? 'haru'

    return (
      <html lang="kr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.scss" />
        <title>{title}</title>
      </head>
      <body>
        {children}
      </body>
      </html>
    )
  }, { docType: true }),
)

app.route('/', indexRoute)
app.route('/', userRoute)
app.route('sign', signRoute)

app.route('/api/oauth', oauthApi)
app.route('/api/auth', signApi)

export default app
