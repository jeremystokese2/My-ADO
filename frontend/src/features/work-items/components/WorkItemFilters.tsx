import { useState } from 'react'
import { DEFAULT_STATES } from '../constants'

export interface WorkItemFilterState {
  search: string
  assignedTo: string
  states: string[]
  sortField: string
  sortDirection: 'asc' | 'desc'
}

interface WorkItemFiltersProps {
  value: WorkItemFilterState
  onChange: (value: WorkItemFilterState) => void
  onSubmit: () => void
}

const SORT_OPTIONS = [
  { label: 'Changed Date', value: 'System.ChangedDate' },
  { label: 'Created Date', value: 'System.CreatedDate' },
  { label: 'State', value: 'System.State' },
  { label: 'Title', value: 'System.Title' },
]

export function WorkItemFilters({ value, onChange, onSubmit }: WorkItemFiltersProps) {
  const [customState, setCustomState] = useState('')

  const toggleState = (state: string) => {
    const states = value.states.includes(state)
      ? value.states.filter((item) => item !== state)
      : [...value.states, state]
    onChange({ ...value, states })
  }

  const addCustomState = () => {
    if (!customState.trim()) {
      return
    }
    const normalized = customState.trim()
    if (!value.states.includes(normalized)) {
      onChange({ ...value, states: [...value.states, normalized] })
    }
    setCustomState('')
  }

  return (
    <section className="card">
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="filters__grid">
          <label className="filters__field">
            <span>Search</span>
            <input
              type="search"
              inputMode="search"
              placeholder="keywords or ID"
              value={value.search}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
            />
          </label>

          <label className="filters__field">
            <span>Assigned To</span>
            <input
              type="text"
              inputMode="text"
              placeholder="name or alias"
              value={value.assignedTo}
              onChange={(event) => onChange({ ...value, assignedTo: event.target.value })}
            />
          </label>

          <fieldset className="filters__field filters__field--full">
            <legend>States</legend>
            <div className="state-chips">
              {DEFAULT_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={`chip ${value.states.includes(state) ? 'chip--active' : ''}`}
                  onClick={() => toggleState(state)}
                >
                  {state}
                </button>
              ))}
            </div>
            <div className="custom-state">
              <input
                type="text"
                inputMode="text"
                placeholder="Add custom state"
                value={customState}
                onChange={(event) => setCustomState(event.target.value)}
              />
              <button type="button" className="secondary-button" onClick={addCustomState}>
                Add
              </button>
            </div>
            {value.states.length > 0 && (
              <div className="selected-states">
                {value.states.map((state) => (
                  <span key={state} className="chip chip--small">
                    {state}
                    <button type="button" onClick={() => toggleState(state)} aria-label={`Remove ${state}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </fieldset>

          <div className="filters__field">
            <label htmlFor="sortField">
              <span>Sort By</span>
              <select
                id="sortField"
                value={value.sortField}
                onChange={(event) => onChange({ ...value, sortField: event.target.value })}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="filters__field">
            <label htmlFor="sortDirection">
              <span>Order</span>
              <select
                id="sortDirection"
                value={value.sortDirection}
                onChange={(event) =>
                  onChange({ ...value, sortDirection: event.target.value as WorkItemFilterState['sortDirection'] })
                }
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </label>
          </div>
        </div>

        <div className="filters__actions">
          <button type="submit" className="primary-button">
            Apply
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              onChange({
                search: '',
                assignedTo: '',
                states: [],
                sortField: 'System.ChangedDate',
                sortDirection: 'desc',
              })
            }
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  )
}
