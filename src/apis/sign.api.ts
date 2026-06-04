import { Hono } from 'hono'
import { Binding, RefreshTokenPayload, Variable } from '..'
import { deleteCookie, getCookie, getSignedCookie, setCookie } from 'hono/cookie'
import { connect } from '@tidbcloud/serverless'
import { iss } from '../services/providers.service'
import { Claims } from './oauth.api'
import { sign, verify } from 'hono/jwt'
import { v4 as uuidV4 } from 'uuid'

const signApi = new Hono<{ Bindings: Binding; Variables: Variable }>()

/*
# POST: v1/signup body "인터페이스"
  - username : string
  - description ?: !null ? string : ''
  - profile ?: File
*/
interface SignupBody {
  username?: string
  description?: string | null
  profile?: File | null
}

/*
  # UserSelect Interface
*/
export interface User {
  id: number
  provider?: string
  sub?: string
  username?: string
  description?: string
  created_at?: number
  updated_at?: number
}

/*
  # POST: api/auth/v1/signup
  -> 계정 등록, form data 기반
  */
signApi.post('/v1/signup', async (c) => {
  // get claims data
  const claims = JSON.parse((await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims')) as string) as Claims

  if (!claims) {
    return c.json({ msg: 'no permission, 인증 진행 상태가 아님' }, 400)
  }

  // get body data
  const body = (await c.req.parseBody()) as SignupBody
  const username = body.username
  const description = body.description

  // insert data in database
  try {
    const connection = connect({ url: c.env.DB_USER_URL })

    const insertRes = await connection.execute(
      'insert into users (provider, sub, username, description) values (?, ?, ?, ?)',
      [iss[claims.iss], claims.sub, username, description],
      { arrayMode: false },
    )

    await deleteCookie(c, 'temp_claims')

    return c.redirect('/', 302)
  } catch (e) {
    return c.json({ msg: 'db error', err: e }, 500)
  }
}) // # POST: api/auth/v1/signup

/*
  # POST: api/auth/v1/signin
  -> 로그인 처리 및 토큰 발행
*/
signApi.get('/v1/signin', async (c) => {
  // get claims data
  const claims = JSON.parse((await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims')) as string) as Claims

  if (!claims) {
    return c.json({ msg: 'no permission, 인증 진행 상태가 아님' }, 400)
  }

  try {
    // connect db
    const connection = connect({ url: c.env.DB_USER_URL })

    // select user
    const selectRes = (await connection.execute('select * from users where provider = ? and sub = ?', [
      iss[claims.iss],
      claims.sub,
    ])) as User[]

    await deleteCookie(c, 'temp_claims')

    // if select user is empty, then return false
    if (!selectRes || !selectRes.length) {
      return c.json({ msg: '유저를 찾지 못함' }, 400)
    }

    const user = selectRes[0]
    const nowInUnix = Math.floor(Date.now() / 1000)

    // else create jwt and add ref token in db
    const accessTokenJwt = await sign(
      {
        user: user,
        exp: nowInUnix + 60 * 15, // 15분 뒤
      },
      c.env.ACCESS_TOKEN_SECRET,
    )

    const jwtId = uuidV4()
    const day14 = 60 * 60 * 24 * 14

    const refreshTokenJwt = await sign(
      {
        id: user.id,
        exp: nowInUnix + day14, // 14일 뒤
        jti: jwtId,
      },
      c.env.REFRESH_TOKEN_SECRET,
    )

    await setCookie(c, 'access_token', accessTokenJwt, {
      httpOnly: true,
      maxAge: 60 * 15,
      // secure: true,
      sameSite: 'Lax',
    })

    await setCookie(c, 'refresh_token', refreshTokenJwt, {
      httpOnly: true,
      maxAge: day14,
      // secure: true,
      sameSite: 'Lax',
    })

    try {
      const connection = connect({ url: c.env.DB_USER_URL })

      await connection.execute(
        `insert into ref_tokens (user_id, ref_token, expires_at) values (?, ?, from_unixtime(?))`,
        [user.id, jwtId, nowInUnix + day14],
        { fullResult: false },
      )
    } catch (e) {
      return c.json({ msg: 'db error', err: e }, 500)
    }

    return c.redirect('/', 302)
  } catch (e) {
    return c.json({ msg: 'db error', err: e }, 500)
  }
})

/*
  # api/auth/v1/refresh
  -> 토큰 리프레시
*/
signApi.get('/v1/refresh', async (c) => {
  // c.get으로 받아와라
  // -> 없으면 잘못온거다. 메인페이지로 보내든가 404로 보내
  const refTkn = getCookie(c, 'refresh_token')
  let refTknPayload
  if (!refTkn) {
    return c.redirect('/api/auth/v1/logout', 302)
  }

  try {
    refTknPayload = await verify(refTkn, c.env.REFRESH_TOKEN_SECRET, 'HS256')
  } catch (e) {
    c.redirect('/api/auth/v1/logout')
  }

  // 리다이렉트 쿼리 받아와라
  // -> 없으면 기본주소로 바꿔버려
  let redirect = c.req.query('r')

  if (!redirect) {
    redirect = '/'
  }

  // 리프레시 검증
  // -> 조작된 토큰이니 로그아웃
  try {
    await verify(refTkn, c.env.REFRESH_TOKEN_SECRET, 'HS256')
  } catch (e) {
    return c.redirect('/api/auth/v1/logout', 302)
  }

  try {
    const conncetion = connect({ url: c.env.DB_USER_URL })
    // 검증된 리프레시 토큰에서 유저 db에서 받아온다
    const userExecRes = (await conncetion.execute('select * from ref_tokens where ref_token = ?', [
      refTknPayload!.jti,
    ])) as User[]

    if (userExecRes.length === 0) {
      return c.json({ msg: 'db select err', res: userExecRes }, 500)
    }

    const user = userExecRes[0]

    //  지금 시간 유닉스
    const nowInUnix = Math.floor(Date.now() / 1000)
    const day14 = 60 * 60 * 24 * 14

    const newAcsTknPayload = {
      user: {
        id: user.id,
        provider: user.provider,
        username: user.username,
        description: user.description,
        created_at: user.created_at,
      } as User,
      exp: nowInUnix + 60 * 15,
    }

    // 액세스 만든다(토큰 + 쿠키)
    const newAcsTkn = await sign(newAcsTknPayload, c.env.ACCESS_TOKEN_SECRET, 'HS256')

    setCookie(c, 'access_token', newAcsTkn, {
      httpOnly: true,
      maxAge: 60 * 15,
      // secure: true,
      sameSite: 'Lax',
    })

    // 시간이 마감까지 80% 초과되었는가?
    // -> 리프레시도 다시 만든다(토큰 + 쿠키 + DB)
    if (((refTknPayload!.exp! - nowInUnix) / day14) * 100 <= 20) {
      const jwtId = uuidV4()

      const newRefTknPayload = {
        user_id: user.id,
        exp: nowInUnix + day14,
        jti: jwtId,
      }

      const newRefTkn = await sign(newRefTknPayload, c.env.REFRESH_TOKEN_SECRET, 'HS256')

      setCookie(c, 'refresh_token', newRefTkn, {
        httpOnly: true,
        maxAge: day14,
        // secure: true,
        sameSite: 'Lax',
      })

      await conncetion
        .execute(
          'insert into ref_tokens (user_id, ref_token, expires_at) values (?, ?, unix_timestamp(?))',
          [user.id, jwtId, nowInUnix + day14],
          { arrayMode: true, fullResult: false },
        )
        
      // 다시 정보 set 해서 라우트에서 사용하게 한다
      c.set('acsTknPayload', newAcsTknPayload)
      c.set('refTknPayload', newRefTknPayload)
    }
  } catch (e) {
    return c.json({ msg: 'db err', err: e }, 500)
  }

  return c.redirect(redirect, 302)
})

/*
  # GET: api/auth/v1/logout
  -> 로그아웃 처리
*/
signApi.get('/v1/logout', async (c) => {
  // 액세스 토큰 받아와서 지워
  deleteCookie(c, 'access_token')

  // 리프레시토큰 받아와
  // -> 없으면 로그아웃 되었겠지
  const refTkn = getCookie(c, 'refresh_token')

  if (!refTkn) {
    return c.redirect('/sign/in', 302)
  }

  let refTknPayload

  try {
    refTknPayload = await verify(refTkn, c.env.REFRESH_TOKEN_SECRET, 'HS256')
  } catch (e) {
    return c.text(String(e), 400)
  }

  // 세션DB 지워
  try {
    const connection = connect({ url: c.env.DB_USER_URL })
    await connection.execute('delete from ref_tokens where ref_token = ?', [refTknPayload.jti])
  } catch (e) {
    return c.json({ msg: 'db err', err: e }, 500)
  }

  // 쿠키 지워
  deleteCookie(c, 'refresh_token')

  return c.redirect('/sign/in', 302)
})

export default signApi
