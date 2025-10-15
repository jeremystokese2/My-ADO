import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addWorkItemComment, getWorkItemDetails, updateWorkItemState } from '../../lib/azureClient'
import type { WorkItemDetailResult } from '../../lib/azureClient'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_FIELDS } from './constants'

const DETAIL_FIELDS = Array.from(
  new Set([
    ...DEFAULT_FIELDS,
    'System.Description',
    'System.AreaPath',
    'System.IterationPath',
    'System.CreatedDate',
    'System.CreatedBy',
  ]),
)

export function WorkItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const workItemId = Number(id)
  const isValidId = Number.isInteger(workItemId) && workItemId > 0
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { state: authState } = useAuth()
  const [comment, setComment] = useState('')

  const detailQuery = useQuery<WorkItemDetailResult, Error>({
    queryKey: ['work-item', authState.organization, authState.project, workItemId],
    queryFn: () => getWorkItemDetails(authState, workItemId, DETAIL_FIELDS),
    enabled: Boolean(authState.pat && authState.organization && authState.project && isValidId),
  })

  const stateOptions = useMemo(() => {
    const currentState = detailQuery.data?.workItem.fields['System.State']
    const defaults = ['New', 'Active', 'Resolved', 'Closed', 'Removed']
    const uniqueStates = new Set<string>(defaults)
    if (typeof currentState === 'string') {
      uniqueStates.add(currentState)
    }
    return Array.from(uniqueStates)
  }, [detailQuery.data?.workItem.fields['System.State']])

  const updateStateMutation = useMutation({
    mutationFn: (newState: string) => updateWorkItemState(authState, workItemId, newState),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['work-item', authState.organization, authState.project, workItemId] })
      await queryClient.invalidateQueries({ queryKey: ['work-items'] })
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addWorkItemComment(authState, workItemId, text),
    onSuccess: async () => {
      setComment('')
      await queryClient.invalidateQueries({ queryKey: ['work-item', authState.organization, authState.project, workItemId] })
    },
  })

  const workItem = detailQuery.data?.workItem

  if (!isValidId) {
    return (
      <div className="page">
        <div className="card card--error">
          <p>Invalid work item id.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="breadcrumbs">
        <button type="button" className="link-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/work-items" className="link-button">
          Work Items
        </Link>
      </div>

      {detailQuery.isLoading && (
        <div className="card">
          <p>Loading work item…</p>
        </div>
      )}

      {detailQuery.error && (
        <div className="card card--error">
          <p>{detailQuery.error.message}</p>
        </div>
      )}

      {workItem && (
        <article className="card">
          <header className="work-item-detail__header">
            <div>
              <p className="work-item-detail__id">#{workItem.id}</p>
              <h1>{String(workItem.fields['System.Title'] ?? 'Untitled work item')}</h1>
              <div className="work-item-detail__meta">
                <span className="badge badge--state">
                  {String(workItem.fields['System.State'] ?? 'Unknown')}
                </span>
                <span>{String(workItem.fields['System.WorkItemType'] ?? '')}</span>
                <span>
                  Assigned to:{' '}
                  {formatIdentity(workItem.fields['System.AssignedTo'])}
                </span>
              </div>
            </div>
          </header>

          <section className="work-item-detail__section">
            <h2>Details</h2>
            <dl className="detail-grid">
              <div>
                <dt>Area</dt>
                <dd>{String(workItem.fields['System.AreaPath'] ?? '—')}</dd>
              </div>
              <div>
                <dt>Iteration</dt>
                <dd>{String(workItem.fields['System.IterationPath'] ?? '—')}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{String(workItem.fields['Microsoft.VSTS.Common.Priority'] ?? '—')}</dd>
              </div>
              <div>
                <dt>Changed</dt>
                <dd>{formatDate(workItem.fields['System.ChangedDate'])}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(workItem.fields['System.CreatedDate'])}</dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{formatIdentity(workItem.fields['System.CreatedBy'])}</dd>
              </div>
            </dl>
          </section>

          <section className="work-item-detail__section">
            <h2>Description</h2>
            <div
              className="description"
              dangerouslySetInnerHTML={{
                __html: String(workItem.fields['System.Description'] ?? '<p>No description</p>'),
              }}
            />
          </section>

          <section className="work-item-detail__section">
            <h2>Change State</h2>
            <form
              className="inline-form"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                const state = String(form.get('state'))
                if (state) {
                  updateStateMutation.mutate(state)
                }
              }}
            >
              <select name="state" defaultValue={String(workItem.fields['System.State'] ?? '')}>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <button type="submit" className="primary-button" disabled={updateStateMutation.isPending}>
                {updateStateMutation.isPending ? 'Updating…' : 'Update'}
              </button>
            </form>
          </section>

          <section className="work-item-detail__section">
            <h2>Comments</h2>
            <form
              className="comment-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (comment.trim()) {
                  addCommentMutation.mutate(comment.trim())
                }
              }}
            >
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment"
                rows={3}
              />
              <button type="submit" className="primary-button" disabled={addCommentMutation.isPending}>
                {addCommentMutation.isPending ? 'Sending…' : 'Send comment'}
              </button>
            </form>
            <ul className="comment-list">
              {detailQuery.data?.comments.map((commentItem) => (
                <li key={commentItem.id}>
                  <div className="comment-list__header">
                    <span className="comment-list__author">{commentItem.createdBy.displayName}</span>
                    <span className="comment-list__timestamp">{formatDate(commentItem.createdDate)}</span>
                  </div>
                  <p>{commentItem.text}</p>
                </li>
              ))}
              {!detailQuery.data?.comments.length && <li>No comments yet.</li>}
            </ul>
          </section>
        </article>
      )}
    </div>
  )
}

function formatDate(value: unknown) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(String(value)))
  } catch (error) {
    return String(value)
  }
}

function formatIdentity(value: unknown) {
  if (value && typeof value === 'object' && 'displayName' in (value as Record<string, unknown>)) {
    return String((value as { displayName?: string }).displayName ?? '')
  }
  return value ? String(value) : 'Unassigned'
}
