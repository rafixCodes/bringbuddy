import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Circle,
  Clock3,
  Loader2,
  MapPin,
  PackageCheck,
} from 'lucide-react'
import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { getStatusInfo } from '../../data/orderStatus'
import {
  getOrderTracking,
  updateOrderTrackingStatus,
} from '../../services/trackingService'

const STAGE_LABELS = {
  created: 'Created',
  pending: 'Awaiting Traveler',
  accepted: 'Accepted',
  payment_held: 'Payment Secured',
  pickup_scheduled: 'Pickup Scheduled',
  collected: 'Collected',
  in_transit: 'In Transit',
  arrived: 'Arrived',
  delivered: 'Delivered',
  payment_released: 'Payment Released',
  completed: 'Completed',
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function loadTracking() {
    try {
      setError('')
      const data = await getOrderTracking(id)
      setOrder(data.order)
      setStages(data.stages || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load order tracking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracking()
  }, [id])

  const currentIndex = stages.indexOf(order?.status)
  const nextStatus = currentIndex >= 0 ? stages[currentIndex + 1] : null
  const timelineByStatus = useMemo(() => {
    const result = new Map()
    for (const event of order?.timeline || []) result.set(event.status, event)
    return result
  }, [order])

  async function moveToNextStage() {
    if (!nextStatus) return
    try {
      setUpdating(true)
      setError('')
      const data = await updateOrderTrackingStatus(id, nextStatus, note)
      setOrder(data.order)
      setNote('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update order status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="flex min-h-[70vh] items-center justify-center pt-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="mx-auto max-w-[720px] px-6 pt-28">
          <div className="rounded-[16px] border border-danger/20 bg-danger-light p-6 text-danger">
            <AlertCircle className="mb-2" />
            <p className="font-semibold">{error || 'Order not found'}</p>
          </div>
        </main>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="mx-auto max-w-[980px] px-6 pb-20 pt-28">
        <button
          onClick={() => navigate('/order-history')}
          className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to My Orders
        </button>

        <section className="mb-6 rounded-[18px] border border-border bg-white p-6 shadow-[var(--shadow-e1)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-primary">Live order tracking</p>
              <h1 className="text-[26px] font-bold tracking-tight text-ink">
                {order.pickup?.city} → {order.destination?.city}
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-[12px] font-semibold ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
            <div className="flex gap-2.5">
              <PackageCheck size={18} className="mt-0.5 text-primary" />
              <div><p className="text-[11px] text-ink-muted">Order type</p><p className="text-[13px] font-semibold capitalize text-ink">{order.orderType}</p></div>
            </div>
            <div className="flex gap-2.5">
              <MapPin size={18} className="mt-0.5 text-coral" />
              <div><p className="text-[11px] text-ink-muted">Destination</p><p className="text-[13px] font-semibold text-ink">{order.destination?.country}</p></div>
            </div>
            <div className="flex gap-2.5">
              <Clock3 size={18} className="mt-0.5 text-warning" />
              <div><p className="text-[11px] text-ink-muted">Last updated</p><p className="text-[13px] font-semibold text-ink">{formatDate(order.updatedAt)}</p></div>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[18px] border border-border bg-white p-6">
            <h2 className="mb-6 text-[18px] font-bold text-ink">Delivery timeline</h2>
            <div>
              {stages.map((stage, index) => {
                const complete = index <= currentIndex
                const current = index === currentIndex
                const event = timelineByStatus.get(stage)
                return (
                  <div key={stage} className="relative flex gap-4 pb-7 last:pb-0">
                    {index < stages.length - 1 && (
                      <span className={`absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5 ${index < currentIndex ? 'bg-success' : 'bg-border'}`} />
                    )}
                    <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                      complete ? 'border-success bg-success text-white' : 'border-border bg-white text-ink-muted'
                    } ${current ? 'ring-4 ring-success/10' : ''}`}>
                      {complete ? <Check size={15} strokeWidth={3} /> : <Circle size={11} />}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className={`text-[14px] font-semibold ${complete ? 'text-ink' : 'text-ink-muted'}`}>
                        {STAGE_LABELS[stage] || stage}
                        {current && <span className="ml-2 text-[11px] font-bold uppercase tracking-wide text-success">Current</span>}
                      </p>
                      {event ? (
                        <>
                          <p className="mt-0.5 text-[12px] text-ink-secondary">{event.note}</p>
                          <p className="mt-1 text-[11px] text-ink-muted">{formatDate(event.timestamp)}</p>
                        </>
                      ) : (
                        <p className="mt-0.5 text-[12px] text-ink-muted">Upcoming</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <aside className="rounded-[18px] border border-border bg-white p-5 lg:sticky lg:top-24">
            <h2 className="text-[16px] font-bold text-ink">Update progress</h2>
            {nextStatus ? (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  Next stage: <strong className="text-ink">{STAGE_LABELS[nextStatus]}</strong>
                </p>
                <label className="mt-4 block text-[12px] font-semibold text-ink-secondary" htmlFor="tracking-note">
                  Update note (optional)
                </label>
                <textarea
                  id="tracking-note"
                  value={note}
                  maxLength={250}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Example: Parcel collected at the agreed location"
                  className="mt-1.5 min-h-24 w-full resize-y rounded-[8px] border border-border px-3 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-primary"
                />
                <Button className="mt-3 w-full" disabled={updating} onClick={moveToNextStage}>
                  {updating && <Loader2 size={16} className="animate-spin" />}
                  Mark as {STAGE_LABELS[nextStatus]}
                </Button>
              </>
            ) : (
              <div className="mt-4 rounded-[12px] bg-success-light p-4 text-success">
                <Check size={20} className="mb-1" />
                <p className="text-[13px] font-semibold">Delivery workflow completed</p>
              </div>
            )}
            {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}
            <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
              Stages must be completed in order. Every update is saved with its date and time.
            </p>
          </aside>
        </div>
      </main>
    </div>
  )
}
