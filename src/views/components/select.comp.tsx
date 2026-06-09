import { FC } from 'hono/jsx'

type ContainerProps = {
  isLoggined: boolean
}

type ItemProps = {
  text: string
  link: string
}

export const IndexSelect: FC<ContainerProps> = (props) => {
  if (props.isLoggined) {
    return (
      <div className="select-container">
        <SelectItem text="일기 쓰기" link="/write" />
        <SelectItem text="하루 탐색하기" link="/explore" />
        <SelectItem text="내 정보" link="/myInfo" />
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
