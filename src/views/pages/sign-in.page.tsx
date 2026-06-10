import { FC } from 'hono/jsx'

type ProviderProps = {
  displayName: string
  provider: string
}

export const SignInPage = () => {
  return (
    <div className="sign-page">
      <h1>로그인</h1>
      <Provider displayName="Google" provider="google" />
      <Provider displayName="Naver" provider="naver" />
    </div>
  )
}

const Provider: FC<ProviderProps> = (props) => {
  return (
    <div className="provider-container">
      <h4>
        <a href={`/api/oauth/v1/${props.provider}`}>{props.displayName} 로그인</a>
      </h4>
    </div>
  )
}
