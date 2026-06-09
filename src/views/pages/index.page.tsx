import { FC } from 'hono/jsx';
import { RandomHaru } from '../components/random-haru.comp'
import { IndexSelect } from '../components/select.comp'
import { NavLayout } from '../layouts/nav.layout';

type MainPageProps = {
  isLoggined: boolean
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
