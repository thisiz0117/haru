import { html } from 'hono/html'
import { FC } from 'hono/jsx'

type DiaryProps = {
  title: string
  content?: string
  created_at: number
  likes_count: number
  dislikes_count: number
  username: string
  userId: number
}

type TitleProps = {
  title: string
  created_at: number
  username: string
  userId: number
}

type RatingProps = {
  likesCount: number
  dislikeCount: number
}

type ContentProps = {
  content: string
}

const unixToKoDate = (unixTime: number): string => {
  const createdAtUnix = new Date(unixTime)
  const year = createdAtUnix.getFullYear()
  const month = createdAtUnix.getMonth() + 1
  const date = createdAtUnix.getDate()
  return `${year}년 ${month}월 ${date}일`
}

export const DiaryPage: FC<DiaryProps> = (props) => {
  if (!props.content) {
    return (
      <>
        <Title title={props.title} created_at={props.created_at} username={props.username} userId={props.userId} />
        <Content content={props.content!} />
        <br />
        <br />
        <Rating likesCount={props.likes_count} dislikeCount={props.dislikes_count} />
        {html`<script src="/scripts/diary-page"></script>`}
      </>
    )
  }

  return (
    <>
      <Title title={props.title} created_at={props.created_at} username={props.username} userId={props.userId} />
      <Content content={props.content!} />
      <br />
      <br />
      <Rating likesCount={props.likes_count} dislikeCount={props.dislikes_count} />
      {html`<script src="/scripts/diary-page.js"></script>`}
    </>
  )
}

// 버튼 누르면 나타남~
const Content: FC<ContentProps> = (props) => {
  return (
    <div className="dp-content">
      <button type="button"> ⌵ </button>
      <div>{props.content}</div>
    </div>
  )
}

const Title: FC<TitleProps> = (props) => {
  const createdDate = unixToKoDate(props.created_at)

  return (
    <div className="dp-title">
      <h3>{props.title}</h3>
      <div>
        <p>
          작성자: <a href={`/user/${props.userId}`}>{props.username}</a>
        </p>
        <p>작성일: {createdDate}</p>
      </div>
    </div>
  )
}

const Rating: FC<RatingProps> = (props) => {
  return (
    <>
      <button id="like-btn">좋아요: {props.likesCount}</button>
      <button id="dislike-btn">싫어요: {props.dislikeCount}</button>
    </>
  )
}
