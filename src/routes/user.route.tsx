import { Hono } from 'hono'
import { InfoPage } from '../views/pages/info.page'
import { strictJwtMiddleware } from '../middleware.ts/jwt.mw'
import { Variable } from '..'

export const userRoute = new Hono<{ Variables: Variable }>()

userRoute.use(strictJwtMiddleware)

userRoute.get('/info', (c) => {
  const userPayload = c.get('acsTknPayload')

  return c.render(<InfoPage user={userPayload}/>)
})
