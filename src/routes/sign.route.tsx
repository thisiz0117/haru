import { Hono } from 'hono'
import { Variable } from '..';
import { SignInPage } from '../views/pages/sign-in.page';

export const signRoute = new Hono<{Variables: Variable}>()

signRoute.get('/in', (c) => {
  c.set('routePageTitle', 'sign in')
  return c.render(<SignInPage />)
})