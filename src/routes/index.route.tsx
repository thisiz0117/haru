import { Hono } from 'hono'
import { Variable } from '..';
import { MainPage } from '../views/pages/index.page';
import { optionalJwtMiddleware } from '../middleware.ts/jwt.mw';

export const indexRoute = new Hono<{Variables: Variable}>()

indexRoute.use(optionalJwtMiddleware)

indexRoute.get('/', (c) => {
  c.set('routePageTitle', 'x')
  let loginFlag = false
  if(c.get('refTknPayload')) {
    loginFlag = true
  }
  return c.render(<MainPage isLoggined={loginFlag}/>)
})
