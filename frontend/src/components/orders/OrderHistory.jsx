import { useState, useEffect } from 'react'
import { Loader2, PackageOpen, ChevronLeft, KeyRound, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthNavbar } from '../AuthNavbar'
import { getMyOrders } from '../../services/orderService'
import { getStatusInfo, groupOrdersByStatus } from '../../data/orderStatus'

function OrderCard({ order, onOpen, onDeliveryOtp, onReview }) {
  const statusInfo = getStatusInfo(order.status)
  return (
    <div
      className="w-full rounded-[16px] border border-border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-e1)]"
      aria-label={`Track order from ${order.pickup?.city} to ${order.destination?.city}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">
            {order.orderType === 'parcel' ? 'Parcel' : 'Shopping Request'} · {order.bookingMethod === 'public' ? 'Public' : 'Direct'}
          </p>
          <p className="text-[15px] font-bold text-ink">
            {order.pickup?.city} → {order.destination?.city}
          </p>
          <p className="text-[13px] text-ink-muted mt-0.5">
            {order.orderType === 'parcel'
              ? order.items?.[0]?.name
              : order.shoppingDetails?.productLink}
          </p>
          {order.createdAt && (
            <p className="text-[11px] text-ink-muted mt-1.5">
              Created {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 ${statusInfo.cls}`}>
          {statusInfo.label}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-[12px] font-semibold text-primary hover:text-primary-dark"
        >
          View tracking timeline →
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onDeliveryOtp}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary-dark"
          >
            <KeyRound size={14} /> Delivery confirmation
          </button>
          {order.status === 'completed' && order.traveler && (
            <button
              type="button"
              onClick={onReview}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary-dark"
            >
              <Star size={14} /> Leave or view review
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    let cancelled = false
    async function fetchOrders() {
      try {
        const data = await getMyOrders()
        if (!cancelled) setOrders(data.orders || [])
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  const groups = groupOrdersByStatus(orders)
  const currentList = groups[tab]

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => navigate('/sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ink tracking-tight">My Orders</h1>
          <p className="text-[14px] text-ink-secondary mt-1">Everything you've sent through BringBuddy, in one place.</p>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {t.label} <span className="text-[12px] font-normal text-ink-muted ml-0.5">({groups[t.key].length})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-[16px] border border-border bg-white p-10 flex items-center justify-center">
            <Loader2 size={22} className="text-ink-muted animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-border bg-white p-10 text-center">
            <PackageOpen size={28} className="text-ink-muted mx-auto mb-2" />
            <p className="text-[14px] text-ink-secondary">
              No {tab} orders{tab !== 'active' ? '' : ' yet'}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentList.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onOpen={() => navigate(`/orders/${order._id}/tracking`)}
                onDeliveryOtp={() => navigate(`/orders/${order._id}/delivery-otp`)}
                onReview={() => navigate(`/orders/${order._id}/review`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
