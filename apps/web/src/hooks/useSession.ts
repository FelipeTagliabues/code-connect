import { useSyncExternalStore } from 'react'
import { getToken, subscribeToToken } from '../services/tokenStorage.ts'

export function useSession(): { isAuthenticated: boolean } {
  const isAuthenticated = useSyncExternalStore(
    subscribeToToken,
    () => getToken() !== null,
  )
  return { isAuthenticated }
}
