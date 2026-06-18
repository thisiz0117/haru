import { Hono } from 'hono'
import { Binding, Variable } from '..'
import { NewDiary } from '../views/pages/new-diary.page'
import { optionalJwtMiddleware, strictJwtMiddleware } from '../middleware.ts/jwt.mw'
import { DiaryPage } from '../views/pages/diary.page'
import { Diary } from '../apis/diary.api'
import { connect } from '@tidbcloud/serverless'
import { EditDiaryPage } from '../views/pages/edit-diary.page';

export const diaryRoute = new Hono<{ Variables: Variable; Bindings: Binding }>()

diaryRoute.use(strictJwtMiddleware)

/*
  # /diary/write
*/
// /diary/write
diaryRoute.get('/write', (c) => {
  return c.render(<NewDiary />)
})

/*
  # /diary/:id/edit
*/
diaryRoute.get('/:id/edit', strictJwtMiddleware, async (c) => {
  const diaryId = c.req.param('id')

  if (!diaryId) {
    console.log('no diary id')
    return c.redirect('/', 302)
  }

  const userId = c.get('acsTknPayload').user.id

  try {
    // 본인 일기가 맞는지 확인 후 리다이렉트
    const conn = connect({ url: c.env.DB_USER_URL })

    console.log('check writer')
    const writerCheck = await conn.execute('select 1 as `isWriter` from diaries where id = ? and writer = ?', [
      diaryId,
      userId,
    ]) as {isWriter : 1 | 0}[]

    if (!writerCheck[0].isWriter) {
      return c.redirect(`/`, 302)
    }

    // 기존 글 내용 받아오기
    console.log('기존 글 받아오기')
    const existPost = await conn.execute(
      'select id, title, content, state from diaries where id = ? and writer = ?;',
      [diaryId, userId],
    ) as {id: number, title: string, content: string, state: 'public' | 'private'}[]

    return c.render(<EditDiaryPage id={existPost[0].id} title={existPost[0].title} content={existPost[0].content} state={existPost[0].state}/>)
  } catch (e) {
    return c.redirect(`/`, 302)
  }
})

/*
  # /diary/:id
*/
diaryRoute.get('/:id', optionalJwtMiddleware, async (c) => {
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
