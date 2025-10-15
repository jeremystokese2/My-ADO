import type { AuthState } from '../features/auth/AuthContext'

const API_VERSION = '7.1-preview.2'
const COMMENTS_API_VERSION = '7.1-preview.3'

export interface WorkItemField {
  referenceName: string
  name: string
  value: unknown
}

export interface WorkItemSummary {
  id: number
  url: string
  fields: Record<string, unknown>
}

export interface WorkItemDetails extends WorkItemSummary {
  relations?: Array<{ rel: string; url: string; attributes?: Record<string, unknown> }>
}

export interface QueryWorkItemsParams {
  searchText?: string
  states?: string[]
  assignedTo?: string
  orderBy?: {
    field: string
    descending?: boolean
  }
  fields: string[]
}

export interface QueryResult {
  workItems: WorkItemDetails[]
}

export interface WorkItemComment {
  id: number
  text: string
  createdDate: string
  modifiedDate?: string
  createdBy: {
    displayName: string
    uniqueName?: string
  }
}

export interface WorkItemDetailResult {
  workItem: WorkItemDetails
  comments: WorkItemComment[]
}

function getBaseUrl(auth: AuthState) {
  return `${auth.apiBaseUrl.replace(/\/$/, '')}/${auth.organization}/${auth.project}`
}

function getHeaders(pat: string) {
  const encoded = btoa(`:${pat}`)
  return {
    Authorization: `Basic ${encoded}`,
  }
}

async function azureFetch<T>(url: string, pat: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': init?.body ? 'application/json' : 'application/json',
      ...init?.headers,
      ...getHeaders(pat),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Azure DevOps request failed (${response.status}): ${text}`)
  }

  return (await response.json()) as T
}

export async function queryWorkItems(auth: AuthState, params: QueryWorkItemsParams): Promise<QueryResult> {
  if (!auth.pat) {
    throw new Error('PAT is required to query work items')
  }

  const baseUrl = getBaseUrl(auth)
  const wiqlParts: string[] = ["SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project"]

  if (params.searchText) {
    wiqlParts.push(`AND [System.Title] CONTAINS '${params.searchText.replace(/'/g, "''")}'`)
  }

  if (params.states && params.states.length > 0) {
    const stateList = params.states.map((state) => `'${state.replace(/'/g, "''")}'`).join(', ')
    wiqlParts.push(`AND [System.State] IN (${stateList})`)
  }

  if (params.assignedTo) {
    wiqlParts.push(`AND [System.AssignedTo] CONTAINS '${params.assignedTo.replace(/'/g, "''")}'`)
  }

  if (params.orderBy) {
    wiqlParts.push(
      `ORDER BY [${params.orderBy.field}] ${params.orderBy.descending ? 'DESC' : 'ASC'}`,
    )
  } else {
    wiqlParts.push('ORDER BY [System.ChangedDate] DESC')
  }

  const queryUrl = `${baseUrl}/_apis/wit/wiql?api-version=${API_VERSION}`

  const wiqlResponse = await azureFetch<{ workItems: Array<{ id: number }> }>(queryUrl, auth.pat, {
    method: 'POST',
    body: JSON.stringify({ query: wiqlParts.join(' ') }),
  })

  if (!wiqlResponse.workItems.length) {
    return { workItems: [] }
  }

  const workItemIds = wiqlResponse.workItems.map((item) => item.id)
  const batchUrl = `${baseUrl}/_apis/wit/workitemsbatch?api-version=${API_VERSION}`
  const batchResponse = await azureFetch<{ value: WorkItemDetails[] }>(batchUrl, auth.pat, {
    method: 'POST',
    body: JSON.stringify({
      ids: workItemIds,
      fields: params.fields,
    }),
  })

  return { workItems: batchResponse.value }
}

export async function getWorkItemDetails(auth: AuthState, id: number, fields: string[]): Promise<WorkItemDetailResult> {
  if (!auth.pat) {
    throw new Error('PAT is required to query work items')
  }

  const baseUrl = getBaseUrl(auth)
  const workItemUrl = `${baseUrl}/_apis/wit/workitems/${id}?api-version=${API_VERSION}&$expand=relations&fields=${encodeURIComponent(fields.join(','))}`
  const workItem = await azureFetch<WorkItemDetails>(workItemUrl, auth.pat)

  const commentsUrl = `${baseUrl}/_apis/wit/workItems/${id}/comments?api-version=${COMMENTS_API_VERSION}`
  const commentsResponse = await azureFetch<{ count: number; value: WorkItemComment[] }>(commentsUrl, auth.pat)

  return {
    workItem,
    comments: commentsResponse.value ?? [],
  }
}

export async function updateWorkItemState(auth: AuthState, id: number, state: string) {
  if (!auth.pat) {
    throw new Error('PAT is required to update work items')
  }

  const baseUrl = getBaseUrl(auth)
  const url = `${baseUrl}/_apis/wit/workitems/${id}?api-version=${API_VERSION}`
  await azureFetch(url, auth.pat, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json-patch+json' },
    body: JSON.stringify([
      {
        op: 'add',
        path: '/fields/System.State',
        value: state,
      },
    ]),
  })
}

export async function addWorkItemComment(auth: AuthState, id: number, text: string) {
  if (!auth.pat) {
    throw new Error('PAT is required to add comments')
  }

  const baseUrl = getBaseUrl(auth)
  const url = `${baseUrl}/_apis/wit/workItems/${id}/comments?api-version=${COMMENTS_API_VERSION}`
  await azureFetch(url, auth.pat, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
