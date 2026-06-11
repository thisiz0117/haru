import { FC } from 'hono/jsx'

export type ETCError = {
  reason: string
}

export type SavedUserInfo = {
  beforeUsername?: string
  beforeDescription?: string
}

type SignUpProps = {
  errPoint?: 'username' | 'description' | null
  savedUserInfo?: SavedUserInfo
}

export const SignUpPage: FC<SignUpProps> = (props) => {
  // 에러 위치 체크 후 그 위치에 맞는 곳에 메시지를 출력한다.
  let errMsg
  if (props.errPoint && props.errPoint === 'username') {
    errMsg = <p>영어 대소문자와 밑줄, 4 ~ 32글자의 닉네임만 가능</p>
  } else {
    errMsg = <p>설명은 256글자 이내로 작성</p>
  }

  return (
    <div className="sign-page">
      <h1>가입하기</h1>
      <form className="signup-form" action="/api/auth/v1/signup" method="post">
        <label htmlFor="username">사용자명</label>
        <br />
        <input type="text" name="username" id="username" value={props.savedUserInfo?.beforeUsername} required />
        {props.errPoint === 'username' && errMsg}
        <br />
        <br />
        <label htmlFor="description">설명</label>
        <br />
        <textarea name="description" id="description" cols={40} rows={4}>
          {props.savedUserInfo?.beforeDescription}
        </textarea>
        {props.errPoint === 'description' && errMsg}
        <br />
        <br />
        <button type="submit">가입하기</button>
      </form>
    </div>
  )
}
