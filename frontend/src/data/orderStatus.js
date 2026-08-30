// Real Order.js status enum (12 values). Single source of truth for how
// each status is labeled/colored across the app — extracted here instead
// of duplicated in SenderDashboard.jsx and OrderHistory.jsx separately,
// so the two can't silently drift out of sync with each other or with the
// actual backend enum.
export const REAL_ORDER_STATUS = {
  created: { label: 'Created', cls: 'bg-info-light text-info' },
  pending: { label: 'Awaiting Traveler', cls: 'bg-warning-light text-warning' },
  accepted: { label: 'Accepted', cls: 'bg-primary-light text-primary' },
  payment_held: { label: 'Payment Secured', cls: 'bg-primary-light text-primary' },
  pickup_scheduled: { label: 'Pickup Scheduled', cls: 'bg-primary-light text-primary' },
  collected: { label: 'Collected', cls: 'bg-primary-light text-primary' },
  in_transit: { label: 'In Transit', cls: 'bg-coral-light text-coral' },
  arrived: { label: 'Arrived', cls: 'bg-coral-light text-coral' },
  delivered: { label: 'Delivered', cls: 'bg-success-light text-success' },
  payment_released: { label: 'Payment Released', cls: 'bg-success-light text-success' },
  completed: { label: 'Completed', cls: 'bg-success-light text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-danger-light text-danger' },
}

export function getStatusInfo(status) {
  return REAL_ORDER_STATUS[status] || { label: status, cls: 'bg-divider text-ink-secondary' }
}

// Groups the raw 12-value enum into 3 buckets for tabbed views. Adjust here
// (not per-page) if the backend enum or grouping logic ever changes.
const ACTIVE_STATUSES = new Set([
  'created', 'pending', 'accepted', 'payment_held',
  'pickup_scheduled', 'collected', 'in_transit', 'arrived',
])
const COMPLETED_STATUSES = new Set(['delivered', 'payment_released', 'completed'])
const CANCELLED_STATUSES = new Set(['cancelled'])

export function groupOrdersByStatus(orders) {
  const groups = { active: [], completed: [], cancelled: [] }
  for (const order of orders) {
    if (CANCELLED_STATUSES.has(order.status)) groups.cancelled.push(order)
    else if (COMPLETED_STATUSES.has(order.status)) groups.completed.push(order)
    else if (ACTIVE_STATUSES.has(order.status)) groups.active.push(order)
    else groups.active.push(order) // unknown status — default to active rather than hiding it
  }
  return groups
}