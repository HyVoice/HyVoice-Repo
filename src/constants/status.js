export const STATUS_OPTIONS = [
  { 
    value: 'submitted', 
    label: 'Submitted', 
    color: 'default', 
    icon: '📥',
    description: 'Issue has been reported and is awaiting review'
  },
  { 
    value: 'acknowledged', 
    label: 'Acknowledged', 
    color: 'info', 
    icon: '✅',
    description: 'Municipal authorities have acknowledged the issue'
  },
  { 
    value: 'in-progress', 
    label: 'In Progress', 
    color: 'warning', 
    icon: '🔄',
    description: 'Work has started on resolving the issue'
  },
  { 
    value: 'resolved', 
    label: 'Resolved', 
    color: 'success', 
    icon: '🎉',
    description: 'Issue has been successfully resolved'
  },
  { 
    value: 'rejected', 
    label: 'Rejected', 
    color: 'error', 
    icon: '❌',
    description: 'Issue cannot be addressed at this time'
  },
  { 
    value: 'duplicate', 
    label: 'Duplicate', 
    color: 'secondary', 
    icon: '📋',
    description: 'Similar issue already reported'
  }
];

export const getStatusInfo = (status) => {
  return STATUS_OPTIONS.find(s => s.value === status) || 
         STATUS_OPTIONS[0]; // Default to 'submitted'
};

export const STATUS_FLOW = {
  submitted: ['acknowledged', 'in-progress', 'resolved', 'rejected', 'duplicate'],
  acknowledged: ['in-progress', 'resolved', 'rejected'],
  'in-progress': ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
  duplicate: []
};