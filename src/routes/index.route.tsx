import { Hono } from 'hono'
import { MainLayout } from '../views/layouts/main.layout'

export const indexRoute = new Hono()

indexRoute.get('/x', (c) => {
  return c.html(
    <MainLayout title="main site">
      <h1>welcome</h1>
    </MainLayout>
  )
})
