import { Package, Search, ShoppingBag, ArrowRight, Clock, CheckCircle2, Truck, ChevronRight, Star, Shield, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useAuth } from '../../context/AuthContext'
import { TRAVELERS } from '../../data/prototype'

// DUMMY DATA — Order Management (Features 4/5/9) not built on backend yet.
// Replace with a real API call once orders exist.
const ACTIVE_DELIVERIES = [
  {
    id: 'BB-1047',
    route: 'Dhaka → London',
    weight: '1.2 kg',
    traveler: 'Karim Hossain',
    travelerId: 't2',
    status: 'transit',
    statusLabel: 'In Transit',
    date: '1 Sep 2026',
    progress: 3,
  },
]

// DUMMY DATA — same as above, standing in for Figma's `activeOrder` global state,
// which no longer exists after we dropped their custom router.
const DUMMY_ACTIVE_ORDER = {
  status: 'transit',
  from: 'Dhaka',
  to: 'London',
  travelerName: 'Karim Hossain',
  weightKg: 1.2,
  travelDate: '1 Sep 2026',
}

const STATUS_STEPS = ['Request', 'Accepted', 'Pickup', 'In Transit', 'Delivered']

const statusColors = {
  pending: 'bg-warning-light text-warning',
  accepted: 'bg-info-light text-info',
  pickup: 'bg-primary-light text-primary',
  transit: 'bg-coral-light text-coral',
  delivered: 'bg-success-light text-success',
}

