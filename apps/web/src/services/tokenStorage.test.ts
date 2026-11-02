import { clearToken, getToken, setToken } from './tokenStorage.ts'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('usa localStorage ao lembrar o usuário', () => {
    setToken('abc', true)
    expect(localStorage).toHaveLength(1)
    expect(sessionStorage).toHaveLength(0)
    expect(getToken()).toBe('abc')
  })

  it('usa sessionStorage quando não deve lembrar', () => {
    setToken('abc', false)
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(1)
    expect(getToken()).toBe('abc')
  })

  it('substitui o token anterior nos dois storages', () => {
    setToken('antigo', true)
    setToken('novo', false)
    expect(localStorage).toHaveLength(0)
    expect(getToken()).toBe('novo')
  })

  it('remove o token', () => {
    setToken('abc', true)
    clearToken()
    expect(getToken()).toBeNull()
  })
})
