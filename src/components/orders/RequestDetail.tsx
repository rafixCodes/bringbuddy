import { useState } from 'react'
import {
  CheckCircle2, Package, MapPin, Clock, ChevronLeft, Loader2, ArrowRight, XCircle,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { getTripById } from '../../data/prototype'

const DECLINE_REASONS = [
  'My luggage is already full',
  'The route or travel date no longer works',
  "I'm not comfortable carrying this item",
  'Something else',
]

function CapacityVisual({ before, after, total }: { before: number; after: number; total: number }) {
  const pctBefore = total > 0 ? (before / total) * 100 : 0
  const pctNew = total > 0 ? ((after - before) / total) * 100 : 0

  return (
    <div>
      <div className="h-3 rounded-full bg-border overflow-hidden flex">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pctBefore}%` }} />
        <div className="h-full bg-coral/70 transition-all duration-700" style={{ width: `${pctNew}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-ink-muted mt-1.5">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> {before} kg used</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral/70 inline-block" /> +{after - before} kg this order</span>
        <span>{total - after} kg remaining</span>
      </div>
    </div>
  )
}

type DetailState = 'view' | 'confirm' | 'accepting' | 'accepted' | 'decline'

export function RequestDetail() {
  const { navigate, activeOrder, setActiveOrder, setNotifications } = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<DetailState>('view')
  const [reason, setReason] = useState(DECLINE_REASONS[0])
  const [note, setNote] = useState('')

  if (!activeOrder) { navigate('traveler-dashboard'); return null }

  const trip = activeOrder.tripId ? getTripById(activeOrder.tripId) : null
  const capacityTotal = trip?.capacityKg ?? 0
  const usedBefore = trip?.usedKg ?? 0
  const capacityAfter = Math.min(usedBefore + activeOrder.weightKg, capacityTotal)
  const senderName = activeOrder.senderName ?? 'Sender'
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleAccept() {
    setState('accepting')
    await new Promise(r => setTimeout(r, 1200))
    setActiveOrder(prev => prev && ({
      ...prev,
      status: 'accepted',
      timestamps: { ...prev.timestamps, accepted: new Date().toISOString() },
    }))
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        type: 'order',
        icon: '✅',
        title: 'Traveler accepted your request',
        body: `${activeOrder?.travelerName} accepted your ${activeOrder?.from} → ${activeOrder?.to} delivery.`,
        time: 'Just now',
        read: false,
        action: 'order-hub',
      },
      ...prev,
    ])
    setState('accepted')
    toast({ tone: 'success', title: 'Delivery accepted', message: 'The sender has been notified.' })
  }

  function handleDecline() {
    const detail = note.trim() ? `${reason} — ${note.trim()}` : reason
    setActiveOrder(prev => prev && ({
      ...prev,
      status: 'cancelled',
      cancelReason: detail,
      timestamps: { ...prev.timestamps, cancelled: new Date().toISOString() },
    }))
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        type: 'order',
        icon: '↩️',
        title: 'Traveler declined your request',
        body: `${activeOrder?.travelerName} could not take this one: ${detail}`,
        time: 'Just now',
        read: false,
        action: 'trip-search',
      },
      ...prev,
    ])
    toast({ tone: 'info', title: 'Request declined', message: 'The sender has been notified.' })
    navigate('traveler-dashboard')
  }

  if (state === 'accepted') {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[560px] mx-auto px-6 pt-28 pb-20 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-20 h-20 rounded-full bg-success-light border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <h1 className="text-[28px] font-bold text-ink mb-2">Delivery accepted!</h1>
          <p className="text-[15px] text-ink-secondary mb-4 leading-relaxed">
            You've committed to carrying this parcel. {senderName} has been notified.
          </p>

          {trip && (
            <div className="rounded-[16px] border border-border bg-white p-5 text-left mb-6">
              <p className="text-[13px] font-semibold text-ink mb-3">Luggage Capacity Update</p>
              <CapacityVisual before={usedBefore} after={capacityAfter} total={capacityTotal} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" className="w-full" trailingIcon={<ArrowRight size={16} />} onClick={() => navigate('order-hub')}>
              Open Order Hub
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('traveler-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (state === 'decline') {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[520px] mx-auto px-6 pt-28 pb-20 animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-14 h-14 rounded-[16px] bg-danger-light flex items-center justify-center mb-5">
            <XCircle size={26} className="text-danger" />
          </div>
          <h1 className="text-[24px] font-bold text-ink mb-2">Decline this request?</h1>
          <p className="text-[14px] text-ink-secondary mb-6">
            {senderName} will be told why, so they can find another traveler quickly.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {DECLINE_REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`text-left rounded-[12px] border px-4 py-3 text-[13px] transition-all ${
                  reason === r ? 'border-primary bg-primary-light text-primary font-medium' : 'border-border bg-white text-ink-secondary hover:border-primary/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="block text-[12px] font-semibold text-ink mb-1.5">
            Add a note <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. My return flight got moved to next month."
            className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none mb-6"
          />

          <div className="flex gap-3">
            <Button variant="danger" size="lg" className="flex-1" onClick={handleDecline}>
              Decline Request
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setState('view')}>
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (state === 'confirm' || state === 'accepting') {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[520px] mx-auto px-6 pt-28 pb-20 animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          <h1 className="text-[24px] font-bold text-ink mb-2">Accept this delivery?</h1>
          <p className="text-[14px] text-ink-secondary mb-6">
            You'll be committing <strong className="text-ink">{activeOrder.weightKg} kg</strong> of your available luggage capacity to this order.
          </p>

          {trip && (
            <div className="rounded-[16px] border border-border bg-white p-5 mb-5">
              <p className="text-[13px] font-semibold text-ink mb-3">Capacity Impact</p>
              <div className="flex justify-between text-[13px] mb-3">
                <div className="text-center">
                  <p className="text-[22px] font-bold text-ink">{capacityTotal - usedBefore} kg</p>
                  <p className="text-[12px] text-ink-muted">Currently available</p>
                </div>
                <div className="flex items-center text-ink-muted">→</div>
                <div className="text-center">
                  <p className="text-[22px] font-bold text-ink">{capacityTotal - capacityAfter} kg</p>
                  <p className="text-[12px] text-ink-muted">After acceptance</p>
                </div>
              </div>
              <CapacityVisual before={usedBefore} after={capacityAfter} total={capacityTotal} />
            </div>
          )}

          <div className="rounded-[14px] border border-border bg-white overflow-hidden mb-6">
            {[
              { label: 'Route', value: `${activeOrder.from} → ${activeOrder.to}` },
              { label: 'Travel date', value: activeOrder.travelDate },
              { label: 'Parcel', value: `${activeOrder.itemDescription} · ${activeOrder.weightKg} kg` },
              { label: 'Carrying fee', value: `৳${activeOrder.carryingFee.toLocaleString()}` },
            ].map((item, i, arr) => (
              <div key={item.label} className={`flex justify-between px-4 py-2.5 text-[13px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-ink-muted">{item.label}</span>
                <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAccept}
              disabled={state === 'accepting'}
            >
              {state === 'accepting'
                ? <><Loader2 size={16} className="animate-spin" /> Accepting…</>
                : 'Accept Delivery'
              }
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setState('view')} disabled={state === 'accepting'}>
              Cancel
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[620px] mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => navigate('traveler-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 mb-5">
          <span className="rounded-full bg-coral text-white text-[11px] font-bold px-3 py-1">New Request</span>
          <span className="text-[13px] text-ink-muted">Order #{activeOrder.id}</span>
        </div>

        <h1 className="text-[26px] font-bold text-ink mb-1.5">Delivery Request</h1>
        <p className="text-[14px] text-ink-secondary mb-6">Review the details before accepting.</p>

        <div className="rounded-[16px] border border-border bg-white p-5 mb-4">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-bold text-primary">
              {senderInitials}
            </div>
            <div>
              <p className="text-[14px] font-bold text-ink">{senderName}</p>
              <p className="text-[12px] text-ink-muted">Sent you a direct request</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Package size={14} className="text-primary" />, label: 'Order type', value: activeOrder.type === 'shopping-request' ? 'Shopping Request' : 'Carry Only' },
              { icon: <MapPin size={14} className="text-primary" />, label: 'Route', value: `${activeOrder.from} → ${activeOrder.to}` },
              { icon: <Clock size={14} className="text-primary" />, label: 'Travel date', value: activeOrder.travelDate },
              { icon: <Package size={14} className="text-coral" />, label: 'Weight', value: `${activeOrder.weightKg} kg` },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[11px] text-ink-muted">{item.label}</p>
                  <p className="text-[13px] font-semibold text-ink">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-white overflow-hidden mb-4">
          <div className="px-5 py-2.5 bg-divider border-b border-border">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">Parcel Details</p>
          </div>
          {[
            { label: 'Description', value: activeOrder.itemDescription },
            { label: 'Pickup address', value: activeOrder.pickupAddress || '—' },
            { label: 'Receiver', value: activeOrder.receiverName || '—' },
            ...(activeOrder.specialInstructions
              ? [{ label: 'Special instructions', value: activeOrder.specialInstructions }]
              : []),
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex justify-between px-5 py-2.5 text-[13px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-[16px] border border-primary/20 bg-primary-light px-5 py-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-ink-secondary">Estimated carrying fee</p>
            <p className="text-[22px] font-bold text-primary">৳{activeOrder.carryingFee.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-ink-muted">Released from escrow</p>
            <p className="text-[11px] text-ink-muted">after delivery confirmation</p>
          </div>
        </div>

        {trip && (
          <div className="rounded-[12px] bg-divider px-4 py-3 mb-6 flex items-center justify-between text-[12px]">
            <span className="text-ink-muted">Space left on this trip</span>
            <span className="font-semibold text-ink">{capacityTotal - usedBefore} kg of {capacityTotal} kg</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="lg" className="flex-1" trailingIcon={<ArrowRight size={16} />} onClick={() => setState('confirm')}>
            Accept Request
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setState('decline')}>
            Decline
          </Button>
        </div>
      </main>
    </div>
  )
}
