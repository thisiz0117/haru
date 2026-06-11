import { Hono } from 'hono'
import { Variable } from '..';
import { MainPage } from '../views/pages/index.page';
import { optionalJwtMiddleware } from '../middleware.ts/jwt.mw';
import { getCookie } from 'hono/cookie';
import { decode } from 'hono/jwt';

export const indexRoute = new Hono<{Variables: Variable}>()

indexRoute.use(optionalJwtMiddleware)

indexRoute.get('/', (c) => {
  c.set('routePageTitle', 'x')

  let loginFlag = false
  const refTkn = c.get('refTknPayload')
  if(refTkn) {
    loginFlag = true
  }
  return c.render(<MainPage isLoggined={loginFlag}/>)
})
