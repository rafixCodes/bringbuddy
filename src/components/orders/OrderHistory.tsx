import { useState } from 'react'
import {
  Package, ShoppingBag, CheckCircle2, Clock, X, ArrowRight, ChevronLeft,
  Truck, AlertCircle,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'

type HistoryFilter = 'all' | 'active' | 'completed' | 'cancelled' | 'disputed'

const MOCK_ORDERS = [
  { id: 'BB-1048', route: 'Dhaka → London', type: 'carry-only' as const, weight: '2.5 kg', counterpart: 'Aisha Rahman', date: '28 Aug 2026', status: 'completed' as const, fee: '৳1,125' },
  { id: 'BB-1047', route: 'Dhaka → London', type: 'carry-only' as const, weight: '1.2 kg', counterpart: 'Karim Hossain', date: '1 Sep 2026', status: 'active' as const, fee: '৳576' },
  { id: 'BB-1041', route: 'Dhaka → Singapore', type: 'shopping-request' as const, weight: null, counterpart: 'Priya Nair', date: '22 Aug 2026', status: 'completed' as const, fee: '৳920' },
  { id: 'BB-1035', route: 'London → Dhaka', type: 'carry-only' as const, weight: '3 kg', counterpart: 'Syed Imran', date: '14 Aug 2026', status: 'completed' as const, fee: '৳1,360' },
  { id: 'BB-1029', route: 'Dhaka → London', type: 'carry-only' as const, weight: '2 kg', counterpart: 'Aisha Rahman', date: '5 Aug 2026', status: 'completed' as const, fee: '৳900' },
  { id: 'BB-1020', route: 'Dhaka → Dubai', type: 'shopping-request' as const, weight: null, counterpart: 'Nadia Sultana', date: '18 Jul 2026', status: 'cancelled' as const, fee: '৳720' },
]

const STATUS_CONFIG = {
  active: { label: 'Active', cls: 'bg-primary-light text-primary', icon: <Truck size={14} /> },
  completed: { label: 'Completed', cls: 'bg-success-light text-success', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Cancelled', cls: 'bg-divider text-ink-muted', icon: <X size={14} /> },
  disputed: { label: 'Disputed', cls: 'bg-danger-light text-danger', icon: <AlertCircle size={14} /> },
}

export function OrderHistory() {
  const { navigate, user, activeOrder } = useRouter()
  const [filter, setFilter] = useState<HistoryFilter>('all')

  const isTravel = user?.mode === 'traveler'

  // Include active order from state if present
  const allOrders = activeOrder
    ? [
        {
          id: activeOrder.id,
          route: `${activeOrder.from} → ${activeOrder.to}`,
          type: activeOrder.type,
          weight: activeOrder.weightKg ? `${activeOrder.weightKg} kg` : null,
          counterpart: isTravel ? (activeOrder.senderName ?? 'Sender') : activeOrder.travelerName,
          date: activeOrder.travelDate,
          status: (activeOrder.status === 'completed' ? 'completed' : activeOrder.status === 'cancelled' ? 'cancelled' : 'active') as any,
          fee: `৳${activeOrder.carryingFee.toLocaleString()}`,
        },
        ...MOCK_ORDERS,
      ]
    : MOCK_ORDERS

  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter)

  const FILTERS: { key: HistoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'disputed', label: 'Disputed' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate(isTravel ? 'traveler-dashboard' : 'sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> {isTravel ? 'Traveler Dashboard' : 'Sender Dashboard'}
        </button>

        <div className="flex items-end justify-between gap-4 mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <h1 className="text-[28px] font-bold text-ink">Order History</h1>
            <p className="text-[14px] text-ink-secondary mt-1">{allOrders.length} total orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-6 rounded-[12px] bg-divider p-1 w-fit animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both] overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-[9px] px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === f.key ? 'bg-white shadow-[var(--shadow-e1)] text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <Package size={28} className="text-ink-muted mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-ink mb-1.5">No {filter !== 'all' ? filter : ''} orders</h3>
            <p className="text-[14px] text-ink-secondary mb-5">
              {filter === 'all' ? 'Your order history will appear here.' : `You have no ${filter} orders.`}
            </p>
            <Button variant="primary" size="md" onClick={() => navigate(isTravel ? 'marketplace' : 'trip-search')}>
              {isTravel ? 'Browse Marketplace' : 'Find a Trip'}
            </Button>
          </div>
        ) : (
          <div className="rounded-[18px] border border-border bg-white overflow-hidden animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="divide-y divide-border">
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.cancelled
                return (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
                    {/* Type icon */}
                    <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 ${
                      order.type === 'carry-only' ? 'bg-primary-light' : 'bg-coral-light'
                    }`}>
                      {order.type === 'carry-only'
                        ? <Package size={16} className="text-primary" />
                        : <ShoppingBag size={16} className="text-coral" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-ink">{order.route}</p>
                        <span className={`flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5 ${cfg.cls}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-muted mt-0.5">
                        #{order.id} · {order.type === 'carry-only' ? 'Carry Only' : 'Shopping'}{order.weight ? ` · ${order.weight}` : ''} · {order.counterpart}
                      </p>
                    </div>

                    {/* Date + fee */}
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-ink">{order.fee}</p>
                      <p className="text-[11px] text-ink-muted">{order.date}</p>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => navigate('order-hub')}
                      className="shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
