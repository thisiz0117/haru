import { Hono } from 'hono'
import { initProvider, ProviderType } from '../services/providers.service'
import * as arctic from 'arctic'

/*
  # Auth Api
  -> 모든 로그인 로직 관리
*/

const authApi = new Hono()

authApi.get('/:provider', async (c) => {
  // create provider instance
  const providerName = c.req.param('provider') as ProviderType
  const providerInstance = initProvider[providerName]

  const state = arctic.generateState()
  const codeVerifier = arctic.generateCodeVerifier()
  const scopes = ['openid', 'profile']
  const url = providerInstance.createAuthorizationURL(state, codeVerifier, scopes)
})

export default authApi
