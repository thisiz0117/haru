import { FC, PropsWithChildren } from 'hono/jsx'
import { AccessTokenPayload } from '../..';

type InfoProps = {
  user: AccessTokenPayload
}

type ISectionProps = {
  title: string
}

type IDProps = {
  keyword: string
  data: any
}

type ButtonProps = {
  display: string
  action: string
}

export const InfoPage: FC<InfoProps> = (props) => {
  const user = props.user.user

  const createDate = new Date(user.created_at!)
  const year = createDate.getFullYear()
  const month = createDate.getMonth() + 1
  const date = createDate.getDate()

  const timeFormatted = `${year}년 ${month}월 ${date}일 계정 생성`

  return (
    <>
      <InfoSection title="내 정보">
        <InfoData keyword="사용자명" data={user.username} />
        <InfoData keyword="내 설명" data={user.description ?? '\'비어 있음\''} />
        <InfoData keyword="가입일" data={timeFormatted} />
      </InfoSection>
      <br />
      <br />
      <InfoSection title="계정 설정">
        <Button display="로그아웃" action="/api/auth/v1/logout"/>
      </InfoSection>
    </>
  )
}

const InfoSection: FC<PropsWithChildren<ISectionProps>> = (props) => {
  return (
    <fieldset className="info-section">
      <legend>{props.title}</legend>
      {props.children}
    </fieldset>
  )
}

const InfoData: FC<IDProps> = (props) => {
  return (
    <>
      <h4>{props.keyword}</h4>
      <p>{props.data}</p>
    </>
  )
}

const Button: FC<ButtonProps> = (props) => {
  return (
    <button><a href={props.action}>{props.display}</a></button>
  )
}
