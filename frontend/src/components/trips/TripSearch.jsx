import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'

import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { useToast } from '../../lib/toast'
import { searchTravelerTrips } from '../../services/travelerSearchService'

const INITIAL_FILTERS = {
  from: 'Dhaka',
  to: 'London',
  date: '',
  minCapacity: '',
  maxPrice: '',
  minRating: '0',
  minTrust: '0',
  verifiedOnly: true,
  sort: 'soonest',
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name) {
  return String(name || 'Traveler')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function trustLabel(score) {
  if (score >= 80) return 'High Trust'
  if (score >= 50) return 'Trusted'
  return 'New Traveler'
}

function TravelerCard({ result, onRequest }) {
  const { trip, traveler } = result

  return (
    <article className="rounded-[18px] border border-border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-e2)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-[15px] font-bold text-primary">
            {initials(traveler.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-bold text-ink">{traveler.name}</h2>
              {traveler.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
              <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                {trustLabel(traveler.trustScore)} · {traveler.trustScore}/100
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Star size={12} className="fill-warning text-warning" />
                {traveler.averageRating.toFixed(1)}
                {traveler.totalReviews > 0 && ` (${traveler.totalReviews})`}
              </span>
              <span>{traveler.completedDeliveries} completed deliveries</span>
              {traveler.responseTime > 0 && (
                <span>Responds in about {traveler.responseTime} min</span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-divider px-3 py-2 font-semibold text-ink">
                <MapPin size={13} className="text-primary" />
                {trip.departureCity}, {trip.departureCountry}
                <ArrowRight size={13} className="text-ink-muted" />
                {trip.destinationCity}, {trip.destinationCountry}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-divider px-3 py-2 text-ink-secondary">
                <Clock size={13} /> {formatDate(trip.travelDate)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(trip.allowedCategories || []).map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-ink-muted"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-6 border-t border-border pt-4 lg:w-[245px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div>
            <p className="text-[20px] font-bold text-ink">
              ৳{trip.pricePerKg}
              <span className="text-[11px] font-normal text-ink-muted">/kg</span>
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <Package size={12} /> {trip.remainingCapacityKg} kg available
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            trailingIcon={<ArrowRight size={14} />}
            onClick={() => onRequest(result)}
          >
            Request
          </Button>
        </div>
      </div>
    </article>
  )
}

export function TripSearch() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [error, setError] = useState('')

  function updateFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSearch(event) {
    event?.preventDefault()

    if (!filters.from.trim() || !filters.to.trim()) {
      setError('Enter both departure and destination cities.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await searchTravelerTrips(filters)
      setResults(data.results || [])
      setSearched(true)
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Could not search traveler trips.'
      setError(message)
      setResults([])
      setSearched(true)
      toast({ tone: 'error', title: 'Search failed', message })
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setResults([])
    setSearched(false)
    setError('')
  }

  function requestTraveler({ trip, traveler }) {
    navigate('/orders/new', {
      state: {
        trip: {
          ...trip,
          travelerId: traveler._id,
          travelerName: traveler.name,
          traveler,
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="mx-auto max-w-[1180px] px-6 pb-20 pt-28 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/sender-dashboard')}
          className="mb-3 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
            Smart Traveler Search
          </p>
          <h1 className="text-[30px] font-bold tracking-tight text-ink">Find a Trip</h1>
          <p className="mt-1 text-[14px] text-ink-secondary">
            Search real published trips and choose a traveler already going your way.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-5 rounded-[20px] border border-border bg-white p-5 shadow-[var(--shadow-e2)]"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_0.8fr_auto]">
            <label className="flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <MapPin size={16} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">From</span>
                <input
                  value={filters.from}
                  onChange={(event) => updateFilter('from', event.target.value)}
                  placeholder="Departure city"
                  className="w-full bg-transparent text-[14px] font-medium text-ink outline-none"
                />
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <MapPin size={16} className="shrink-0 text-coral" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">To</span>
                <input
                  value={filters.to}
                  onChange={(event) => updateFilter('to', event.target.value)}
                  placeholder="Destination city"
                  className="w-full bg-transparent text-[14px] font-medium text-ink outline-none"
                />
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <Clock size={16} className="shrink-0 text-ink-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Travel date</span>
                <input
                  type="date"
                  value={filters.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => updateFilter('date', event.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium text-ink outline-none"
                />
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              leadingIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? 'Searching' : 'Search'}
            </Button>
          </div>

          {error && (
            <p className="mt-3 rounded-[8px] bg-danger-light px-3 py-2 text-[12px] text-danger">
              {error}
            </p>
          )}
        </form>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((visible) => !visible)}
            className={`inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] font-semibold transition-colors ${
              showFilters
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border bg-white text-ink-secondary hover:border-primary/40'
            }`}
          >
            <Filter size={14} /> Filters
            <ChevronDown size={13} className={showFilters ? 'rotate-180' : ''} />
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted hover:text-ink"
          >
            <RotateCcw size={13} /> Reset search
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-[16px] border border-border bg-white p-5 sm:grid-cols-2 lg:grid-cols-6">
            <label>
              <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted">MIN CAPACITY</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.minCapacity}
                onChange={(event) => updateFilter('minCapacity', event.target.value)}
                placeholder="Any kg"
                className="w-full rounded-[8px] border border-border px-3 py-2 text-[13px] outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted">MAX PRICE / KG</span>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => updateFilter('maxPrice', event.target.value)}
                placeholder="Any price"
                className="w-full rounded-[8px] border border-border px-3 py-2 text-[13px] outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted">MIN RATING</span>
              <select
                value={filters.minRating}
                onChange={(event) => updateFilter('minRating', event.target.value)}
                className="w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
              >
                <option value="0">Any rating</option>
                <option value="3">3.0+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted">MIN TRUST</span>
              <select
                value={filters.minTrust}
                onChange={(event) => updateFilter('minTrust', event.target.value)}
                className="w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
              >
                <option value="0">Any trust</option>
                <option value="50">Trusted 50+</option>
                <option value="80">High trust 80+</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted">SORT BY</span>
              <select
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value)}
                className="w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
              >
                <option value="soonest">Soonest</option>
                <option value="price_low">Lowest price</option>
                <option value="rating_high">Highest rating</option>
                <option value="trust_high">Highest trust</option>
                <option value="capacity_high">Most capacity</option>
              </select>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-[8px] bg-success-light px-3 py-2">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(event) => updateFilter('verifiedOnly', event.target.checked)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <span className="text-[12px] font-semibold text-success">Verified only</span>
            </label>
          </div>
        )}

        {loading && (
          <div className="rounded-[20px] border border-border bg-white py-16 text-center">
            <Loader2 size={28} className="mx-auto mb-3 animate-spin text-primary" />
            <p className="text-[14px] font-medium text-ink-secondary">Finding matching trips…</p>
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] text-ink-secondary">
                <strong className="text-ink">{results.length} matching trip{results.length === 1 ? '' : 's'}</strong>
                {' '}from {filters.from} to {filters.to}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-success">
                <ShieldCheck size={13} /> Eligibility checked
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {results.map((result) => (
                <TravelerCard
                  key={result.trip._id}
                  result={result}
                  onRequest={requestTraveler}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="rounded-[20px] border border-dashed border-border bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-divider">
              <Search size={24} className="text-ink-muted" />
            </div>
            <h2 className="text-[18px] font-bold text-ink">No matching trips found</h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-secondary">
              Try another route or date, reduce the minimum capacity, or widen the rating, trust, and price filters.
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div className="rounded-[16px] border border-primary/15 bg-primary-light px-5 py-4">
            <p className="flex items-start gap-2 text-[13px] text-ink-secondary">
              <Search size={15} className="mt-0.5 shrink-0 text-primary" />
              Route, date, available capacity, rating, trust level, verification, and price are checked against live traveler trips.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
