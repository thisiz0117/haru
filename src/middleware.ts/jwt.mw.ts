import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { decode, verify } from 'hono/jwt'

export const strictJwtMiddleware = createMiddleware(async (c: Context, next: Next) => {
  // 토큰받아와
  const acsTknCookie = getCookie(c, 'access_token')
  const refTknCookie = getCookie(c, 'refresh_token')
  const redirect = c.req.url

  // 리다이렉트 url 처리해
  const redirectUrl = new URL('http://localhost:8787/api/auth/v1/refresh')
  if (redirect) redirectUrl.searchParams.set('r', redirect)

  // 액세스토큰 없냐
  if (!acsTknCookie) {
    // 그럼 리프레시 토큰도 없냐
    if (!refTknCookie) {
      return c.redirect('/sign/in', 302)
    }

    // 리프레시 토큰은 유효하냐
    try {
      await verify(refTknCookie!, c.env.REFRESH_TOKEN_SECRET, 'HS256')
    } catch (e) {
      return c.redirect('/api/auth/v1/logout', 302)
    }

    // acsTkn 다시받아와라
    return c.redirect(redirectUrl, 302)
  }

  // 다 유효하냐
  // 유효하니 라우트 안에서 정보 꺼내쓰게 set 해서 줘라
  try {
    c.set('acsTknPayload', await verify(acsTknCookie!, c.env.ACCESS_TOKEN_SECRET, 'HS256'))
    c.set('refTknPayload', await verify(refTknCookie!, c.env.REFRESH_TOKEN_SECRET, 'HS256'))
  } catch (e) {
    return c.json({ msg: 'failed refTkn & acsTkn verify' })
  }

  // 라우트 이동
  return await next()
})

export const optionalJwtMiddleware = createMiddleware(async (c: Context, next: Next) => {
  // 토큰받아와
  const acsTknCookie = getCookie(c, 'access_token')
  const refTknCookie = getCookie(c, 'refresh_token')

  // acsTkn 있으면 set
  if (acsTknCookie) {
    c.set('acsTknPayload', decode(acsTknCookie))
  }

  // refTkn 있으면 set
  if (refTknCookie) {
    c.set('refTknPayload', decode(refTknCookie))
  }

  return await next()
})
