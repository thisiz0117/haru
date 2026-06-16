/*
  # api/diary/...
  -> 일기 api
*/

import { Hono } from 'hono'
import { Binding, Variable } from '..'
import { connect } from '@tidbcloud/serverless'
import { optionalJwtMiddleware, strictJwtMiddleware } from '../middleware.ts/jwt.mw'

export const diaryApi = new Hono<{ Bindings: Binding; Variables: Variable }>()

/*
  # api/diary/v1/new
  -> 일기 쓰기 form 받아서 db 업로드 처리
*/
interface NewDiaryFormData {
  title: string
  content: string
  isPublic: 'public' | 'private'
}

type NewDiaryError = {
  position?: 'title' | 'content' | 'isPublic' | 'error'
  error?: string
}

export type NewDiaryResponse = {
  success: boolean
  redirect?: string
  error?: NewDiaryError
}

const isPublicType = (bool: unknown): bool is 'public' | 'private' => {
  return bool === 'public' || bool === 'private'
}

const validateBody = (body: any): { success: boolean; data?: NewDiaryFormData; error?: string } => {
  const title: string | any = body.title
  const content: string | any = body.content
  const isPublic: 'public' | 'private' | any = body.isPublic

  // title 검증
  // -> 64자 이내, 특정 문자 제가, 링크 형식 제거
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { success: false, error: '제목은 존재해야 합니다.' }
  }

  if (title.length < 4 || title.length > 64) {
    return { success: false, error: '제목 길이는 4~64자 이내여야 합니다.' }
  }

  if (/(씨[바발바]|시[발바방]|좆|창[년놈]|개[새새끼]|병[신신]|새[끼기])/i.test(title)) {
    return { success: false, error: '제목에 허용되지 않는 문자가 포함되어 있습니다.' }
  }

  // prettier-ignore
  if (/(https?:\/\/)?(www\.)?([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\-]{2,}\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?/i.test(title)) {
    return { success: false, error: '제목에 허용되지 않는 문자가 포함되어 있습니다.' }
  }

  // content 검증
  // -> 65,535자 이내
  if (content || content.trim()) {
    if (typeof content !== 'string') {
      return { success: false, error: '본문에 허용되지 않는 형식입니다.' }
    }

    if (content.length > 65535) {
      return { success: false, error: '본문 내용이 65,535자를 넘으면 안됩니다.' }
    }
  }

  // isPublic 검증
  // -> public, private 인지 체크
  if (!isPublic || !isPublicType(isPublic)) {
    return { success: false, error: '일기 공개 여부 설정이 잘못되었습니다.' }
  }

  return { success: true, data: { title, content, isPublic } }
}

const getErrorPosition = (pos: string) => {
  if (pos.indexOf('제목') != -1) {
    return 'title'
  } else if (pos.indexOf('본문') != -1) {
    return 'content'
  } else return 'isPublic'
}

// api/diary/v1/new
diaryApi.post('/v1/new', strictJwtMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody()
    let validateRes

    if (!(validateRes = validateBody(body)).success) {
      let pos = validateRes.error!
      return c.json(
        {
          success: false,
          error: { position: getErrorPosition(pos), error: pos },
        } as NewDiaryResponse,
        400,
      )
    }

    const { title, content, isPublic } = validateRes.data as NewDiaryFormData

    try {
      const connection = connect({ url: c.env.DB_USER_URL })
      const writer = c.get('acsTknPayload').user.id

      await connection.execute('insert into diaries (writer, title, content, state) values (?, ?, ?, ?)', [
        writer,
        title,
        content,
        isPublic,
      ])

      const redirectUrl = await connection.execute(
        'select id from diaries where writer = ? order by created_at desc, id desc limit 1',
        [writer],
      )

      if (!redirectUrl || !Array.isArray(redirectUrl) || redirectUrl.length === 0) {
        return c.json(
          {
            success: false,
            error: { position: 'error', error: '사용자를 찾지 못했습니다.' },
          } as NewDiaryResponse,
          500,
        )
      }

      // @ts-ignore
      const diaryId = redirectUrl[0].id

      return c.json({ success: true, redirect: `/diary/${diaryId}` } as NewDiaryResponse, 200)
    } catch (e) {
      console.error('db err:', e)
      return c.json(
        {
          success: false,
          error: { position: 'error', error: 'DB 에러입니다.' },
        } as NewDiaryResponse,
        500,
      )
    }
  } catch (e) {
    console.error('db err:', e)
    return c.json(
      {
        success: false,
        error: { position: 'error', error: 'API 처리 오류: ' + e },
      } as NewDiaryResponse,
      400,
    )
  }
})

/*
  # addLikeService
  # api/diary/v1/like?diary={id}&=rating={u, d}
*/
type Rating = 'like' | 'dislike'

const getRating = (rating: any): Rating | null => {
  if (rating === 'like' || rating === 'u') return 'like'
  if (rating === 'dislike' || rating === 'd') return 'dislike'
  return null
}

