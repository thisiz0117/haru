import { Hono } from 'hono'
import { Binding } from '..'
import { getSignedCookie } from 'hono/cookie'
import { connect } from '@tidbcloud/serverless'
import { iss } from '../services/providers.service'
import { Claims } from './oauth.api'

const signApi = new Hono<{ Bindings: Binding }>()

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
  # POST: api/auth/v1/signup
  -> 계정 등록, form data 기반
  */
signApi.get('/v1/signup', async (c) => {
  // get claims data
  const claims = JSON.parse(
    (await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims')) as string,
  ) as Claims

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
  const claims = JSON.parse(
    (await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims')) as string,
  ) as Claims

  if (!claims) {
    return c.json({ msg: 'no permission, 인증 진행 상태가 아님' }, 400)
  }

  try {
    // connect db
    const connection = connect({ url: c.env.DB_USER_URL })

    // select user
    const selectRes = await connection.execute(
      'select * from users where provider = ? and sub = ?',
      [iss[claims.iss], claims.sub],
    )

    console.log(claims.iss, claims.sub)

    // select user is empty, then return false
    if (!selectRes) {
      return c.json({ msg: '유저를 찾지 못함' }, 400)
    }

    return c.json(selectRes, 200)

    // const payload = {
    //   sub: ,
    //   exp: 60 * 60 * 3,
    //   iss: 'http://localhost:8787',
    // } as JWTPayload

    // const token = await sign()
  } catch (e) {
    return c.json({ msg: 'db error', err: e }, 500)
  }
})

export default signApi
