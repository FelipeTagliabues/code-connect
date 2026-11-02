import { api } from './api.ts'
import { clearToken, setToken } from './tokenStorage.ts'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

export type SignUpPayload = {
  name: string
  email: string
  phone: string
  password: string
}

type AccessToken = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export async function signUp(payload: SignUpPayload): Promise<User> {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function signIn(
  email: string,
  password: string,
  remember: boolean,
): Promise<void> {
  const { data } = await api.post<AccessToken>('/sessions', { email, password })
  setToken(data.accessToken, remember)
}

export function signOut(): void {
  clearToken()
}
