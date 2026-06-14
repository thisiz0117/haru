/*
  # api/diary/...
  -> 일기 api
*/

import { Hono } from 'hono'
import { Binding, Variable } from '..'
import { connect } from '@tidbcloud/serverless'
import { strictJwtMiddleware } from '../middleware.ts/jwt.mw'

export const diaryApi = new Hono<{ Bindings: Binding; Variables: Variable }>()

diaryApi.use(strictJwtMiddleware)

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
diaryApi.post('/v1/new', async (c) => {
  try {
    // form 받아오기
    const body = await c.req.parseBody()
    
    console.log('[DIARY API] Received body:', body)

    // form 검증
    let validateRes

    if (!(validateRes = validateBody(body)).success) {
      // 실패했으니, 문제 지점에 에러 메시지를 보내도록 하기
      // 제목, 본문, 일기 indexof가 0인 값에 맞춰서 알아서 보내야 함
      let pos = validateRes.error!

      console.log('[DIARY API] Validation failed:', pos)
      return c.json({ position: getErrorPosition(pos), error: pos } as NewDiaryError, 400)
    }

    const { title, content, isPublic } = validateRes.data as NewDiaryFormData

    // 업로드
    try {
      const connection = connect({ url: c.env.DB_USER_URL })

      // 작성자 정보 받아오기
      const writer = c.get('acsTknPayload').user.id

      await connection.execute('insert into diaries (writer, title, content, state) values (?, ?, ?, ?)', [
        writer,
        title,
        content,
        isPublic,
      ])

      const redirectUrl = await connection.execute(
        'select id from diaries where writer = ? and now() - created_at < 60',
        [writer],
      )

      if (!redirectUrl || !('id' in redirectUrl[0])) {
        return c.json({ success: false, error: { position: 'error', error: '사용자를 찾지 못했습니다.' } } as NewDiaryResponse, 500)
      }

      // 방금 작성한 일기로 이동
      return c.json({ success: true, redirect: `/diary/${redirectUrl[0].id}` } as NewDiaryResponse, 200)
    } catch (e) {
      console.error('[DIARY API] DB Error:', e)
      return c.json({ success: false, error: { position: 'error', error: 'DB 에러입니다.' } } as NewDiaryResponse, 500)
    }
  } catch (e) {
    console.error('[DIARY API] Parse Error:', e)
    return c.json({ position: 'error', error: 'API 처리 오류: ' + (e instanceof Error ? e.message : String(e)) } as NewDiaryError, 400)
  }
})
