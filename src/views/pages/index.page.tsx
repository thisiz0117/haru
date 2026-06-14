import { FC } from 'hono/jsx'
import { NavLayout } from '../layouts/nav.layout'

type MainPageProps = {
  isLoggined: boolean
}

type ContainerProps = {
  isLoggined: boolean
}

type ItemProps = {
  text: string
  link: string
}

type RHProps = {
  diary: string
  writer: string
  likeCount: number
}

export const MainPage: FC<MainPageProps> = (props) => {
  return (
    <>
      <NavLayout />
      <RandomHaru diary="과거는 거짓말이고, 미래는 환상일 뿐이다" writer="MXUniQ" likeCount={120} />
      <IndexSelect isLoggined={props.isLoggined} />
    </>
  )
}

export const IndexSelect: FC<ContainerProps> = (props) => {
  if (props.isLoggined) {
    return (
      <div className="select-container">
        <SelectItem text="일기 쓰기" link="diary/write" />
        <SelectItem text="하루 탐색하기" link="/explore" />
        <SelectItem text="내 정보" link="/my/info" />
      </div>
    )
  }
  return (
    <div className="select-container">
      <SelectItem text="하루 탐색하기" link="/explore" />
      <SelectItem text="로그인" link="/sign/in" />
    </div>
  )
}

const SelectItem: FC<ItemProps> = (props) => {
  return (
    <div>
      <span>&gt;</span>
      <span>
        <a href={props.link}>{props.text}</a>
      </span>
    </div>
  )
}

export const RandomHaru: FC<RHProps> = (props) => {
  return (
    <div className="random-haru-container">
      <div className="diary">
        <p>ㄱ</p>
        <h3>"{props.diary}"</h3>
        <p>ㄴ</p>
      </div>
      <p>
        {props.likeCount} 개의 좋아요를 받은 '{props.writer}' 님의 일기입니다.
      </p>
    </div>
  )
}
