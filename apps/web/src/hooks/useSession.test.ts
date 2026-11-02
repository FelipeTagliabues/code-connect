import { act, renderHook } from '@testing-library/react'
import { clearToken, setToken } from '../services/tokenStorage.ts'
import { useSession } from './useSession.ts'

describe('useSession', () => {
  beforeEach(() => {
    clearToken()
  })

  it('acompanha o login e o logout', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.isAuthenticated).toBe(false)

    act(() => setToken('abc', false))
    expect(result.current.isAuthenticated).toBe(true)

    act(() => clearToken())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('considera deslogado quando o JWT já expirou', () => {
    const payload = btoa(JSON.stringify({ exp: Date.now() / 1000 - 60 }))
    setToken(`header.${payload}.assinatura`, false)

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
  })
})
