import { useState } from 'react'
import { ChevronLeft, Shield, Loader2, ArrowRight, AlertCircle, Search } from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { getTravelerById, getTripById, calcFees } from '../../data/prototype'

export function OrderSummary() {
  const { navigate, orderDraft, setActiveOrder, setNotifications, user } = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const travelerId = orderDraft.selectedTravelerId
  const tripId = orderDraft.selectedTripId

  if (!travelerId || !tripId) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[560px] mx-auto px-6 pt-28 pb-20">
          <button
            onClick={() => navigate('order-new')}
            className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
          >
            <ChevronLeft size={15} /> Back
          </button>

          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-16 h-16 rounded-full bg-divider flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-ink-muted" />
            </div>
            <h1 className="text-[22px] font-bold text-ink mb-2">Pick a traveler first</h1>
            <p className="text-[14px] text-ink-secondary mb-6 max-w-sm mx-auto leading-relaxed">
              A direct request goes to one specific traveler. Search for someone flying your route, then send this request from their trip.
            </p>
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Search size={16} />}
              onClick={() => navigate('trip-search')}
            >
              Find a Traveler
            </Button>
            <p className="text-[12px] text-ink-muted mt-4">Your parcel details are saved.</p>
          </div>
        </main>
      </div>
    )
  }

  const traveler = getTravelerById(travelerId)
  const trip = getTripById(tripId)
  const weightKg = orderDraft.weightKg ?? 2.5
  const availableKg = trip.capacityKg - trip.usedKg
  const overCapacity = weightKg > availableKg
  const { carryingFee, serviceFee, total } = calcFees(weightKg, trip.feePerKg)

  async function handleSubmit() {
    if (overCapacity) {
      setError(`${traveler.name} only has ${availableKg} kg free on this trip. Go back and reduce the weight, or pick another traveler.`)
      return
    }
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1400))

    const id = `BB-${1100 + Math.floor(Math.random() * 900)}`
    setActiveOrder({
      id,
      status: 'pending',
      type: orderDraft.type ?? 'carry-only',
      bookingMethod: 'direct',
      travelerId: traveler.id,
      travelerName: traveler.name,
      tripId: trip.id,
      from: trip.fromCity,
      to: trip.toCity,
      travelDate: trip.date,
      itemDescription: orderDraft.itemDescription ?? 'Parcel',
      weightKg,
      pickupAddress: orderDraft.pickupAddress ?? '',
      receiverName: orderDraft.receiverName ?? '',
      carryingFee,
      serviceFee,
      senderName: user?.name ?? 'Alex Johnson',
      specialInstructions: orderDraft.specialInstructions,
      receiverPhone: orderDraft.receiverPhone,
      productUrl: orderDraft.productUrl,
      quantity: orderDraft.quantity,
      budget: orderDraft.budget,
      timestamps: { pending: new Date().toISOString() },
    })

    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        type: 'order',
        icon: '📦',
        title: 'Delivery request sent',
        body: `Your ${weightKg} kg request for ${trip.fromCity} → ${trip.toCity} was sent to ${traveler.name}.`,
        time: 'Just now',
        read: false,
        action: 'order-hub',
      },
      ...prev,
    ])

    navigate('order-sent')
  }

  const rows = [
    {
      section: 'Delivery',
      items: [{ label: 'Type', value: orderDraft.type === 'shopping-request' ? 'Shopping Request' : 'Carry Only' }],
    },
    {
      section: 'Route',
      items: [
        { label: 'From', value: trip.fromCity },
        { label: 'To', value: trip.toCity },
      ],
    },
    {
      section: 'Traveler',
      items: [
        { label: 'Name', value: traveler.name },
        { label: 'Verification', value: traveler.verified ? '✓ Verified' : 'Unverified' },
        { label: 'Rating', value: `${traveler.rating} ★` },
      ],
    },
    {
      section: 'Trip',
      items: [
        { label: 'Travel date', value: trip.date },
        { label: 'Space left', value: `${availableKg} kg of ${trip.capacityKg} kg` },
      ],
    },
    {
      section: 'Package',
      items: [
        { label: 'Description', value: orderDraft.itemDescription ?? '—' },
        { label: 'Weight', value: `${weightKg} kg` },
        { label: 'Pickup', value: orderDraft.pickupAddress ?? '—' },
        { label: 'Receiver', value: orderDraft.receiverName ?? '—' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[620px] mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => navigate('order-new')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back
        </button>

        <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1.5">Review your request</h1>
        <p className="text-[14px] text-ink-secondary mb-6">Make sure everything looks correct before sending.</p>

        {overCapacity && (
          <div className="rounded-[14px] bg-danger-light border border-danger/25 px-5 py-4 flex items-start gap-3 mb-5 animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
            <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-ink mb-0.5">This parcel is heavier than the space left</p>
              <p className="text-[12px] text-ink-secondary leading-snug">
                {traveler.name} has <strong className="text-ink">{availableKg} kg</strong> free on this trip but your parcel is {weightKg} kg. Go back and lower the weight, or choose a traveler with more room.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-[20px] border border-border bg-white overflow-hidden mb-5 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          {rows.map(row => (
            <div key={row.section}>
              <div className="px-5 py-2.5 bg-divider border-b border-border">
                <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">{row.section}</p>
              </div>
              {row.items.map((item, i) => (
                <div key={item.label} className={`flex justify-between items-center px-5 py-3 text-[13px] ${i < row.items.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-ink-muted">{item.label}</span>
                  <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="px-5 py-2.5 bg-divider border-t border-b border-border">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">Pricing</p>
          </div>
          <div className="px-5">
            <div className="flex justify-between py-3 text-[13px] border-b border-border">
              <span className="text-ink-muted">Carrying fee ({weightKg} kg × ৳{trip.feePerKg})</span>
              <span className="font-medium text-ink">৳{carryingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-[13px] border-b border-border">
              <span className="text-ink-muted">Platform service fee (8%)</span>
              <span className="font-medium text-ink">৳{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-[15px]">
              <span className="font-bold text-ink">Estimated total</span>
              <span className="font-bold text-primary">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] bg-primary-light border border-primary/15 px-5 py-4 flex items-start gap-3 mb-6">
          <Shield size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-ink mb-0.5">Your payment is protected by escrow</p>
            <p className="text-[12px] text-ink-secondary leading-snug">
              Funds are held securely by BringBuddy until you confirm delivery. The traveler receives payment only after you verify delivery with your unique OTP.
            </p>
          </div>
        </div>

        <div className="rounded-[14px] border border-border bg-white px-5 py-3 flex items-center justify-between mb-6 text-[13px]">
          <span className="text-ink-muted">Booking method</span>
          <span className="font-semibold text-ink">Direct Request to {traveler.name}</span>
        </div>

        {error && (
          <p className="text-[12px] text-danger mb-4 flex items-center gap-1.5">
            <AlertCircle size={12} /> {error}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting || overCapacity}
          trailingIcon={submitting ? undefined : <ArrowRight size={16} />}
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Sending request…</>
          ) : 'Send Request'}
        </Button>

        <p className="text-center text-[12px] text-ink-muted mt-4">
          By sending this request you agree to BringBuddy's{' '}
          <span className="text-primary font-medium cursor-pointer">Terms of Service</span>.
        </p>
      </main>
    </div>
  )
}
