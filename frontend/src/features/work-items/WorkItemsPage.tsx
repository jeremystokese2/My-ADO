import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { queryWorkItems } from '../../lib/azureClient'
import { ColumnSelector } from './components/ColumnSelector'
import { WorkItemFilters } from './components/WorkItemFilters'
import type { WorkItemFilterState } from './components/WorkItemFilters'
import { WorkItemList } from './components/WorkItemList'
import { DEFAULT_FIELDS } from './constants'

const COLUMN_STORAGE_KEY = 'ado-mobile-columns'

const REQUIRED_COLUMNS = ['System.Id', 'System.Title', 'System.State']

function loadInitialColumns(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FIELDS
  }
  const stored = localStorage.getItem(COLUMN_STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as string[]
      const merged = Array.from(new Set([...REQUIRED_COLUMNS, ...parsed]))
      return merged
    } catch (error) {
      console.warn('Failed to read saved columns', error)
    }
  }
  return DEFAULT_FIELDS
}

const initialFilterState: WorkItemFilterState = {
  search: '',
  assignedTo: '',
  states: [],
  sortField: 'System.ChangedDate',
  sortDirection: 'desc',
}

export function WorkItemsPage() {
  const { state: authState } = useAuth()
  const [filters, setFilters] = useState<WorkItemFilterState>(initialFilterState)
  const [appliedFilters, setAppliedFilters] = useState<WorkItemFilterState>(initialFilterState)
  const [columns, setColumns] = useState<string[]>(() => loadInitialColumns())

  const normalizedColumns = useMemo(
    () => Array.from(new Set([...REQUIRED_COLUMNS, ...columns])),
    [columns],
  )

  const queryKey = useMemo(
    () => [
      'work-items',
      authState.organization,
      authState.project,
      appliedFilters,
      normalizedColumns,
    ],
    [authState.organization, authState.project, appliedFilters, normalizedColumns],
  )

  const workItemsQuery = useQuery({
    queryKey,
    queryFn: () =>
      queryWorkItems(authState, {
        searchText: appliedFilters.search,
        assignedTo: appliedFilters.assignedTo,
        states: appliedFilters.states,
        orderBy: {
          field: appliedFilters.sortField,
          descending: appliedFilters.sortDirection === 'desc',
        },
        fields: normalizedColumns,
      }),
    enabled: Boolean(authState.pat && authState.organization && authState.project),
    staleTime: 1000 * 30,
  })

  return (
    <div className="page">
      <WorkItemFilters
        value={filters}
        onChange={(value) => setFilters(value)}
        onSubmit={() => setAppliedFilters(filters)}
      />
      <div className="page__grid">
        <section className="page__content">
          <WorkItemList
            items={workItemsQuery.data?.workItems ?? []}
            columns={normalizedColumns}
            isLoading={workItemsQuery.isLoading || workItemsQuery.isRefetching}
            error={workItemsQuery.error ? (workItemsQuery.error as Error).message : undefined}
            onRetry={() => workItemsQuery.refetch()}
          />
        </section>
        <aside className="page__sidebar">
          <ColumnSelector
            selected={columns}
            onChange={(value) => {
              setColumns(value)
              if (typeof window !== 'undefined') {
                localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(value))
              }
            }}
          />
        </aside>
      </div>
    </div>
  )
}
