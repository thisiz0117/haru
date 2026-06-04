import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types';

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
      return c.json({ msg: 'failed refTkn verify' })
    }

    // acsTkn 다시받아와라
    return c.redirect(redirectUrl, 302)
  }

  // 다 유효하냐
  try {
    await verify(acsTknCookie!, c.env.ACCESS_TOKEN_SECRET, 'HS256')
    await verify(refTknCookie!, c.env.REFRESH_TOKEN_SECRET, 'HS256')
  } catch (e) {
    return c.json({ msg: 'failed refTkn & acsTkn verify' })
  }

  // 유효하니 라우트 안에서 정보 꺼내쓰게 set 해서 줘라
  c.set('acsTknPayload', acsTknCookie)
  c.set('refTknPayload', refTknCookie)

  // 라우트 이동
  return await next()
})

const optionalJwtMiddleware = createMiddleware(async (c: Context, next: Next) => {
  // 토큰받아와
  const acsTknCookie = getCookie(c, 'access_token')
  const refTknCookie = getCookie(c, 'refresh_token')

  if (!acsTknCookie) return await next()
  if (!refTknCookie) return await next()

  // 검증해
  // -> 실패하면 그냥 다음으로 next 넘어가
  // -> 아니면 set 하고 next 넘어가
  let acsTknPayload: JWTPayload;
  let refTknPayload: JWTPayload;

  try {
    acsTknPayload = await verify(acsTknCookie, c.env.ACCESS_TOKEN_SECRET, 'HS256')
    refTknPayload = await verify(refTknCookie, c.env.REFRESH_TOKEN_SECRET, 'HS256')
  } catch (e) {
    return c.json({ msg: '토큰 검증 실패', err: e }, 400)
  }

  c.set('accessTokenPayload', acsTknPayload)
  c.set('refTknPayload', refTknPayload)

  return await next()
})
