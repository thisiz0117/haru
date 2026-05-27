import { Hono, type Context } from "hono";
import { getSignedCookie } from "hono/cookie";
import { Binding } from "..";

const signRoute = new Hono<{Bindings: Binding}>()

signRoute.get('/signup', async (c) => {
  const providerInfo = await getSignedCookie(c, c.env.COOKIE_SECRET, 'temp_claims')

  if(!providerInfo) {
    return c.json({msg: 'no permission, 클레임 정보 없음', prvdinfo: providerInfo}, 400)
  }

  return c.html(
    `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body> 
      <form action="/api/auth/v1/signup" method="post" enctype="multipart/form-data">
        <label htmlFor="username">사용자명</label>
        <input type="text" name="username" id="username" /><br />
        <label htmlFor="description">설명</label>
        <textarea name="" id="description" cols={80} rows={10}></textarea><br />
        <button type="submit">가입</button>
      </form>
    </body>
    </html>
    `
  )
})

export default signRoute