function DeliveryCard({ d }) {
  const navigate = useNavigate()
  const traveler = TRAVELERS.find(t => t.id === d.travelerId)

  return (
    <div className="rounded-[16px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">Order #{d.id}</p>
          <p className="text-[16px] font-bold text-ink">{d.route}</p>
          <p className="text-[13px] text-ink-muted">{d.weight} · Travel {d.date}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 ${statusColors[d.status]}`}>
          {d.statusLabel}
        </span>
      </div>

      {traveler && (
        <div className="flex items-center gap-2 mb-4 bg-divider rounded-[10px] px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
            {traveler.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink">{traveler.name}</p>
            <p className="text-[11px] text-ink-muted">{traveler.rating}★ · {traveler.completedDeliveries} deliveries</p>
          </div>
          {traveler.verified && <CheckCircle2 size={14} className="text-success shrink-0" />}
        </div>
      )}

      <div className="flex items-center gap-0 mb-4">
        {STATUS_STEPS.map((step, i) => {
          const done = i < d.progress
          const active = i === d.progress - 1
          return (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold transition-all ${
                done ? 'bg-primary text-white' : 'bg-border text-ink-muted'
              } ${active ? 'ring-2 ring-primary/30' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-0.5 ${done && i < d.progress - 1 ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-ink-muted mb-4">
        {STATUS_STEPS.map(s => <span key={s} className="text-center" style={{ flex: 1 }}>{s}</span>)}
      </div>

      <Button
        variant="secondary"
        size="md"
        className="w-full group-hover:border-primary/40 group-hover:text-primary transition-all"
        trailingIcon={<ArrowRight size={14} />}
        onClick={() => navigate('/order-hub')}
      >
        View Order
      </Button>
    </div>
  )
}

const SENDER_STATUS = {
  pending: { label: 'Awaiting Response', cls: 'bg-warning-light text-warning' },
  accepted: { label: 'Accepted', cls: 'bg-info-light text-info' },
  paid: { label: 'Payment Secured', cls: 'bg-primary-light text-primary' },
  arranged: { label: 'Pickup Arranged', cls: 'bg-primary-light text-primary' },
  'picked-up': { label: 'Picked Up', cls: 'bg-primary-light text-primary' },
  transit: { label: 'In Transit', cls: 'bg-coral-light text-coral' },
  ready: { label: 'Delivery Ready', cls: 'bg-coral-light text-coral' },
  completed: { label: 'Completed', cls: 'bg-success-light text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-danger-light text-danger' },
}

export function SenderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const activeOrder = DUMMY_ACTIVE_ORDER // placeholder until Order Management exists
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[14px] text-ink-muted mb-1">Sender Dashboard</p>
            <h1 className="text-[32px] font-bold text-ink tracking-tight">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[15px] text-ink-secondary mt-1">Ready to send something?</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg" leadingIcon={<Search size={16} />} trailingIcon={<ArrowRight size={15} />} onClick={() => navigate('/trip-search')}>
              Find a Trip
            </Button>
            <Button variant="secondary" size="lg" leadingIcon={<Package size={16} />} onClick={() => navigate('/order-new')}>
              Create Order
            </Button>
            <Button variant="ghost" size="lg" leadingIcon={<ShoppingBag size={16} />} onClick={() => navigate('/marketplace')}>
              Marketplace
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Package size={18} className="text-primary" />, value: '3', label: 'Active orders', bg: 'bg-primary-light' },
            { icon: <CheckCircle2 size={18} className="text-success" />, value: '11', label: 'Completed', bg: 'bg-success-light' },
            { icon: <Clock size={18} className="text-warning" />, value: '1', label: 'Awaiting response', bg: 'bg-warning-light' },
            { icon: <Star size={18} className="text-coral" />, value: '4.8★', label: 'Avg. rating given', bg: 'bg-coral-light' },
          ].map(s => (
            <div key={s.label} className="rounded-[14px] border border-border bg-white p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[20px] font-bold text-ink leading-tight">{s.value}</p>
                <p className="text-[12px] text-ink-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-ink">Active Deliveries</h2>
                <button className="text-[13px] text-primary font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight size={13} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {ACTIVE_DELIVERIES.map(d => <DeliveryCard key={d.id} d={d} />)}
              </div>
            </div>

            {activeOrder && activeOrder.status !== 'completed' && (
              <div>
                <h2 className="text-[18px] font-bold text-ink mb-4">
                  {activeOrder.status === 'pending' ? 'Pending Requests' : 'Your Order'}
                </h2>
                <div className="rounded-[16px] border border-border bg-white p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${SENDER_STATUS[activeOrder.status].cls}`}>
                    {activeOrder.status === 'transit' ? <Truck size={20} /> : activeOrder.status === 'pending' ? <Clock size={20} /> : <Package size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink">{activeOrder.from} → {activeOrder.to}</p>
                      <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${SENDER_STATUS[activeOrder.status].cls}`}>
                        {SENDER_STATUS[activeOrder.status].label}
                      </span>
                    </div>
                    <p className="text-[13px] text-ink-muted mt-0.5">Traveler {activeOrder.travelerName} · {activeOrder.weightKg} kg · {activeOrder.travelDate}</p>
                    <button onClick={() => navigate('/order-hub')} className="mt-3 text-[13px] text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      Open Order Hub <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Quick Actions</p>
              </div>
              {[
                { icon: <Search size={15} className="text-primary" />, label: 'Search traveler trips', action: () => navigate('/trip-search') },
                { icon: <Package size={15} className="text-primary" />, label: 'New delivery request', action: () => navigate('/order-new') },
                { icon: <ShoppingBag size={15} className="text-coral" />, label: 'Browse Marketplace', action: () => navigate('/marketplace') },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="flex w-full items-center gap-3 px-5 py-3 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors">
                  <div className="w-7 h-7 rounded-[7px] bg-divider flex items-center justify-center shrink-0">{item.icon}</div>
                  {item.label}
                  <ChevronRight size={13} className="ml-auto text-ink-muted" />
                </button>
              ))}
            </div>

            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Trust & Safety</p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                {[
                  { icon: <Shield size={14} className="text-primary" />, text: 'Escrow-protected payments' },
                  { icon: <CheckCircle2 size={14} className="text-success" />, text: 'Verified travelers only' },
                  { icon: <Zap size={14} className="text-warning" />, text: 'OTP delivery confirmation' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5 text-[12px] text-ink-secondary">
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Recent Activity</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { text: 'Karim picked up your parcel', time: '2h ago', icon: '📦' },
                  { text: 'Request sent to Aisha Rahman', time: 'Yesterday', icon: '✉️' },
                  { text: 'Delivery completed · Order #BB-1041', time: '3 days ago', icon: '✅' },
                ].map(a => (
                  <div key={a.text} className="flex items-start gap-3 px-5 py-3">
                    <span className="text-base mt-0.5">{a.icon}</span>
                    <div>
                      <p className="text-[12px] text-ink leading-snug">{a.text}</p>
                      <p className="text-[11px] text-ink-muted">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}