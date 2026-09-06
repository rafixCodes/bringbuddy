import { useState } from 'react'
import {
  Plane, CheckCircle2, Star, Clock, Shield, ArrowRight, ChevronLeft,
  MapPin, Package, ShoppingBag, MessageCircle, TrendingDown,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { TRAVELERS, TRIPS, getTravelerById, getTripsByTraveler } from '../../data/prototype'

const TRUST_BG: Record<string, string> = {
  'High Trust': 'bg-success text-white',
  'Trusted': 'bg-primary text-white',
  'New': 'bg-divider text-ink-muted',
}

const TRUST_BORDER: Record<string, string> = {
  'High Trust': 'border-success/30 bg-success-light text-success',
  'Trusted': 'border-primary/30 bg-primary-light text-primary',
  'New': 'border-border bg-divider text-ink-muted',
}

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100))
  return (
    <div>
      <div className="flex justify-between text-[11px] text-ink-muted mb-1.5">
        <span>{used} kg committed</span>
        <span>{total - used} kg available</span>
      </div>
      <div className="h-2.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct > 70 ? 'linear-gradient(90deg,#F9735B,#e05a42)' : 'linear-gradient(90deg,#3157D5,#4466e0)',
          }}
        />
      </div>
    </div>
  )
}

export function TripDetail() {
  const { navigate, viewingTripId, viewingTravelerId, setOrderDraft, orderDraft, user } = useRouter()

  // Resolve trip + traveler
  let trip = TRIPS.find(t => t.id === viewingTripId) ?? TRIPS[0]
  if (viewingTravelerId && !viewingTripId) {
    const travelerTrips = TRIPS.filter(t => t.travelerId === viewingTravelerId)
    if (travelerTrips.length) trip = travelerTrips[0]
  }
  const traveler = getTravelerById(trip.travelerId)
  const available = trip.capacityKg - trip.usedKg

  function handleRequest() {
    setOrderDraft(prev => ({
      ...prev,
      selectedTravelerId: trip.travelerId,
      selectedTripId: trip.id,
    }))
    navigate('order-new')
  }

  const backPage = (user?.mode === 'traveler' ? 'my-trips' : 'trip-search') as any

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        <button
          onClick={() => navigate(backPage)}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Traveler hero */}
            <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] overflow-hidden">
              <div className="h-20 relative" style={{ background: 'linear-gradient(135deg, #3157D5 0%, #4466e0 60%, #F9735B 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-8 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-[var(--shadow-e2)] flex items-center justify-center text-[20px] font-bold text-primary shrink-0">
                    {traveler.initials}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[20px] font-bold text-ink">{traveler.name}</h2>
                      {traveler.verified && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 border ${TRUST_BORDER[traveler.trustLevel]}`}>
                        {traveler.trustLevel}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-muted mt-0.5">Member since {traveler.memberSince}</p>
                  </div>
                </div>
                <p className="text-[14px] text-ink-secondary mb-4 leading-relaxed">{traveler.bio}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Rating', value: `${traveler.rating} ★` },
                    { label: 'Completed', value: `${traveler.completedDeliveries}` },
                    { label: 'Response', value: traveler.responseTime },
                    { label: 'Cancellation', value: traveler.cancellationRate },
                  ].map(s => (
                    <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2 text-center">
                      <p className="text-[14px] font-bold text-ink">{s.value}</p>
                      <p className="text-[10px] text-ink-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip details */}
            <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Plane size={18} className="text-primary" />
                <h3 className="text-[16px] font-bold text-ink">Trip Details</h3>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <p className="text-[22px] font-bold text-ink">{trip.fromCity} → {trip.toCity}</p>
                  <p className="text-[13px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} /> {trip.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-bold text-ink">৳{trip.feePerKg}<span className="text-[13px] font-normal text-ink-muted">/kg</span></p>
                  <p className="text-[11px] text-ink-muted">carrying fee</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[12px] font-semibold text-ink mb-2">Available Capacity</p>
                <CapacityBar used={trip.usedKg} total={trip.capacityKg} />
                <p className="text-[12px] text-ink-secondary mt-2">
                  <span className="font-semibold text-ink">{available} kg</span> remaining of {trip.capacityKg} kg total
                </p>
              </div>

              <div className="mb-5">
                <p className="text-[12px] font-semibold text-ink mb-2">Allowed Item Categories</p>
                <div className="flex flex-wrap gap-2">
                  {trip.allowedCategories.map(c => (
                    <span key={c} className="rounded-full bg-primary-light text-primary text-[11px] font-semibold px-2.5 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Other trips by this traveler */}
            {(() => {
              const others = TRIPS.filter(t => t.travelerId === trip.travelerId && t.id !== trip.id)
              if (!others.length) return null
              return (
                <div className="rounded-[20px] bg-white border border-border p-6">
                  <h3 className="text-[15px] font-bold text-ink mb-4">Other Trips by {traveler.name.split(' ')[0]}</h3>
                  <div className="flex flex-col gap-3">
                    {others.map(t => (
                      <div key={t.id} className="flex items-center justify-between rounded-[12px] bg-divider px-4 py-3">
                        <div>
                          <p className="text-[13px] font-semibold text-ink">{t.fromCity} → {t.toCity}</p>
                          <p className="text-[11px] text-ink-muted">{t.date} · {t.capacityKg - t.usedKg} kg available</p>
                        </div>
                        <span className="text-[13px] font-bold text-ink">৳{t.feePerKg}/kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Sidebar CTA */}
          <div className="flex flex-col gap-5">
            {/* Request card */}
            {user?.mode !== 'traveler' && (
              <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-6 sticky top-24">
                <p className="text-[13px] text-ink-muted mb-1">Request this traveler</p>
                <p className="text-[22px] font-bold text-ink mb-0.5">৳{trip.feePerKg}<span className="text-[13px] font-normal text-ink-muted">/kg</span></p>
                <p className="text-[12px] text-ink-secondary mb-5">
                  {available} kg available · {trip.date}
                </p>

                <div className="flex flex-col gap-3 mb-5">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    trailingIcon={<ArrowRight size={15} />}
                    onClick={handleRequest}
                  >
                    Request This Traveler
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => navigate('traveler-profile' as any)}
                  >
                    View Full Profile
                  </Button>
                </div>

                <div className="flex flex-col gap-2 text-[12px] text-ink-secondary">
                  <div className="flex items-center gap-2"><Shield size={12} className="text-success" /> Escrow-protected payment</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-success" /> Identity verified</div>
                  <div className="flex items-center gap-2"><Clock size={12} className="text-primary" /> Responds in {traveler.responseTime}</div>
                </div>
              </div>
            )}

            {/* Reputation mini */}
            <div className="rounded-[20px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-3">Reputation</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Rating', value: `${traveler.rating} ★` },
                  { label: 'Completed deliveries', value: traveler.completedDeliveries },
                  { label: 'Cancellation rate', value: traveler.cancellationRate },
                  { label: 'Response time', value: traveler.responseTime },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-[12px]">
                    <span className="text-ink-muted">{item.label}</span>
                    <span className="font-semibold text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety */}
            <div className="rounded-[16px] bg-primary-light border border-primary/15 px-4 py-4 flex items-start gap-3">
              <Shield size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[12px] text-ink-secondary leading-snug">
                <strong className="text-ink">BringBuddy escrow</strong> holds your payment until delivery is confirmed with OTP.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
