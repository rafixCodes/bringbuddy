import { useState } from 'react'
import { Globe, ArrowRight, CheckCircle2, Clock, ChevronLeft, Loader2, MapPin, AlertCircle } from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type MarketplaceRequest } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { TRIP_CITIES } from '../../data/prototype'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTravelDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function MarketplacePost() {
  const {
    navigate, orderDraft, setActiveOrder,
    setMarketplaceRequests, setViewingRequestId,
    user, currentSenderId,
  } = useRouter()
  const { toast } = useToast()

  const isShopping = orderDraft.type === 'shopping-request'
  const [from, setFrom] = useState('Dhaka')
  const [to, setTo] = useState('London')
  const [travelBy, setTravelBy] = useState('2026-08-28')
  const [fee, setFee] = useState(isShopping ? String(orderDraft.budget ?? '') : '')
  const [error, setError] = useState('')
  const [posted, setPosted] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postedId, setPostedId] = useState('')

  const senderName = user?.name ?? 'Alex Johnson'
  const weightKg = Number(orderDraft.weightKg ?? 2.5)
  const description = orderDraft.itemDescription ?? 'Parcel'

  async function handlePost() {
    if (from === to) {
      setError('Pick two different cities for your route.')
      return
    }
    const amount = parseFloat(fee)
    if (!fee || isNaN(amount) || amount <= 0) {
      setError(isShopping ? 'Enter the budget for this purchase.' : 'Enter a suggested carrying fee.')
      return
    }
    setError('')
    setPosting(true)
    await new Promise(r => setTimeout(r, 1200))

    const travelDate = formatTravelDate(travelBy)
    const id = `mr-${Date.now()}`
    const request: MarketplaceRequest = {
      id,
      type: isShopping ? 'shopping-request' : 'carry-only',
      senderId: currentSenderId,
      senderName,
      senderInitials: initialsOf(senderName),
      senderVerified: true,
      senderRating: 4.7,
      from,
      to,
      travelDate,
      specialInstructions: orderDraft.specialInstructions,
      postedHoursAgo: 0,
      status: 'open',
      applications: [],
      ...(isShopping
        ? {
            productName: description,
            productUrl: orderDraft.productUrl,
            quantity: orderDraft.quantity ?? 1,
            budget: amount,
          }
        : {
            weightKg,
            suggestedFee: amount,
            itemDescription: description,
          }),
    }

    setMarketplaceRequests(prev => [request, ...prev])
    setActiveOrder({
      id: 'BB-MP-201',
      status: 'pending',
      type: request.type,
      bookingMethod: 'marketplace',
      travelerId: '',
      travelerName: 'TBD',
      tripId: '',
      from,
      to,
      travelDate,
      itemDescription: description,
      weightKg,
      pickupAddress: orderDraft.pickupAddress ?? from,
      receiverName: orderDraft.receiverName ?? 'Receiver',
      carryingFee: 0,
      serviceFee: 0,
      specialInstructions: orderDraft.specialInstructions,
      productUrl: orderDraft.productUrl,
      quantity: orderDraft.quantity,
      budget: isShopping ? amount : undefined,
    })

    setPostedId(id)
    setPosting(false)
    setPosted(true)
    toast({ tone: 'success', title: '✅ Request published', message: 'Travelers on this route can now apply.' })
  }

  function viewRequest() {
    setViewingRequestId(postedId)
    navigate('marketplace-request')
  }

  if (posted) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[560px] mx-auto px-6 pt-28 pb-20 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-20 h-20 rounded-full bg-success-light border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light border border-primary/20 px-4 py-1.5 text-[12px] font-semibold text-primary mb-5">
            <Clock size={12} /> Waiting for traveler applications
          </div>
          <h1 className="text-[28px] font-bold text-ink mb-2">Request posted!</h1>
          <p className="text-[15px] text-ink-secondary mb-6 max-w-sm mx-auto leading-relaxed">
            Your request is now live on the marketplace. Travelers going this route can apply with their carrying fee.
          </p>
          <div className="rounded-[16px] border border-border bg-white text-left overflow-hidden mb-8">
            {[
              { label: 'Route', value: `${from} → ${to}` },
              { label: 'Travel by', value: formatTravelDate(travelBy) },
              { label: isShopping ? 'Product' : 'Item', value: description },
              { label: isShopping ? 'Budget' : 'Suggested fee', value: `৳${Number(fee).toLocaleString()}` },
              { label: 'Status', value: 'Open for applications' },
            ].map((item, i, arr) => (
              <div key={item.label} className={`flex justify-between px-5 py-3 text-[13px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-ink-muted">{item.label}</span>
                <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="primary" size="lg" className="w-full mb-3" trailingIcon={<ArrowRight size={16} />} onClick={viewRequest}>
            View My Request
          </Button>
          <Button variant="secondary" size="lg" className="w-full mb-3" onClick={() => navigate('marketplace')}>
            Go to Marketplace
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('sender-dashboard')}>
            Back to Dashboard
          </Button>
        </main>
      </div>
    )
  }

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

        <div className="w-14 h-14 rounded-[16px] bg-coral-light flex items-center justify-center mb-6">
          <Globe size={28} className="text-coral" />
        </div>

        <h1 className="text-[28px] font-bold text-ink tracking-tight mb-2">Post to Marketplace</h1>
        <p className="text-[15px] text-ink-secondary mb-6 leading-relaxed">
          Your request will be visible to eligible travelers going this route. Travelers can apply with their carrying fee, and you can choose the best match.
        </p>

        <div className="rounded-[16px] border border-border bg-white p-5 mb-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">From</label>
              <div className="flex items-center gap-2 border border-border rounded-[10px] px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
                <MapPin size={14} className="text-primary shrink-0" />
                <select
                  value={from}
                  onChange={e => { setFrom(e.target.value); setError('') }}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {TRIP_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">To</label>
              <div className="flex items-center gap-2 border border-border rounded-[10px] px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
                <MapPin size={14} className="text-coral shrink-0" />
                <select
                  value={to}
                  onChange={e => { setTo(e.target.value); setError('') }}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {TRIP_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Travel by</label>
            <input
              type="date"
              value={travelBy}
              onChange={e => setTravelBy(e.target.value)}
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              {isShopping ? 'Budget (৳)' : 'Suggested carrying fee (৳)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted">৳</span>
              <input
                type="number"
                min={1}
                value={fee}
                onChange={e => { setFee(e.target.value); setError('') }}
                placeholder={isShopping ? 'e.g. 42,000' : 'e.g. 1,125'}
                className="w-full rounded-[10px] border border-border bg-white pl-7 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5">
              {isShopping
                ? 'Travelers see this as the spending limit for the purchase.'
                : 'Travelers can apply with a different fee, and you choose who to go with.'}
            </p>
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-white overflow-hidden mb-6">
          {[
            { label: isShopping ? 'Product' : 'Item', value: description },
            ...(isShopping
              ? [{ label: 'Quantity', value: String(orderDraft.quantity ?? 1) }]
              : [{ label: 'Weight', value: `${weightKg} kg` }]),
            { label: 'Pickup address', value: orderDraft.pickupAddress ?? '—' },
            { label: 'Receiver', value: orderDraft.receiverName ?? '—' },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex justify-between px-5 py-3 text-[13px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-[12px] bg-primary-light border border-primary/15 px-4 py-3.5 mb-6 text-[13px] text-ink-secondary">
          Travelers who match your route, dates, and capacity will see this request and can apply with their fee. You'll review applications and choose who to send the parcel with.
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
          onClick={handlePost}
          disabled={posting}
          trailingIcon={posting ? undefined : <ArrowRight size={16} />}
        >
          {posting ? <><Loader2 size={16} className="animate-spin" /> Posting…</> : 'Post Request'}
        </Button>
      </main>
    </div>
  )
}
