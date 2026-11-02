import { AxiosError, type AxiosAdapter } from 'axios'
import { api } from './api.ts'
import { clearToken, getToken, setToken } from './tokenStorage.ts'

const adapter: AxiosAdapter = async (config) => ({
  data: null,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('api', () => {
  beforeEach(() => {
    clearToken()
  })

  it('envia o token no header Authorization', async () => {
    setToken('abc', false)
    const { config } = await api.get('/users/me', { adapter })
    expect(config.headers.Authorization).toBe('Bearer abc')
  })

  it('não envia o header sem token', async () => {
    const { config } = await api.get('/users/me', { adapter })
    expect(config.headers.Authorization).toBeUndefined()
  })

  describe('resposta 401', () => {
    const unauthorized: AxiosAdapter = (config) =>
      Promise.reject(
        new AxiosError('401', undefined, config, undefined, {
          data: null,
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        }),
      )

    it('encerra a sessão em uma requisição autenticada', async () => {
      setToken('abc', false)
      await expect(api.post('/posts', null, { adapter: unauthorized })).rejects.toThrow()
      expect(getToken()).toBeNull()
    })

    it('mantém a sessão quando o 401 vem do login', async () => {
      setToken('abc', false)
      await expect(api.post('/sessions', null, { adapter: unauthorized })).rejects.toThrow()
      expect(getToken()).toBe('abc')
    })
  })
})
