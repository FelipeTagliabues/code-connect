import axios, { isAxiosError } from 'axios'
import { clearToken, getToken } from './tokenStorage.ts'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, (error: unknown) => {
  // Em /sessions, 401 significa credenciais erradas, não uma sessão inválida.
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers.Authorization &&
    error.config.url !== '/sessions'
  ) {
    clearToken()
  }
  throw error
})
