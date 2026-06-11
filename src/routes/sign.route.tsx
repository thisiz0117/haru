import { Hono } from 'hono'
import { Binding, Variable } from '..'
import { SignInPage } from '../views/pages/sign-in.page'
import { signBlockerMiddleware } from '../middleware.ts/sign-blocker.mw'
import { SavedUserInfo, SignUpPage } from '../views/pages/sign-up.page'
import { getSignedCookie } from 'hono/cookie'

export const signRoute = new Hono<{ Variables: Variable; Bindings: Binding }>()

signRoute.use(signBlockerMiddleware)

const errPointGuard = (errorQuery: string | undefined): 'username' | 'description' | null => {
  if (errorQuery === 'username') {
    return errorQuery
  } else if (errorQuery === 'description') {
    return errorQuery
  } else {
    return null
  }
}

signRoute.get('/in', (c) => {
  c.set('routePageTitle', 'sign in')
  return c.render(<SignInPage />)
})

signRoute.get('/up', async (c) => {
  c.set('routePageTitle', 'sign up')

  // temp_claims가 있어야 정상적인 접근임
  if (!(await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims'))) {
    return c.redirect('/sign/in', 302)
  }

  // 쿼리 받아오기
  const errorQuery = c.req.query('e')
  const usernameQuery = c.req.query('u')
  const descriptionQuery = c.req.query('d')

  // 에러 가져오기
  // -> 없으면 바로 렌터링
  // -> 있으면 타입체크 후 에러 메시지 렌더링
  if (!errorQuery) {
    return c.render(<SignUpPage />)
  }

  const savedUserInfo = { beforeUsername: usernameQuery, beforeDescription: descriptionQuery } as SavedUserInfo

  return c.render(<SignUpPage errPoint={errPointGuard(errorQuery)} savedUserInfo={savedUserInfo} />)
})
