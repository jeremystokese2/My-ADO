export const DEFAULT_FIELDS = [
  'System.Id',
  'System.Title',
  'System.State',
  'System.AssignedTo',
  'System.WorkItemType',
  'System.Tags',
  'System.ChangedDate',
  'Microsoft.VSTS.Common.Priority',
]

export const AVAILABLE_FIELDS = [
  { label: 'ID', reference: 'System.Id' },
  { label: 'Title', reference: 'System.Title' },
  { label: 'State', reference: 'System.State' },
  { label: 'Assigned To', reference: 'System.AssignedTo' },
  { label: 'Type', reference: 'System.WorkItemType' },
  { label: 'Tags', reference: 'System.Tags' },
  { label: 'Priority', reference: 'Microsoft.VSTS.Common.Priority' },
  { label: 'Changed', reference: 'System.ChangedDate' },
  { label: 'Area Path', reference: 'System.AreaPath' },
  { label: 'Iteration', reference: 'System.IterationPath' },
]

export const DEFAULT_STATES = ['New', 'Active', 'Resolved', 'Closed']
