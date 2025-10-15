import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

interface AuthSettingsFormProps {
  onComplete?: () => void
}

export function AuthSettingsForm({ onComplete }: AuthSettingsFormProps) {
  const { state, setAuthState, clearAuth } = useAuth()
  const [pat, setPat] = useState(state.pat ?? '')
  const [organization, setOrganization] = useState(state.organization)
  const [project, setProject] = useState(state.project)
  const [apiBaseUrl, setApiBaseUrl] = useState(state.apiBaseUrl)
  const [showPat, setShowPat] = useState(false)

  useEffect(() => {
    setPat(state.pat ?? '')
    setOrganization(state.organization)
    setProject(state.project)
    setApiBaseUrl(state.apiBaseUrl)
  }, [state])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthState({
      pat: pat.trim() ? pat.trim() : null,
      organization: organization.trim(),
      project: project.trim(),
      apiBaseUrl: apiBaseUrl.trim() || 'https://dev.azure.com',
    })
    onComplete?.()
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__field">
        <label htmlFor="pat">Personal Access Token</label>
        <div className="auth-form__pat-input">
          <input
            id="pat"
            name="pat"
            type={showPat ? 'text' : 'password'}
            inputMode="text"
            autoComplete="off"
            value={pat}
            onChange={(event) => setPat(event.target.value)}
            placeholder="azdop..."
            required
          />
          <button
            type="button"
            className="link-button"
            onClick={() => setShowPat((value) => !value)}
          >
            {showPat ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="auth-form__field">
        <label htmlFor="organization">Organization</label>
        <input
          id="organization"
          name="organization"
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          placeholder="my-org"
          required
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="project">Project</label>
        <input
          id="project"
          name="project"
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          placeholder="MobileApp"
          required
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="apiBaseUrl">Azure DevOps URL</label>
        <input
          id="apiBaseUrl"
          name="apiBaseUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
          placeholder="https://dev.azure.com"
          required
        />
      </div>

      <div className="auth-form__actions">
        <button type="submit" className="primary-button">
          Save & Continue
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            clearAuth()
            setShowPat(false)
          }}
        >
          Clear
        </button>
      </div>
    </form>
  )
}
