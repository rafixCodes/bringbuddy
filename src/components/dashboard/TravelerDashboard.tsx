import {
  Plane, Package, Plus, ChevronRight, ArrowRight, CheckCircle2,
  Star, Wallet, Clock, AlertCircle, TrendingUp, Shield,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { useToast } from '../../lib/toast'

// Prototype incoming request state (set when sender sends a request)
export const PROTOTYPE_REQUEST = {
  id: 'req-001',
  orderId: 'BB-1048',
  senderName: 'Alex Johnson',
  senderInitials: 'AJ',
  senderRating: 4.7,
  route: 'Dhaka → London',
  from: 'Dhaka',
  to: 'London',
  date: '28 Aug 2026',
  weightKg: 2.5,
  itemDescription: 'Traditional clothing and small gifts',
  pickupAddress: 'Gulshan-2, Dhaka',
  receiverName: 'Sadia Islam',
  receiverPhone: '+44 7912 345678',
  carryingFee: 1125,
  serviceFee: 90,
  specialInstructions: 'Please handle with care. Items are fragile.',
}

const TRAVELER_STATUS: Record<string, { label: string; cls: string }> = {
  accepted: { label: 'Accepted', cls: 'bg-info-light text-info' },
  paid: { label: 'Payment Secured', cls: 'bg-primary-light text-primary' },
  arranged: { label: 'Pickup Arranged', cls: 'bg-primary-light text-primary' },
  'picked-up': { label: 'Picked Up', cls: 'bg-primary-light text-primary' },
  transit: { label: 'In Transit', cls: 'bg-coral-light text-coral' },
  ready: { label: 'Delivery Ready', cls: 'bg-coral-light text-coral' },
  completed: { label: 'Completed', cls: 'bg-success-light text-success' },
}

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-[12px] text-ink-muted mb-1.5">
        <span>{used} kg used</span>
        <span>{total - used} kg available</span>
      </div>
      <div className="h-2.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-coral transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-ink-muted mt-1">{pct}% capacity used across active trips</p>
    </div>
  )
}

