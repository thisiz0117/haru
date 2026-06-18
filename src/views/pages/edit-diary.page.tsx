import { html } from 'hono/html';
import { FC } from 'hono/jsx'

type DefaultDiaryProps = {
  id: number
  title: string
  content: string
  state: 'public' | 'private'
}

export const EditDiaryPage: FC<DefaultDiaryProps> = (props) => {
  return (
    <>
    <form id="new-diary-form">
      <label htmlFor="title">제목</label>
      <p id="fetch-err"></p>
      <br />
      <input type="text" name="title" id="title" value={props.title} required />
      <p id="title-err"></p>
      <br />
      <br />
      <label htmlFor="content">내용(선택)</label>
      <br />
      <textarea name="content" id="content">
        {props.content}
      </textarea>
      <p id="content-err"></p>
      <br />
      <br />
      <label htmlFor="isPublic">공개 여부</label>
      <br />
      <select name="isPublic" id="isPublic" required>
        {props.state === 'public' ?
          <>
            <option value="public" selected>
              공개
            </option>
            <option value="private">비공개</option>
          </>
        : <>
            <option value="public">공개</option>
            <option value="private" selected>
              비공개
            </option>
          </>
        }
      </select>
      <p id="isPublic-err"></p>
      <br />
      <br />
      <button type="submit">작성 완료</button>
    </form>
    {html`<script src="/scripts/diary-edit.js"></script>`}
    </>
  )
}
