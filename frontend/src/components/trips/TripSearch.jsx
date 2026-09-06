import { useState } from 'react'
import {
  Search, ChevronDown, MapPin, CheckCircle2,
  Star, Clock, ArrowRight, Filter, Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { searchTrips } from '../../services/tripService'
import { CITIES } from '../../data/tripStatus'

const TRUST_LEVEL = (score) => {
  if (score >= 80) return { label: 'High Trust', cls: 'bg-success-light text-success' }
  if (score >= 40) return { label: 'Trusted', cls: 'bg-primary-light text-primary' }
  return { label: 'New', cls: 'bg-divider text-ink-muted' }
}

function TravelerResultCard({ trip, onViewTrip, onViewProfile }) {
  const traveler = trip.traveler
  const info = traveler.travelerInfo || {}
  const available = trip.remainingCapacityKg
  const trust = TRUST_LEVEL(info.trustScore || 0)

  return (
    <div className="rounded-[16px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-[15px] font-bold text-primary shrink-0">
          {traveler.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[15px] font-bold text-ink">{traveler.name}</p>
                {info.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[12px] text-ink-muted">
                <span className="flex items-center gap-1"><Star size={11} className="text-coral fill-coral" /> {(info.averageRating || 0).toFixed(1)}</span>
                <span>{info.completedDeliveries || 0} deliveries</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${trust.cls}`}>
                  {trust.label}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[18px] font-bold text-ink">৳{trip.pricePerKg}<span className="text-[12px] font-normal text-ink-muted">/kg</span></p>
              <p className="text-[11px] text-ink-muted">{available} kg available</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-[8px] bg-divider px-3 py-1.5">
              <MapPin size={12} className="text-primary" />
              <span className="text-[12px] font-semibold text-ink">{trip.departureCity}</span>
              <span className="text-ink-muted mx-1">→</span>
              <span className="text-[12px] font-semibold text-ink">{trip.destinationCity}</span>
              <span className="text-ink-muted mx-1">·</span>
              <Clock size={11} className="text-ink-muted" />
              <span className="text-[12px] text-ink-muted">
                {new Date(trip.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(trip.allowedCategories || []).slice(0, 3).map(c => (
              <span key={c} className="rounded-[6px] bg-divider px-2 py-0.5 text-[11px] text-ink-muted">{c}</span>
            ))}
            {(trip.allowedCategories || []).length > 3 && (
              <span className="text-[11px] text-ink-muted py-0.5">+{trip.allowedCategories.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="secondary"
          size="md"
          onClick={onViewProfile}
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          trailingIcon={<ArrowRight size={14} />}
          onClick={onViewTrip}
        >
          Request This Traveler
        </Button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[16px] border border-border bg-white p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-divider shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-divider rounded w-40 mb-2" />
          <div className="h-3 bg-divider rounded w-56 mb-3" />
          <div className="h-8 bg-divider rounded-[8px] w-56 mb-2" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <div className="h-10 flex-1 bg-divider rounded-[8px]" />
      </div>
    </div>
  )
}

export function TripSearch() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('Dhaka')
  const [to, setTo] = useState('London')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [maxFee, setMaxFee] = useState(600)
  const [minCapacity, setMinCapacity] = useState(0)
  const [allResults, setAllResults] = useState([])
  const [error, setError] = useState('')

  const results = allResults.filter(trip => {
    const info = trip.traveler?.travelerInfo || {}
    if (verifiedOnly && !info.isVerified) return false
    if ((info.averageRating || 0) < minRating) return false
    if (trip.pricePerKg > maxFee) return false
    if (trip.remainingCapacityKg < minCapacity) return false
    return true
  })

  const hasActiveFilters = verifiedOnly || minRating > 0 || maxFee < 600 || minCapacity > 0

  async function handleSearch() {
    if (from === to) {
      setError('Departure and destination must be different.')
      return
    }
    setError('')
    setLoading(true)
    setSearched(false)
    try {
      const data = await searchTrips({ from, to })
      setAllResults(data.trips || [])
      setSearched(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not search trips. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleViewTrip(trip) {
    navigate('/orders/new', {
      state: {
        trip: {
          _id: trip._id,
          travelerName: trip.traveler?.name,
          departureCity: trip.departureCity,
          destinationCity: trip.destinationCity,
          travelDate: trip.travelDate,
        },
      },
    })
  }

  function clearFilters() {
    setVerifiedOnly(false)
    setMinRating(0)
    setMaxFee(600)
    setMinCapacity(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">
        <div className="mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <h1 className="text-[28px] font-bold text-ink mb-1">Find a Trip</h1>
          <p className="text-[14px] text-ink-secondary">Search verified travelers already flying your route.</p>
        </div>

        <div className="rounded-[16px] border border-border bg-white p-5 mb-6 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 border border-border rounded-[10px] px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <MapPin size={15} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">From</p>
                <select
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 border border-border rounded-[10px] px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <MapPin size={15} className="text-coral shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">To</p>
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              leadingIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              onClick={handleSearch}
              disabled={loading}
              className="sm:w-auto w-full"
            >
              {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
          {error && <p className="text-[12px] text-danger mt-2">{error}</p>}
        </div>

        {searched && !loading && (
          <div className="flex items-center gap-3 mb-5 flex-wrap animate-[bb-fade_0.3s_ease_both]">
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-all ${
                showFilters || hasActiveFilters ? 'border-primary bg-primary-light text-primary' : 'border-border text-ink-secondary hover:border-primary/40'
              }`}
            >
              <Filter size={13} /> Filters
              {hasActiveFilters && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
              <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[12px] text-ink-muted hover:text-ink font-medium">
                Clear all
              </button>
            )}
          </div>
        )}

        {showFilters && searched && (
          <div className="rounded-[16px] border border-border bg-white p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-5 animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">Min. Capacity</span>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={10} value={minCapacity} onChange={e => setMinCapacity(+e.target.value)} className="flex-1 accent-[var(--color-primary)]" />
                <span className="text-[13px] font-medium text-ink w-10">{minCapacity} kg</span>
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">Max Fee /kg</span>
              <div className="flex items-center gap-2">
                <input type="range" min={200} max={600} step={50} value={maxFee} onChange={e => setMaxFee(+e.target.value)} className="flex-1 accent-[var(--color-primary)]" />
                <span className="text-[13px] font-medium text-ink w-12">৳{maxFee}</span>
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">Min. Rating</span>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(+e.target.value)} className="flex-1 accent-[var(--color-primary)]" />
                <span className="text-[13px] font-medium text-ink w-10">{minRating || 'Any'}★</span>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setVerifiedOnly(s => !s)}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${verifiedOnly ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${verifiedOnly ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">Verified only</p>
                <p className="text-[11px] text-ink-muted">Admin-verified travelers</p>
              </div>
            </label>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <div className="animate-[bb-fade_0.3s_ease_both]">
            <p className="text-[14px] text-ink-secondary mb-4">
              <strong className="text-ink">{results.length} trip{results.length !== 1 ? 's' : ''}</strong> from {from} to {to}
            </p>
            <div className="flex flex-col gap-4">
              {results.map(trip => (
                <TravelerResultCard
                  key={trip._id}
                  trip={trip}
                  onViewTrip={() => handleViewTrip(trip)}
                  onViewProfile={() => navigate(`/profile/${trip.traveler._id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both] rounded-[20px] border border-dashed border-border bg-white p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-divider flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-ink-muted" />
            </div>
            <h2 className="text-[20px] font-bold text-ink mb-2">No trips found</h2>
            <p className="text-[14px] text-ink-secondary mb-6 max-w-sm mx-auto">
              {allResults.length > 0
                ? 'Try adjusting your filters.'
                : 'Try another date, destination, or check back later — no travelers have posted this route yet.'}
            </p>
            <div className="flex justify-center gap-3">
              {allResults.length > 0 && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button variant="primary" onClick={() => setSearched(false)}>
                Modify Search
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}