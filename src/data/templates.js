// Template registry — add an entry for each email template.
// status: 'not-started' | 'in-progress' | 'in-review' | 'done'

export const templates = [
  // Example entry — replace with real templates:
  // {
  //   id: 'booking-confirmation',
  //   name: 'Booking Confirmation',
  //   category: 'Transactional',
  //   figma: 'https://www.figma.com/...',
  //   status: 'not-started',
  //   old: '/templates/old/booking-confirmation.html',
  //   new: '/templates/new/booking-confirmation.html',
  // },
]

export const categories = [...new Set(templates.map(t => t.category))].sort()

export const statusConfig = {
  'not-started': { label: 'Not started', color: '#9ca3af' },
  'in-progress':  { label: 'In progress',  color: '#f59e0b' },
  'in-review':    { label: 'In review',    color: '#3b82f6' },
  'done':         { label: 'Done',         color: '#22c55e' },
}
