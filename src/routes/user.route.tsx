import { Hono } from "hono";
import { InfoPage } from "../views/pages/info.page";
import { strictJwtMiddleware } from "../middleware.ts/jwt.mw";
import { Variable } from "..";
import { decode } from "hono/jwt";

export const userRoute = new Hono<{Variables: Variable}>()

userRoute.use(strictJwtMiddleware)

userRoute.get('/info', (c) => {
  const user = c.get('acsTknPayload').user

  return c.render(<InfoPage user={user}/>)
})