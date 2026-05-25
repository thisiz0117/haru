import { Hono } from 'hono'

export type Binding = {
  GOOGLE_AUTH_CLIENT: string
  GOOGLE_AUTH_SECRET: string
  GOOGLE_REDIRECT_URI: string
  COOKIE_SECRET: string
  DB_ROOT_URL: string
  DB_USER_URL: string
  DB_ADMIN_URl: string
}

const app = new Hono<{ Bindings: Binding }>()

export default app
