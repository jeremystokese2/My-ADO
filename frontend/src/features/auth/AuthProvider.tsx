import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext, defaultAuthState } from './AuthContext'
import type { AuthContextValue, AuthState } from './AuthContext'

const STORAGE_KEY = 'ado-mobile-auth'

function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return defaultAuthState
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as AuthState
      return { ...defaultAuthState, ...parsed }
    } catch (error) {
      console.warn('Failed to parse auth state from storage', error)
    }
  }

  return {
    ...defaultAuthState,
    organization: import.meta.env.VITE_AZDO_ORG ?? defaultAuthState.organization,
    project: import.meta.env.VITE_AZDO_PROJECT ?? defaultAuthState.project,
    apiBaseUrl: import.meta.env.VITE_AZDO_API_BASE ?? defaultAuthState.apiBaseUrl,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadInitialState())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const clearAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setState(loadInitialState())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      setAuthState: setState,
      clearAuth,
    }),
    [state, clearAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
