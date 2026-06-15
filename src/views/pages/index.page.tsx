import { FC } from 'hono/jsx'
import { NavLayout } from '../layouts/nav.layout'
import { RandomDiary } from '../../routes/index.route';

type MainPageProps = {
  isLoggined: boolean
  randomDiary: RandomDiary | null
}

type ContainerProps = {
  isLoggined: boolean
}

type ItemProps = {
  text: string
  link: string
}

type RHProps = {
  id: number
  diary: string
  username: string
  likeCount: number
}

export const MainPage: FC<MainPageProps> = (props) => {
  const diary = props.randomDiary

  console.log('page diary: ' + diary)

  return (
    <>
      <NavLayout />
        <RandomHaru id={diary!.id} diary={diary!.title} username={diary!.username} likeCount={diary!.likes_count} />
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
        <a href={`/diary/${props.id}`}><h3>"{props.diary}"</h3></a>
        <p>ㄴ</p>
      </div>
      <p>
        {props.likeCount} 개의 좋아요를 받은 '{props.username}' 님의 일기입니다.
      </p>
    </div>
  )
}
