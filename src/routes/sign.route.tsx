import { Hono } from 'hono'
import { Variable } from '..';
import { SignInPage } from '../views/pages/sign-in.page';
import { signBlockerMiddleware } from '../middleware.ts/sign-blocker.mw';
import { SignUpPage } from '../views/pages/sign-up.page';

export const signRoute = new Hono<{Variables: Variable}>()

signRoute.use(signBlockerMiddleware)

signRoute.get('/in', (c) => {
  c.set('routePageTitle', 'sign in')
  return c.render(<SignInPage />)
})

signRoute.get('/up', async (c) => {
  c.set('routePageTitle', 'sign up')
  return c.render(<SignUpPage />)
})