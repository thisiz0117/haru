import { Hono } from 'hono'
import { initProvider, ProviderType } from '../services/providers.service'
import * as arctic from 'arctic'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { Binding } from '..'
import { connect } from '@tidbcloud/serverless'


const oauthApi = new Hono<{ Bindings: Binding }>()

/*
  # Claims Interface
  -> ts의 병신같은 강렬한 타입체크 방어용
  -! 카카오나 네이버 추가했는데, 다르게 나올 수도 있으므로 나중에 수정해야 할 수도 있음!! 

    {
      "iss": ["https://accounts.google.com" : google],
      "azp": 문자열,
      "aud": 스트링,
      "sub": 고유 아이디,
      "at_hash": 해시 스트링,
      "name": "Lanterva",
      "picture": 프로필 이미지 url,
      "given_name": "Lanterva",
      "iat": 지금 유닉스시간,
      "exp": 만료 유닉스시간
    }
*/
export interface Claims {
  iss: string
  azp: string
  aud: string
  sub: string
  at_hash: string
  picture: string
  name: string
  given_name: string
  iat: number
  exp: number
}

/*
  # GET: api/oauth/v1/:provider
  -> 로그인 버튼 누르면 그냥 여기로 이동시키기
*/
oauthApi.get('/v1/:provider', async (c) => {
  // create provider instance
  const providerName = c.req.param('provider') as ProviderType
  console.log(providerName)
  const providerFn = initProvider[providerName]

  if (!providerFn) {
    return c.json({ msg: '잘못된 제공업체입니다.' }, 400)
  }

  const providerInstance = providerFn(c)

  // secure logic
  const state = arctic.generateState()
  const codeVerifier = arctic.generateCodeVerifier()

  // set cookie
  await setSignedCookie(c, 'state', state, c.env.COOKIE_SECRET, {
    httpOnly: true,
    maxAge: 60 * 10,
    // secure: true,
    sameSite: 'Lax',
  })

  await setSignedCookie(c, 'codeVerifier', codeVerifier, c.env.COOKIE_SECRET, {
    httpOnly: true,
    maxAge: 60 * 10,
    // secure: true,
    sameSite: 'Lax',
  })

  // 받아올 권한
  const scopes = ['openid', 'profile']
  const url = providerInstance.createAuthorizationURL(
    state,
    codeVerifier,
    scopes,
  )

  return c.redirect(url, 302)
}) // GET: api/auth/v1/:provider

/*
  # GET: api/auth/v1/:provider/callback
  -> 로그인 콜백
*/
oauthApi.get('/v1/:provider/callback', async (c) => {
  // create provider instance
  const providerName = c.req.param('provider') as ProviderType
  console.log(providerName)
  const providerFn = initProvider[providerName]

  if (!providerFn) {
    return c.json({ msg: '잘못된 제공업체입니다.' }, 400)
  }

  const providerInstance = providerFn(c)
  
  // get query data
  const queryOfState = c.req.query('state')
  const queryOfCode = c.req.query('code')

  // get cookie data
  const cookieOfState = await getSignedCookie(c, c.env.COOKIE_SECRET, 'state')
  const cookieOfCodeVerifier = await getSignedCookie(
    c,
    c.env.COOKIE_SECRET,
    'codeVerifier',
  )

  // validate state
  if (queryOfState !== cookieOfState) {
    return c.json(
      {
        msg: 'dev env : state 검증 실패',
        cookie_state: cookieOfState,
        body_state: queryOfState,
      },
      400,
    )
  }

  // and delete state cookie
  await deleteCookie(c, 'state')

  try {
    // validate authorization code
    const tokens = await providerInstance.validateAuthorizationCode(
      queryOfCode as string,
      cookieOfCodeVerifier as string,
    )

    // and delete codeVerifier
    await deleteCookie(c, 'codeVerifier')

    // get openid userinfo
    const idToken = tokens.idToken()
    const claims = arctic.decodeIdToken(idToken) as Claims // <- data

    // save claims for cookie
    await setSignedCookie(
      c,
      'temp_claims',
      JSON.stringify(claims),
      c.env.COOKIE_SECRET,
      {
        httpOnly: true,
        maxAge: 60 * 10,
        // secure: true,
        sameSite: 'Lax',
      },
    )

    try {
      // create connection
      const connection = connect({ url: c.env.DB_USER_URL })

      // only check user exists
      const isUserExists = (await connection.execute(
        "select 1 as 'is_exists' from users where provider = ? and sub = ? limit 1",
        [providerName, claims.sub],
        { arrayMode: false },
      )) as { is_exists: string }[]

      // if not exists user than create user
      if (!isUserExists[0]) {
        return c.redirect('/signup')
      }

      // else user exists, login user
      return c.redirect('/api/auth/v1/signin')
    } catch (e) {
      return c.json({ msg: 'db 오류', err: e }, 500)
    }
  } catch (e) {
    if (e instanceof arctic.OAuth2RequestError) {
      const code = e.code
      return c.json(
        { msg: 'Invalid authorization code, credentials, or redirect URI' },
        500,
      )
    }
    if (e instanceof arctic.ArcticFetchError) {
      const cause = e.cause
      return c.json({ msg: 'Failed to call `fetch()`' }, 500)
    }
  }
}) // GET: api/auth/v1/:provider/callback

export default oauthApi
