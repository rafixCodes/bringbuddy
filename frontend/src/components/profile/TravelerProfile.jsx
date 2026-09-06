import { useState, useEffect } from 'react'
import { CheckCircle2, Star, Package, ArrowRight, MapPin, Shield, ChevronLeft, Loader2 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { getTravelerProfile } from '../../services/travelerService'

// NOTE on mapping vs. the Figma source:
// - `bio` doesn't exist anywhere on User.js's schema at all — the Figma
//   card showed one, but there's nowhere on the backend to fetch it from.
//   Dropped entirely, not faked.
// - `trustLevel` (a label string) doesn't exist either — only a numeric
//   `trustScore` does. Derived here with the same thresholds used in
//   TripSearch.jsx, so the two pages agree on what "High Trust" means.
// - Reviews are still DUMMY DATA — Feature 14 (Reviews) isn't built, so
//   there's no real review data to fetch. Same pattern as elsewhere in
//   this app: clearly isolated, not mixed into real API data.
// - `trips` wasn't returned by this endpoint at all before — extended on
//   the backend (travelerController.js) to include the traveler's
//   published trips alongside the profile, in one call.

const TRUST_LEVEL = (score) => {
  if (score >= 80) return { label: 'High Trust', cls: 'bg-success text-white' }
  if (score >= 40) return { label: 'Trusted', cls: 'bg-primary text-white' }
  return { label: 'New', cls: 'bg-divider text-ink-muted' }
}

// DUMMY DATA — Feature 14 (Reviews) not built yet. Real reviews would be
// fetched from the Review model (exists, unused) once that feature lands.
const DUMMY_REVIEWS = [
  { sender: 'Rahim A.', rating: 5, text: 'Incredibly reliable. Parcel arrived in perfect condition.', date: '12 Aug 2026' },
  { sender: 'Nusrat K.', rating: 5, text: 'Super communicative and fast response. Will use again!', date: '3 Aug 2026' },
  { sender: 'Farhan S.', rating: 4, text: 'Good experience overall, slight delay but kept me informed.', date: '21 Jul 2026' },
]

export function TravelerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchProfile() {
      setLoading(true)
      setError('')
      try {
        const data = await getTravelerProfile(id)
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load this profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [id])

  function handleChooseTrip(trip) {
    navigate('/orders/new', {
      state: {
        trip: {
          _id: trip._id,
          travelerName: profile.name,
          departureCity: trip.departureCity,
          destinationCity: trip.destinationCity,
          travelDate: trip.travelDate,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 size={24} className="text-ink-muted animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />
        <main className="max-w-[600px] mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-[22px] font-bold text-ink mb-2">Profile not found</h1>
          <p className="text-[14px] text-ink-secondary mb-6">{error || 'This traveler could not be found.'}</p>
          <Button variant="primary" onClick={() => navigate('/trip-search')}>Back to Search</Button>
        </main>
      </div>
    )
  }

  const trust = TRUST_LEVEL(profile.trustScore || 0)
  const initials = profile.name?.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        <button
          onClick={() => navigate('/trip-search')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to results
        </button>

        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] overflow-hidden mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #3157D5 0%, #4466e0 50%, #F9735B 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          </div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-[26px] font-bold shadow-[var(--shadow-e3)] border-4 border-white">
                  {initials}
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[24px] font-bold text-ink">{profile.name}</h1>
                    {profile.isVerified && (
                      <span className="flex items-center gap-1 bg-success text-white text-[11px] font-bold rounded-full px-2.5 py-0.5">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}
                    <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${trust.cls}`}>
                      {trust.label}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink-muted mt-0.5">
                    Member since {new Date(profile.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-ink leading-none">{(profile.averageRating || 0).toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-0.5 justify-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={11} className={i <= Math.round(profile.averageRating || 0) ? 'text-coral fill-coral' : 'text-border'} />
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">{profile.totalReviews || 0} reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-5">
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Traveler Reputation</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: 'Verification', value: profile.isVerified ? '✓ Verified' : 'Unverified', color: profile.isVerified ? 'text-success' : 'text-ink-muted' },
                  { label: 'Trust Level', value: trust.label, color: 'text-ink' },
                  { label: 'Completed Deliveries', value: `${profile.completedDeliveries || 0}`, color: 'text-ink' },
                  { label: 'Cancellation Rate', value: `${profile.cancellationRate || 0}%`, color: 'text-ink' },
                  { label: 'Response Time', value: `~${profile.responseTime || 0} min`, color: 'text-ink' },
                  { label: 'Rating', value: `${(profile.averageRating || 0).toFixed(1)} ★`, color: 'text-ink' },
                  { label: 'Default Fee', value: `৳${profile.defaultCarryingFeePerKg || 0} / kg`, color: 'text-primary font-bold' },
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

          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">
                  {profile.trips?.length > 0 ? 'Upcoming Trips' : 'No Upcoming Trips'}
                </p>
              </div>
              {profile.trips?.length > 0 ? (
                <div className="divide-y divide-border">
                  {profile.trips.map(trip => {
                    const available = trip.remainingCapacityKg
                    return (
                      <div key={trip._id} className="px-5 py-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin size={13} className="text-primary" />
                              <p className="text-[15px] font-bold text-ink">{trip.departureCity} → {trip.destinationCity}</p>
                            </div>
                            <p className="text-[13px] text-ink-muted">
                              {new Date(trip.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {available} kg available
                            </p>
                          </div>
                          <span className="text-[18px] font-bold text-primary">৳{trip.pricePerKg}<span className="text-[12px] font-normal text-ink-muted">/kg</span></span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <p className="text-[12px] text-ink-muted w-full mb-1">Allowed items:</p>
                          {(trip.allowedCategories || []).map(c => (
                            <span key={c} className="rounded-[6px] bg-divider px-2 py-0.5 text-[11px] text-ink-muted">{c}</span>
                          ))}
                        </div>
                        <Button
                          variant="primary"
                          size="md"
                          trailingIcon={<ArrowRight size={14} />}
                          onClick={() => handleChooseTrip(trip)}
                        >
                          Choose This Trip
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Package size={24} className="text-ink-muted mx-auto mb-2" />
                  <p className="text-[13px] text-ink-secondary">This traveler has no active trips right now.</p>
                </div>
              )}
            </div>

            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <p className="text-[13px] font-bold text-ink">Recent Reviews</p>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-ink">
                  {(profile.averageRating || 0).toFixed(1)} <Star size={13} className="text-coral fill-coral" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {DUMMY_REVIEWS.map(r => (
                  <div key={r.date} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-divider text-[10px] font-bold text-ink-muted flex items-center justify-center">
                          {r.sender[0]}
                        </div>
                        <span className="text-[13px] font-semibold text-ink">{r.sender}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
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
