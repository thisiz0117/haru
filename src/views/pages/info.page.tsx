import { FC, PropsWithChildren } from 'hono/jsx'
import { User } from '../../apis/sign.api'

type InfoProps = {
  user: User
}

type ISectionProps = {
  title: string
}

type IDProps = {
  keyword: string
  data: any
}

export const InfoPage: FC<InfoProps> = (props) => {
  return (
    <>
      <InfoSection title="내 정보">
        <InfoData keyword="사용자명" data={props.user.username} />
        <InfoData keyword="내 설명" data={props.user.description} />
        <InfoData keyword="가입일" data={props.user.created_at} />
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
