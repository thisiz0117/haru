import * as arctic from 'arctic'
import type { Context } from 'hono'

export const initProvider = {
  google: (c: Context) =>
    new arctic.Google(
      c.env.GOOGLE_AUTH_CLIENT,
      c.env.GOOGLE_AUTH_SECRET,
      c.env.GOOGLE_REDIRECT_URI,
    ),
}

export type ProviderType = keyof typeof initProvider
