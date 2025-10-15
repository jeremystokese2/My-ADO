import { AVAILABLE_FIELDS } from '../constants'

const LOCKED_COLUMNS = new Set(['System.Id', 'System.Title', 'System.State'])

interface ColumnSelectorProps {
  selected: string[]
  onChange: (columns: string[]) => void
}

export function ColumnSelector({ selected, onChange }: ColumnSelectorProps) {
  const toggleColumn = (reference: string) => {
    if (LOCKED_COLUMNS.has(reference)) {
      return
    }
    if (selected.includes(reference)) {
      onChange(selected.filter((value) => value !== reference))
    } else {
      onChange([...selected, reference])
    }
  }

  return (
    <div className="card">
      <h3 className="card__title">Columns</h3>
      <div className="column-selector">
        {AVAILABLE_FIELDS.map((field) => (
          <label key={field.reference} className="column-selector__option">
            <input
              type="checkbox"
              checked={selected.includes(field.reference)}
              onChange={() => toggleColumn(field.reference)}
              disabled={LOCKED_COLUMNS.has(field.reference)}
            />
            <span>{field.label}</span>
            </label>
        ))}
      </div>
    </div>
  )
}
