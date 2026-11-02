const TOKEN_KEY = 'code-connect:access-token'

const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return exp !== undefined && exp * 1000 <= Date.now()
  } catch {
    // Quem decide se um token ilegível vale é a API.
    return false
  }
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  return token && !isExpired(token) ? token : null
}

export function setToken(token: string, remember: boolean): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  notify()
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  notify()
}

/** O evento `storage` só dispara em outras abas, cobrindo login e logout entre elas. */
export function subscribeToToken(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}
