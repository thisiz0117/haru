import { html } from 'hono/html'
import { FC } from 'hono/jsx'

export const NewDiary: FC = (props) => {
  return (
    <>
      <form id="new-diary-form" method="post" action="/api/diary/v1/new">
        <label htmlFor="title">제목</label>
        <p id="fetch-err"></p>
        <br />
        <input type="text" name="title" id="title" required />
        <p id="title-err"></p>
        <br />
        <br />
        <label htmlFor="content">내용(선택)</label>
        <br />
        <textarea name="content" id="content"></textarea>
        <p id="content-err"></p>
        <br />
        <br />
        <label htmlFor="isPublic">공개 여부</label>
        <br />
        <select name="isPublic" id="isPublic" required>
          <option value="" selected disabled hidden>
            공개 여부 ↓
          </option>
          <option value="public">공개</option>
          <option value="private">비공개</option>
        </select>
        <p id="isPublic-err"></p>
        <br />
        <br />
        <button type="submit">작성 완료</button>
      </form>
      {html`
        <script>
          const content = document.getElementById('content')
          const form = document.getElementById('new-diary-form')

          // textarea 높이 조절
          content.addEventListener('input', function () {
            this.style.height = 'auto'
            this.style.height = this.scrollHeight + 4 + 'px'
          })

          // 폼 제출
          form.addEventListener('submit', async (e) => {
            e.preventDefault()
            const btn = form.querySelector('button')
            const originalText = btn.textContent

            try {
              btn.disabled = true
              btn.textContent = '작성 중...'

              const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
              })

              // 먼저 JSON 파싱
              const data = await res.json()

              // 검증 오류 또는 요청 실패
              if (!res.ok) {
                if (data.position && data.error) {
                  // 필드 검증 오류
                  document.getElementById(data.position + '-err').textContent = data.error
                } else {
                  // 기타 오류
                  document.getElementById('fetch-err').textContent = data.error || '요청 실패'
                }
                return
              }

              // 성공
              window.location.href = data.redirect || '/diary'
            } catch (e) {
              console.error('Submission error:', e)
              document.getElementById('fetch-err').textContent = e.message
            } finally {
              btn.disabled = false
              btn.textContent = originalText
            }
          })
        </script>
      `}
    </>
  )
}
