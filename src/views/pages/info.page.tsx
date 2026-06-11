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

export const InfoPage: FC<InfoProps> = (props) => {
  const user = props.user.user

  return (
    <>
      <InfoSection title="내 정보">
        <InfoData keyword="사용자명" data={user.username} />
        <InfoData keyword="내 설명" data={user.description} />
        <InfoData keyword="가입일" data={user.created_at} />
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
