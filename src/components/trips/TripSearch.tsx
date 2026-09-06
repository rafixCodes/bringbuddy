import { useState, useMemo } from 'react'
import {
  Search, X, MapPin, CheckCircle2, Star, Clock, ArrowRight, Filter,
  ChevronDown, Sparkles, AlertCircle,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import {
  searchTrips, TRIP_CITIES, TRUST_LEVELS,
  type TripSearchResult, type TripSortKey, type TrustLevel,
} from '../../data/prototype'

const TRUST_COLORS: Record<TrustLevel, string> = {
  'High Trust': 'bg-success-light text-success',
  'Trusted': 'bg-primary-light text-primary',
  'New': 'bg-divider text-ink-muted',
}

const SORT_LABELS: { key: TripSortKey; label: string }[] = [
  { key: 'best-match', label: 'Best match' },
  { key: 'lowest-price', label: 'Lowest price' },
  { key: 'highest-rating', label: 'Highest rating' },
  { key: 'earliest', label: 'Departing soonest' },
  { key: 'most-capacity', label: 'Most space left' },
]

const DEFAULT_MAX_FEE = 700
const DEFAULT_DATE = '2026-08-28'

function TravelerResultCard({
  result,
  topMatch,
  onViewTrip,
  onViewProfile,
}: {
  result: TripSearchResult
  topMatch: boolean
  onViewTrip: () => void
  onViewProfile: () => void
}) {
  const { trip, traveler, availableKg, daysAfterPreferred } = result

  return (
    <div className="rounded-[16px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-[15px] font-bold text-primary shrink-0">
          {traveler.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-[15px] font-bold text-ink">{traveler.name}</p>
                {traveler.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
                {topMatch && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-coral bg-coral-light rounded-full px-2 py-0.5">
                    <Sparkles size={10} /> Best match
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[12px] text-ink-muted flex-wrap">
                <span className="flex items-center gap-1"><Star size={11} className="text-coral fill-coral" /> {traveler.rating}</span>
                <span>{traveler.completedDeliveries} deliveries</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TRUST_COLORS[traveler.trustLevel]}`}>
                  {traveler.trustLevel}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[18px] font-bold text-ink">৳{trip.feePerKg}<span className="text-[12px] font-normal text-ink-muted">/kg</span></p>
              <p className="text-[11px] text-ink-muted">{availableKg} kg available</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-[8px] bg-divider px-3 py-1.5">
              <MapPin size={12} className="text-primary" />
              <span className="text-[12px] font-semibold text-ink">{trip.fromCity}</span>
              <span className="text-ink-muted mx-1">→</span>
              <span className="text-[12px] font-semibold text-ink">{trip.toCity}</span>
              <span className="text-ink-muted mx-1">·</span>
              <Clock size={11} className="text-ink-muted" />
              <span className="text-[12px] text-ink-muted">{trip.date}</span>
            </div>
            {daysAfterPreferred > 0 && (
              <span className="text-[11px] text-ink-muted">
                {daysAfterPreferred} day{daysAfterPreferred > 1 ? 's' : ''} after your date
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {trip.allowedCategories.slice(0, 3).map(c => (
              <span key={c} className="rounded-[6px] bg-divider px-2 py-0.5 text-[11px] text-ink-muted">{c}</span>
            ))}
            {trip.allowedCategories.length > 3 && (
              <span className="text-[11px] text-ink-muted py-0.5">+{trip.allowedCategories.length - 3} more</span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ink-muted">
            <Clock size={11} /> Responds in {traveler.responseTime}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          trailingIcon={<ArrowRight size={14} />}
          onClick={onViewTrip}
        >
          View Trip
        </Button>
        <Button variant="secondary" size="md" onClick={onViewProfile}>
          View Profile
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
          <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-divider rounded" />
            <div className="h-5 w-20 bg-divider rounded" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <div className="h-10 flex-1 bg-divider rounded-[8px]" />
        <div className="h-10 w-32 bg-divider rounded-[8px]" />
      </div>
    </div>
  )
}

export function TripSearch() {
  const { navigate, setOrderDraft, setViewingTripId, setViewingTravelerId } = useRouter()
  const [from, setFrom] = useState('Dhaka')
  const [to, setTo] = useState('London')
  const [date, setDate] = useState(DEFAULT_DATE)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [maxFee, setMaxFee] = useState(DEFAULT_MAX_FEE)
  const [minCapacity, setMinCapacity] = useState(0)
  const [trustLevels, setTrustLevels] = useState<TrustLevel[]>([])
  const [sort, setSort] = useState<TripSortKey>('best-match')
  const [routeError, setRouteError] = useState('')

  const [query, setQuery] = useState({ from: 'Dhaka', to: 'London', date: DEFAULT_DATE })

  const results = useMemo(() => {
    if (!searched) return []
    return searchTrips({
      from: query.from,
      to: query.to,
      date: query.date,
      minCapacity,
      maxFee,
      minRating,
      verifiedOnly,
      trustLevels,
      sort,
    })
  }, [searched, query, minCapacity, maxFee, minRating, verifiedOnly, trustLevels, sort])

  async function handleSearch() {
    if (from === to) {
      setRouteError('Pick two different cities for your route.')
      return
    }
    setRouteError('')
    setLoading(true)
    setSearched(false)
    setQuery({ from, to, date })
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSearched(true)
  }

  function handleViewTrip(travelerId: string, tripId: string) {
    setViewingTripId(tripId)
    setViewingTravelerId(travelerId)
    navigate('trip-detail')
  }

  function handleViewProfile(travelerId: string, tripId: string) {
    setOrderDraft(prev => ({ ...prev, selectedTravelerId: travelerId, selectedTripId: tripId }))
    navigate('traveler-profile')
  }

  function toggleTrust(level: TrustLevel) {
    setTrustLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])
  }

  function clearFilters() {
    setVerifiedOnly(false)
    setMinRating(0)
    setMaxFee(DEFAULT_MAX_FEE)
    setMinCapacity(0)
    setTrustLevels([])
  }

  const hasActiveFilters =
    verifiedOnly || minRating > 0 || maxFee < DEFAULT_MAX_FEE || minCapacity > 0 || trustLevels.length > 0

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20">

        <div className="mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <button onClick={() => navigate('sender-dashboard')} className="text-[13px] text-ink-muted hover:text-ink mb-3 flex items-center gap-1 font-medium">
            ← Back to Dashboard
          </button>
          <h1 className="text-[30px] font-bold text-ink tracking-tight mb-1">Find a traveler</h1>
          <p className="text-[15px] text-ink-secondary">Search travelers already going your way.</p>
        </div>

        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-5 mb-6 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 border border-border rounded-[10px] px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <MapPin size={15} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">From</p>
                <select
                  value={from}
                  onChange={e => { setFrom(e.target.value); setRouteError('') }}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {TRIP_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 border border-border rounded-[10px] px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <MapPin size={15} className="text-coral shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">To</p>
                <select
                  value={to}
                  onChange={e => { setTo(e.target.value); setRouteError('') }}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                >
                  {TRIP_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 border border-border rounded-[10px] px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <Clock size={15} className="text-ink-muted shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">Travel on or after</p>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-[14px] font-medium text-ink bg-transparent outline-none cursor-pointer"
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Search size={16} />}
              onClick={handleSearch}
              disabled={loading}
              className="sm:w-auto w-full"
            >
              Search
            </Button>
          </div>
          {routeError && (
            <p className="text-[12px] text-danger mt-3 flex items-center gap-1.5">
              <AlertCircle size={12} /> {routeError}
            </p>
          )}
        </div>

        {searched && (
          <div className="flex items-center gap-3 mb-5 flex-wrap animate-[bb-fade_0.3s_ease_both]">
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-all ${showFilters || hasActiveFilters ? 'border-primary bg-primary-light text-primary' : 'border-border text-ink-secondary hover:border-primary/40'}`}
            >
              <Filter size={13} /> Filters {hasActiveFilters && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
            </button>
            {verifiedOnly && (
              <span className="flex items-center gap-1.5 rounded-full bg-success-light border border-success/20 text-success text-[12px] font-medium px-3 py-1">
                Verified only <button onClick={() => setVerifiedOnly(false)}><X size={11} /></button>
              </span>
            )}
            {minRating > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-divider text-ink-secondary text-[12px] font-medium px-3 py-1">
                {minRating}+ stars <button onClick={() => setMinRating(0)}><X size={11} /></button>
              </span>
            )}
            {trustLevels.map(level => (
              <span key={level} className="flex items-center gap-1.5 rounded-full bg-divider text-ink-secondary text-[12px] font-medium px-3 py-1">
                {level} <button onClick={() => toggleTrust(level)}><X size={11} /></button>
              </span>
            ))}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[12px] text-ink-muted hover:text-ink font-medium">
                Clear all
              </button>
            )}
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as TripSortKey)}
                className="rounded-[8px] border border-border bg-white pl-3 pr-8 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
              >
                {SORT_LABELS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            </div>
          </div>
        )}

        {showFilters && searched && (
          <div className="rounded-[16px] border border-border bg-white p-5 mb-6 animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
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
                  <input type="range" min={250} max={DEFAULT_MAX_FEE} step={25} value={maxFee} onChange={e => setMaxFee(+e.target.value)} className="flex-1 accent-[var(--color-primary)]" />
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
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide mb-2">Trust Level</p>
              <div className="flex flex-wrap gap-2">
                {TRUST_LEVELS.map(level => {
                  const active = trustLevels.includes(level)
                  return (
                    <button
                      key={level}
                      onClick={() => toggleTrust(level)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                        active ? 'border-primary bg-primary-light text-primary' : 'border-border text-ink-secondary hover:border-primary/40'
                      }`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-ink-muted mt-2">Leave empty to include every trust level.</p>
            </div>
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
              <strong className="text-ink">{results.length} trip{results.length > 1 ? 's' : ''}</strong> from {query.from} to {query.to}
            </p>
            <div className="flex flex-col gap-4">
              {results.map((result, i) => (
                <TravelerResultCard
                  key={result.trip.id}
                  result={result}
                  topMatch={sort === 'best-match' && i === 0 && results.length > 1}
                  onViewTrip={() => handleViewTrip(result.traveler.id, result.trip.id)}
                  onViewProfile={() => handleViewProfile(result.traveler.id, result.trip.id)}
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
              Nobody is flying {query.from} → {query.to} on or after that date with your filters. Try another date, destination, or loosen the filters.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
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