export function TravelerDashboard() {
  const { navigate, user, activeOrder } = useRouter()
  const { toast } = useToast()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Show incoming request notification if an order is pending
  const hasPendingRequest = activeOrder?.status === 'pending'
  const justEarned = activeOrder?.status === 'completed'
  const payout = activeOrder ? activeOrder.carryingFee - activeOrder.serviceFee : 1035
  const monthEarnings = justEarned ? 4200 + payout : 4200

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[14px] text-ink-muted mb-1">Traveler Dashboard</p>
            <h1 className="text-[32px] font-bold text-ink tracking-tight">
              {greeting}, {user?.name.split(' ')[0]} ✈️
            </h1>
            <p className="text-[15px] text-ink-secondary mt-1">Here's what's happening with your trips.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="coral"
              size="lg"
              leadingIcon={<Plus size={16} />}
              trailingIcon={<ArrowRight size={15} />}
              onClick={() => navigate('post-trip')}
            >
              Post a Trip
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leadingIcon={<Package size={16} />}
              onClick={() => navigate('marketplace')}
            >
              Browse Requests
            </Button>
          </div>
        </div>

        {/* NEW REQUEST BANNER */}
        {hasPendingRequest && activeOrder && (
          <div className="mb-8 rounded-[16px] border-2 border-primary/30 bg-primary-light p-5 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-bold text-ink">🔔 New delivery request</p>
                    <span className="rounded-full bg-coral text-white text-[10px] font-bold px-2 py-0.5">NEW</span>
                  </div>
                  <p className="text-[13px] text-ink-secondary">
                    <strong className="text-ink">{activeOrder.weightKg} kg parcel</strong> · {activeOrder.from} → {activeOrder.to} · {activeOrder.travelDate}
                  </p>
                  <p className="text-[13px] text-ink-secondary mt-0.5">
                    Estimated carrying fee: <strong className="text-ink">৳{activeOrder.carryingFee.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="md" onClick={() => navigate('request-detail')}>
                  View Request
                </Button>
                <Button variant="secondary" size="md" onClick={() => navigate('request-detail')}>
                  Decline
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Plane size={18} className="text-coral" />, value: '2', label: 'Upcoming trips', bg: 'bg-coral-light' },
            { icon: <Package size={18} className="text-primary" />, value: hasPendingRequest ? '1' : '0', label: 'Pending requests', bg: 'bg-primary-light', highlight: hasPendingRequest },
            { icon: <CheckCircle2 size={18} className="text-success" />, value: justEarned ? '39' : '38', label: 'Completed', bg: 'bg-success-light' },
            { icon: <Wallet size={18} className="text-warning" />, value: `৳${(justEarned ? 12400 + payout : 12400).toLocaleString()}`, label: 'Total earned', bg: 'bg-warning-light' },
          ].map(s => (
            <div key={s.label} className={`rounded-[14px] border bg-white p-4 flex items-center gap-3 transition-all ${s.highlight ? 'border-primary/40 shadow-[var(--shadow-e2)]' : 'border-border'}`}>
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

            {/* Upcoming trips */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-ink">Upcoming Trips</h2>
                <button onClick={() => navigate('my-trips')} className="text-[13px] text-primary font-medium hover:underline flex items-center gap-1">
                  Manage trips <ChevronRight size={13} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { route: 'Dhaka → London', date: '28 Aug 2026', capacity: 6, used: 2.5, status: 'Active' },
                  { route: 'London → Dhaka', date: '14 Oct 2026', capacity: 10, used: 0, status: 'Open' },
                ].map(trip => (
                  <div key={trip.date} className="rounded-[16px] border border-border bg-white p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[16px] font-bold text-ink mb-0.5">{trip.route}</p>
                        <p className="text-[13px] text-ink-muted">{trip.date}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${trip.status === 'Active' ? 'bg-primary-light text-primary' : 'bg-success-light text-success'}`}>
                        {trip.status}
                      </span>
                    </div>
                    <CapacityBar used={trip.used} total={trip.capacity} />
                    {trip.used > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-secondary">
                        <AlertCircle size={12} className="text-warning" />
                        {trip.capacity - trip.used} kg remaining · {trip.used > 0 ? '1 active order' : 'No orders yet'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active orders */}
            <div>
              <h2 className="text-[18px] font-bold text-ink mb-4">Active Deliveries</h2>
              {activeOrder && ['accepted', 'paid', 'arranged', 'picked-up', 'transit', 'ready', 'completed'].includes(activeOrder.status) ? (
                <div className="rounded-[16px] border border-border bg-white p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">Order #{activeOrder.id}</p>
                      <p className="text-[16px] font-bold text-ink">{activeOrder.from} → {activeOrder.to}</p>
                      <p className="text-[13px] text-ink-muted">{activeOrder.weightKg} kg · {activeOrder.travelDate}</p>
                    </div>
                    <span className={`rounded-full text-[11px] font-semibold px-2.5 py-1 ${TRAVELER_STATUS[activeOrder.status].cls}`}>
                      {TRAVELER_STATUS[activeOrder.status].label}
                    </span>
                  </div>
                  <Button variant="secondary" size="md" className="w-full" trailingIcon={<ArrowRight size={14} />} onClick={() => navigate('order-hub')}>
                    Open Order Hub
                  </Button>
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-border bg-white p-8 text-center">
                  <Plane size={28} className="text-ink-muted mx-auto mb-2" />
                  <p className="text-[14px] text-ink-secondary">No active deliveries yet.</p>
                  <p className="text-[12px] text-ink-muted mt-1">Accept a request to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Reputation */}
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <p className="text-[13px] font-bold text-ink">Your Reputation</p>
                <div className="flex items-center gap-1 text-[12px] font-semibold text-success">
                  <CheckCircle2 size={12} /> Verified
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: 'Rating', value: '4.9 ★' },
                  { label: 'Completed', value: '38 deliveries' },
                  { label: 'Cancellation rate', value: '2%' },
                  { label: 'Response time', value: '~15 min' },
                  { label: 'Trust level', value: 'High Trust' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-5 py-2.5 text-[13px]">
                    <span className="text-ink-muted">{item.label}</span>
                    <span className="font-semibold text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings preview */}
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Earnings This Month</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[28px] font-bold text-ink mb-0.5">৳{monthEarnings.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 text-[12px] text-success mb-4">
                  <TrendingUp size={13} /> {justEarned ? `+৳${payout.toLocaleString()} from your latest delivery` : '+22% vs last month'}
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Carrying fees', value: `৳${(justEarned ? 3860 + payout : 3860).toLocaleString()}` },
                    { label: 'Pending payout', value: justEarned ? '৳0' : '৳1,125' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-[12px]">
                      <span className="text-ink-muted">{item.label}</span>
                      <span className="font-semibold text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="rounded-[16px] bg-primary-light border border-primary/15 px-5 py-4 flex items-start gap-3">
              <Shield size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-ink mb-0.5">Escrow protected</p>
                <p className="text-[12px] text-ink-secondary leading-snug">Your earnings are held in escrow and released when the sender confirms delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
