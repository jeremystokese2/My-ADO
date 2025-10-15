import { createContext, useContext } from 'react'

export interface AuthState {
  pat: string | null
  organization: string
  project: string
  apiBaseUrl: string
}

export interface AuthContextValue {
  state: AuthState
  setAuthState: (state: AuthState) => void
  clearAuth: () => void
}

export const defaultAuthState: AuthState = {
  pat: null,
  organization: '',
  project: '',
  apiBaseUrl: 'https://dev.azure.com',
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
