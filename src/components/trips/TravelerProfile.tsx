import { CheckCircle2, Star, Clock, Package, TrendingDown, ArrowRight, MapPin, Shield, ChevronLeft } from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { TRAVELERS, TRIPS, getTravelerById, getTripsByTraveler } from '../../data/prototype'

const TRUST_BG = {
  'High Trust': 'bg-success text-white',
  'Trusted': 'bg-primary text-white',
  'New': 'bg-divider text-ink-muted',
}

const REVIEWS = [
  { sender: 'Rahim A.', rating: 5, text: 'Aisha was incredibly reliable. Parcel arrived in perfect condition.', date: '12 Aug 2026' },
  { sender: 'Nusrat K.', rating: 5, text: 'Super communicative and fast response. Will use again!', date: '3 Aug 2026' },
  { sender: 'Farhan S.', rating: 4, text: 'Good experience overall, slight delay but kept me informed.', date: '21 Jul 2026' },
]

export function TravelerProfile() {
  const { navigate, orderDraft, setOrderDraft } = useRouter()
  const travelerId = orderDraft.selectedTravelerId ?? 't1'
  const tripId = orderDraft.selectedTripId

  const traveler = getTravelerById(travelerId)
  const trips = getTripsByTraveler(travelerId)

  function handleChooseTrip(tid: string) {
    setOrderDraft(prev => ({ ...prev, selectedTripId: tid, selectedTravelerId: travelerId }))
    navigate('order-new')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        <button
          onClick={() => navigate('trip-search')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to results
        </button>

        {/* Profile hero */}
        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] overflow-hidden mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #3157D5 0%, #4466e0 50%, #F9735B 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          </div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-[26px] font-bold shadow-[var(--shadow-e3)] border-4 border-white">
                  {traveler.initials}
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[24px] font-bold text-ink">{traveler.name}</h1>
                    {traveler.verified && (
                      <span className="flex items-center gap-1 bg-success text-white text-[11px] font-bold rounded-full px-2.5 py-0.5">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}
                    <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${TRUST_BG[traveler.trustLevel]}`}>
                      {traveler.trustLevel}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink-muted mt-0.5">Member since {traveler.memberSince}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-ink leading-none">{traveler.rating}</p>
                  <div className="flex gap-0.5 mt-0.5 justify-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} className={i <= Math.round(traveler.rating) ? 'text-coral fill-coral' : 'text-border'} />
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">{traveler.completedDeliveries} reviews</p>
                </div>
              </div>
            </div>
            <p className="text-[14px] text-ink-secondary leading-relaxed max-w-2xl">{traveler.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Reputation */}
          <div className="flex flex-col gap-5">
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Traveler Reputation</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: 'Verification', value: traveler.verified ? '✓ Verified' : 'Unverified', color: traveler.verified ? 'text-success' : 'text-ink-muted' },
                  { label: 'Trust Level', value: traveler.trustLevel, color: 'text-ink' },
                  { label: 'Completed Deliveries', value: `${traveler.completedDeliveries}`, color: 'text-ink' },
                  { label: 'Cancellation Rate', value: traveler.cancellationRate, color: 'text-ink' },
                  { label: 'Response Time', value: traveler.responseTime, color: 'text-ink' },
                  { label: 'Rating', value: `${traveler.rating} ★`, color: 'text-ink' },
                  { label: 'Default Fee', value: `৳${traveler.defaultFee} / kg`, color: 'text-primary font-bold' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center px-5 py-2.5 text-[13px]">
                    <span className="text-ink-muted">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] bg-primary-light border border-primary/15 px-5 py-4 flex items-start gap-3">
              <Shield size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[12px] text-ink-secondary leading-snug">
                <strong className="text-ink">Identity verified.</strong> Passport or NID verified by BringBuddy admin. Personal details are not visible to senders.
              </p>
            </div>
          </div>

          {/* Right — Trips + Reviews */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Upcoming trips */}
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Upcoming Trips</p>
              </div>
              <div className="divide-y divide-border">
                {trips.map(trip => {
                  const available = trip.capacityKg - trip.usedKg
                  return (
                    <div key={trip.id} className="px-5 py-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={13} className="text-primary" />
                            <p className="text-[15px] font-bold text-ink">{trip.fromCity} → {trip.toCity}</p>
                          </div>
                          <p className="text-[13px] text-ink-muted">{trip.date} · {available} kg available · ৳{trip.feePerKg}/kg</p>
                        </div>
                        <span className="text-[18px] font-bold text-primary">৳{trip.feePerKg}<span className="text-[12px] font-normal text-ink-muted">/kg</span></span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <p className="text-[12px] text-ink-muted w-full mb-1">Allowed items:</p>
                        {trip.allowedCategories.map(c => (
                          <span key={c} className="rounded-[6px] bg-divider px-2 py-0.5 text-[11px] text-ink-muted">{c}</span>
                        ))}
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        trailingIcon={<ArrowRight size={14} />}
                        onClick={() => handleChooseTrip(trip.id)}
                      >
                        Choose This Trip
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <p className="text-[13px] font-bold text-ink">Recent Reviews</p>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-ink">
                  {traveler.rating} <Star size={13} className="text-coral fill-coral" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {REVIEWS.map(r => (
                  <div key={r.date} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-divider text-[10px] font-bold text-ink-muted flex items-center justify-center">
                          {r.sender[0]}
                        </div>
                        <span className="text-[13px] font-semibold text-ink">{r.sender}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={11} className={i <= r.rating ? 'text-coral fill-coral' : 'text-border'} />
                        ))}
                        <span className="text-[11px] text-ink-muted ml-1">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-ink-secondary leading-snug">{r.text}</p>
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
