import { Hono } from 'hono'
import { Variable } from '..'
import { NewDiary } from '../views/pages/new-diary'
import { optionalJwtMiddleware, strictJwtMiddleware } from '../middleware.ts/jwt.mw'
import { DiaryPage } from '../views/pages/diary.page'
import { Diary } from '../apis/diary.api'

export const diaryRoute = new Hono<{ Variables: Variable }>()

diaryRoute.use(strictJwtMiddleware)

/*
  # /diary/write
*/
// /diary/write
diaryRoute.get('/write', (c) => {
  return c.render(<NewDiary />)
})

diaryRoute.use(optionalJwtMiddleware)

diaryRoute.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const response = await fetch(`http://localhost:8787/api/diary/v1/${id}`, {
      method: 'GET',
    })

    if (!response.ok) {
      return c.json({ msg: 'response not ok', res: response.status }, 500)
    }

    const { data: diary } = (await response.json()) as { data: Diary }

    return c.render(
      <DiaryPage
        title={diary.title}
        content={diary.content}
        created_at={diary.created_at}
        likes_count={diary.likes_count}
        dislikes_count={diary.dislikes_count}
        username={diary.username}
        userId={diary.writer}
      />,
    )
  } catch (e) {
    return c.json({ msg: 'fetch_err', err: e }, 500)
  }
})