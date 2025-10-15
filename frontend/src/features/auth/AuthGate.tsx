import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { AuthSettingsForm } from './AuthSettingsForm'

export function AuthGate({ children }: { children: ReactNode }) {
  const {
    state: { pat, organization, project },
  } = useAuth()

  if (!pat || !organization || !project) {
    return (
      <div className="auth-screen">
        <div className="auth-screen__content">
          <header>
            <h1>My ADO Mobile</h1>
            <p>Provide your Azure DevOps details to get started.</p>
          </header>
          <AuthSettingsForm />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
