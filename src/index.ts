import { Hono } from 'hono'
import oauthApi from './apis/oauth.api'
import { JwtVariables } from 'hono/jwt'
import signApi, { User } from './apis/sign.api'

export type Variable = {
  JwtVariables: JwtVariables
  acsTknPayload: AccessTokenPayload
  refTknPayload: RefreshTokenPayload
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

app.route('/api/oauth', oauthApi)
app.route('/api/auth', signApi)

export default app
