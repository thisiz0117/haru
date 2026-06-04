import { connect } from '@tidbcloud/serverless'

interface Env {
  DB_ADMIN_URl: string
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    try {
      const connection = connect({ url: env.DB_ADMIN_URl })
      await connection.execute('delete from ref_tokens where expires_at < now()')
      console.log('!!cleaned up refresh token!!')
    } catch (e) {
      return console.error(`msg: db err, err: ${e}`)
    }
  },
}
