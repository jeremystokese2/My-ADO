import { Link } from 'react-router-dom'
import type { WorkItemDetails } from '../../../lib/azureClient'
import { AVAILABLE_FIELDS } from '../constants'

interface WorkItemListProps {
  items: WorkItemDetails[]
  columns: string[]
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

const fieldLookup = new Map(AVAILABLE_FIELDS.map((field) => [field.reference, field.label]))

export function WorkItemList({ items, columns, isLoading, error, onRetry }: WorkItemListProps) {
  if (isLoading) {
    return (
      <div className="card">
        <p>Loading work items…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card card--error">
        <p>{error}</p>
        {onRetry && (
          <button className="primary-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="card">
        <p>No work items match your filters.</p>
      </div>
    )
  }

  return (
    <div className="work-item-list">
      {items.map((item) => (
        <Link key={item.id} to={`/work-items/${item.id}`} className="work-item-card">
          <header className="work-item-card__header">
            <span className="work-item-card__id">#{item.id}</span>
            <h3 className="work-item-card__title">{String(item.fields['System.Title'] ?? 'Untitled')}</h3>
            <span className={`badge badge--state state-${(item.fields['System.State'] as string)?.toLowerCase()}`}>
              {String(item.fields['System.State'] ?? 'Unknown')}
            </span>
          </header>
          <ul className="work-item-card__meta">
            {columns
              .filter((reference) => reference !== 'System.Id' && reference !== 'System.Title' && reference !== 'System.State')
              .map((reference) => (
                <li key={reference}>
                  <span className="work-item-card__meta-label">{fieldLookup.get(reference) ?? reference}</span>
                  <span className="work-item-card__meta-value">
                    {formatFieldValue(item.fields[reference])}
                  </span>
                </li>
              ))}
          </ul>
        </Link>
      ))}
    </div>
  )
}

function formatFieldValue(value: unknown) {
  if (value == null) {
    return '—'
  }

  if (typeof value === 'object') {
    if ('displayName' in (value as Record<string, unknown>)) {
      return String((value as { displayName?: string }).displayName ?? '')
    }
    return JSON.stringify(value)
  }

  return String(value)
}
