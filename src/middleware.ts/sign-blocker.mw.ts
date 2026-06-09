import { Next, type Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

export const signBlockerMiddleware = createMiddleware(async (c: Context, next: Next) => {
  // 리프레시 받아와
  const refTknCookie = getCookie(c, 'refresh_token')

  // 리프레시 없어?
  // -> 미로그인 상태니까 로그인 시켜
  // -> 로그인 상태니까 리프레시
  if (!refTknCookie) {
    return await next()
  }

  return c.redirect('/api/auth/v1/refresh', 302)
})
