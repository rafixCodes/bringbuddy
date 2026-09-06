import { CheckCircle2, Clock, ArrowRight, Package } from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { getTravelerById } from '../../data/prototype'

export function OrderSent() {
  const { navigate, activeOrder } = useRouter()
  if (!activeOrder) { navigate('sender-dashboard'); return null }

  const traveler = getTravelerById(activeOrder.travelerId)

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[580px] mx-auto px-6 pt-28 pb-20 text-center animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-success-light border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} className="text-success" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-warning-light border border-warning/30 px-4 py-1.5 text-[12px] font-semibold text-warning mb-5">
          <Clock size={12} /> Awaiting Traveler Response
        </div>

        <h1 className="text-[30px] font-bold text-ink tracking-tight mb-2">Request sent!</h1>
        <p className="text-[15px] text-ink-secondary leading-relaxed mb-8">
          Your request has been sent to <strong className="text-ink">{traveler.name}</strong>. You'll be notified when they respond.
        </p>

        {/* Order summary card */}
        <div className="rounded-[20px] border border-border bg-white text-left overflow-hidden mb-8 shadow-[var(--shadow-e1)]">
          <div className="px-5 py-3.5 bg-divider border-b border-border flex items-center justify-between">
            <p className="text-[12px] font-bold text-ink-muted uppercase tracking-widest">Order #{activeOrder.id}</p>
            <span className="rounded-full bg-warning-light text-warning text-[11px] font-semibold px-2.5 py-0.5">Awaiting Response</span>
          </div>
          {[
            { label: 'Route', value: `${activeOrder.from} → ${activeOrder.to}` },
            { label: 'Traveler', value: traveler.name },
            { label: 'Order type', value: activeOrder.type === 'shopping-request' ? 'Shopping Request' : 'Carry Only' },
            { label: 'Weight', value: `${activeOrder.weightKg} kg` },
            { label: 'Travel date', value: activeOrder.travelDate },
            { label: 'Estimated total', value: `৳${(activeOrder.carryingFee + activeOrder.serviceFee).toLocaleString()}` },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex justify-between px-5 py-3 text-[13px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-medium text-ink">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            trailingIcon={<ArrowRight size={16} />}
            onClick={() => navigate('order-hub')}
          >
            Open Order Hub
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('sender-dashboard')}
            leadingIcon={<Package size={15} />}
          >
            Back to Dashboard
          </Button>
        </div>

        <p className="text-[12px] text-ink-muted mt-6">
          Typical response time: <strong className="text-ink">{traveler.responseTime}</strong>
        </p>
      </main>
    </div>
  )
}
