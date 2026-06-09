import { FC } from 'hono/jsx'

type RHProps = {
  diary: string
  writer: string
  likeCount: number
}

export const RandomHaru: FC<RHProps> = (props) => {
  return (
    <div className="random-haru-container">
      <div className="diary">
        <p>ㄱ</p>
        <h3>"{props.diary}"</h3>
        <p>ㄴ</p>
      </div>
      <p>{props.likeCount} 개의 좋아요를 받은 '{props.writer}' 님의 일기입니다.</p>
    </div>
  )
}
