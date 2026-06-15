import { Hono } from 'hono'
import { Variable } from '..'
import { MainPage } from '../views/pages/index.page'
import { optionalJwtMiddleware } from '../middleware.ts/jwt.mw'

export const indexRoute = new Hono<{ Variables: Variable }>()

indexRoute.use(optionalJwtMiddleware)

export interface RandomDiary {
  id: number
  title: string
  writer: string
  likes_count: number
}

const validateRandomDiaryFetch = (data: unknown): RandomDiary | null => {
  if (!data || typeof data !== 'object') {
    return null
  }

  if (!('success' in data) || !('data' in data)) {
    return null
  }

  const diaries = data.data

  if (!diaries || !Array.isArray(diaries)) {
    return null
  }

  if (diaries.length === 0) {
    return null
  }

  const diary = diaries[0]
  if (!diary || typeof diary !== 'object') {
    return null
  }

  if ('id' in diary && 'title' in diary && 'writer' in diary && 'likes_count' in diary) {
    return { id: diaries[0].id, title: diaries[0].title, writer: diaries[0].writer, likes_count: diaries[0].likes_count }
  }

  return null
}

indexRoute.get('/', async (c) => {
  c.set('routePageTitle', 'x')

  // 로그인체킹
  let loginFlag = false
  const refTkn = c.get('refTknPayload')
  if (refTkn) {
    loginFlag = true
  }

  let diary

  // 메인 글
  try {
    const response = await fetch('http://localhost:8787/api/diary/v1/random?count=1', {
      method: 'GET',
    })

    if (response.ok) {
      const data = await response.json()
      diary = validateRandomDiaryFetch(data)
    }
  } catch (e) {
    console.error('메인 글을 불러오지 못했습니다: ' + e)
  }
  
  console.log('route diary: ', diary)
  return c.render(<MainPage isLoggined={loginFlag} randomDiary={diary ?? null} />)
})
