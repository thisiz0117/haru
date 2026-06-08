import { html } from 'hono/html';
import { FC, PropsWithChildren } from 'hono/jsx'

type Props = {
  title: string
}

export const MainLayout: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <>
      {html `<!DOCTYPE html>`}
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{props.title}</title>
        </head>
        <body>{props.children}</body>
      </html>
    </>
  )
}
