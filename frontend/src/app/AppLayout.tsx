import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AuthGate } from '../features/auth/AuthGate'
import { AuthSettingsForm } from '../features/auth/AuthSettingsForm'
import { useAuth } from '../features/auth/AuthContext'

export function AppLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const {
    state: { organization, project },
    clearAuth,
  } = useAuth()

  return (
    <div className="app">
      <header className="top-bar">
        <div>
          <h1 className="top-bar__title">My ADO</h1>
          <p className="top-bar__subtitle">
            {organization && project ? `${organization} / ${project}` : 'Configure your workspace'}
          </p>
        </div>
        <div className="top-bar__actions">
          <button className="secondary-button" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </button>
          <button className="secondary-button" onClick={clearAuth}>
            Sign out
          </button>
        </div>
      </header>
      <main className="app__main">
        <AuthGate>
          <Outlet />
        </AuthGate>
      </main>
      {isSettingsOpen && (
        <div className="sheet">
          <div className="sheet__backdrop" onClick={() => setIsSettingsOpen(false)} />
          <div className="sheet__content">
            <header className="sheet__header">
              <h2>Workspace settings</h2>
              <button className="link-button" onClick={() => setIsSettingsOpen(false)}>
                Close
              </button>
            </header>
            <AuthSettingsForm onComplete={() => setIsSettingsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