diaryApi.get('/v1/rating', strictJwtMiddleware, async (c) => {
  // 레이팅 받아오기
  const ratingQuery = c.req.query('rating')
  if (!ratingQuery) return c.json({ msg: 'rating 필요함' }, 400)
  const rating = getRating(ratingQuery)
  if (rating === null) return c.json({ msg: 'rating err. 레이팅 값이 이상한데요' }, 400)

  // 일기 id 받아오기
  const diaryQuery = c.req.query('diary')
  if (!diaryQuery) return c.json({ msg: 'diary id 필요함' }, 400)
  const diary = parseInt(diaryQuery)
  if (diary < 0) return c.json({ msg: '잘못된 게시물 요청' }, 400)

  // 유저 정보 받아오기
  const userInfo = c.get('acsTknPayload').user.id

  try {
    const conn = connect({ url: c.env.DB_USER_URL })

    // 이미 좋아요 누른 기록이 있는지 체크
    // -> 있으면 지우고 다르게
    // -> 이미 누른 상태면 그냥 아무짓도 안하고 리턴
    const checkRes = (await conn.execute('select reaction from like_records where selecter = ? and diary_id = ?', [
      userInfo,
      diary,
    ])) as { reaction: Rating }[]

    let reaction: Rating | null

    if (checkRes[0]) {
      reaction = checkRes[0].reaction
    } else {
      reaction = null
    }

    // 평가를 이미 했다면
    // -> 다른거면 다른거 선택시키고 리턴
    // -> 같은거면 기록 삭제(좋아요 취소) 후 리턴
    if (reaction) {
      if (reaction !== rating) {
        console.log('R-N-EQ-U')
        await conn.execute('update like_records set reaction = ? where diary_id = ? and selecter = ?', [
          rating,
          diary,
          userInfo,
        ])
        if (reaction === 'like') {
          await conn.execute(
            `update diaries set likes_count = likes_count - 1, dislikes_count = dislikes_count + 1 where id = ?`,
            [diary],
          )
        } else {
          await conn.execute(
            `update diaries set likes_count = likes_count + 1, dislikes_count = dislikes_count - 1 where id = ?`,
            [diary],
          )
        }
        return c.json({ success: true, do: 'R-N-EQ-U' }, 200)
      } else {
        console.log('R-EQ-D')
        await conn.execute('delete from like_records where diary_id = ? and selecter = ?', [diary, userInfo])
        const query = rating === 'like' ? 'likes_count' : 'dislikes_count'
        await conn.execute(`update diaries set ${query} = ${query} - 1 where id = ?`, [diary])
        return c.json({ success: true, do: 'R-EQ-D' }, 200)
      }
    } else {
      console.log('N-R-I')
      await conn.execute('insert into like_records (diary_id, selecter, reaction) values (?, ?, ?)', [
        diary,
        userInfo,
        rating,
      ])
      const query = rating === 'like' ? 'likes_count' : 'dislikes_count'
      await conn.execute(`update diaries set ${query} = ${query} + 1 where id = ?`, [diary])
      return c.json({ success: true, do: 'N-R-I' }, 200)
    }
  } catch (e) {
    console.log(e)
    return c.json({ msg: 'db err', err: e }, 500)
  }
})

/*
  # api/diary/v1/:id
  -> 원하는 일기 받아오기
*/
export interface DiaryResponse {
  success: boolean
  data?: ''
  error?: string
}

export interface Diary {
  id: number
  writer: number
  username: string
  title: string
  content: string
  state: string
  likes_count: number
  dislikes_count: number
  created_at: number
}

const validateDiaryRes = (diary: any): Diary | null => {
  if (!diary || typeof diary !== 'object') {
    return null
  }

  const needKey = [
    'id',
    'username',
    'writer',
    'title',
    'content',
    'state',
    'likes_count',
    'dislikes_count',
    'created_at',
  ]

  for (let key in diary) {
    if (!needKey.includes(key)) {
      return null
    }
  }

  return diary
}

/*
  # /api/diary/v1/random?count={count}
  -> 랜덤 다이어리 api
  -> query: count = 필요한 양
*/
export interface RandomDiaryResponse {
  success: boolean
  data?: object[]
  error?: string
}

// api/diary/v1/random?count=?
diaryApi.get('/v1/random', optionalJwtMiddleware, async (c) => {
  // 필요한 양 체크
  // -> 없거나, 0개, 100개 이상이면 빠꾸
  const countQuery = c.req.query('count')

  if (!countQuery) {
    return c.json({ success: false, error: 'need count query' } as RandomDiaryResponse, 400)
  }

  const count = parseInt(countQuery)

  if (count <= 0) {
    return c.json({ success: false, error: '0개 이하의 요청은 안됩니다.' } as RandomDiaryResponse)
  }

  // db에서 일기 받아오기
  // -> 받아오면 데이터 리턴
  // -> 부족하거나 없으면 없는 만큼 리턴
  // -> 오류는 빠꾸
  try {
    const connection = connect({ url: c.env.DB_USER_URL })

    const diaryQueries = await connection.execute(
      'select d.id, d.title, d.likes_count, u.username from diaries d join users u order by rand() limit 1;',
      [count],
    )

    return c.json({ success: true, data: diaryQueries } as RandomDiaryResponse, 200)
  } catch (e) {
    return c.json({ success: false, error: 'DB 연결 에러' + e } as RandomDiaryResponse, 500)
  }
}) // api/diary/v1/random?count=?

diaryApi.get('/v1/:id', optionalJwtMiddleware, async (c) => {
  const id = c.req.param('id')

  try {
    const connection = connect({ url: c.env.DB_USER_URL })
    const diaryRes = await connection.execute(
      'select d.*, u.username from diaries d join users u on d.writer = u.id where d.id = ?',
      [id],
    )
    const diary = validateDiaryRes(diaryRes[0])

    if (diary === null) {
      return c.json({ msg: 'faild user validate' }, 400)
    }

    return c.json({ data: diary }, 200)
  } catch (e) {
    return c.json({}, 500)
  }
})