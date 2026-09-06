import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
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
import {
  getDirectBookingOptions,
  sendDirectBookingRequest,
} from '../../services/applicationService'

const DEFAULT_FILTERS = {
  keyword: '',
  dateFrom: '',
  dateTo: '',
  minCapacity: '',
  maxPrice: '',
  minRating: '',
  minTrust: '',
  verifiedOnly: true,
  sortBy: 'soonest',
}

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'T'

const formatDate = (value) => {
  if (!value) return 'Not available'

  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const dateKey = (value) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

const numericValue = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const optionSearchText = (option) => {
  const trip = option.trip || {}
  const traveler = trip.traveler || option.traveler || {}

  return [
    traveler.name,
    trip.departureCity,
    trip.departureCountry,
    trip.destinationCity,
    trip.destinationCountry,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function DirectBooking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submittingTripId, setSubmittingTripId] = useState(null)
  const [order, setOrder] = useState(null)
  const [options, setOptions] = useState([])
  const [fees, setFees] = useState({})
  const [messages, setMessages] = useState({})
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [error, setError] = useState('')

  async function loadOptions() {
    try {
      setLoading(true)
      setError('')

      const data = await getDirectBookingOptions(orderId)

      setOrder(data.order)
      setOptions(data.options || [])

      const initialFees = {}

      for (const option of data.options || []) {
        initialFees[option.trip._id] =
          option.suggestedFee ||
          option.trip.pricePerKg ||
          ''
      }

      setFees(initialFees)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load matching travelers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOptions()
  }, [orderId])

  const routeLabel = useMemo(() => {
    if (!order) return ''

    return `${order.pickup?.city || '?'} → ${
      order.destination?.city || '?'
    }`
  }, [order])

  const filteredOptions = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const minCapacity = numericValue(filters.minCapacity)

    const maxPrice =
      filters.maxPrice === ''
        ? Number.POSITIVE_INFINITY
        : numericValue(
            filters.maxPrice,
            Number.POSITIVE_INFINITY
          )

    const minRating = numericValue(filters.minRating)
    const minTrust = numericValue(filters.minTrust)

    const results = options.filter((option) => {
      const trip = option.trip || {}
      const traveler =
        trip.traveler || option.traveler || {}
      const travelerInfo = traveler.travelerInfo || {}
      const travelDate = dateKey(trip.travelDate)

      if (
        keyword &&
        !optionSearchText(option).includes(keyword)
      ) {
        return false
      }

      if (
        filters.dateFrom &&
        travelDate < filters.dateFrom
      ) {
        return false
      }

      if (
        filters.dateTo &&
        travelDate > filters.dateTo
      ) {
        return false
      }

      if (
        numericValue(trip.remainingCapacityKg) <
        minCapacity
      ) {
        return false
      }

      if (
        numericValue(trip.pricePerKg) > maxPrice
      ) {
        return false
      }

      if (
        numericValue(travelerInfo.averageRating) <
        minRating
      ) {
        return false
      }

      if (
        numericValue(travelerInfo.trustScore) <
        minTrust
      ) {
        return false
      }

      if (
        filters.verifiedOnly &&
        !travelerInfo.isVerified
      ) {
        return false
      }

      return true
    })

    return results.sort((first, second) => {
      const firstTrip = first.trip || {}
      const secondTrip = second.trip || {}

      const firstTraveler =
        firstTrip.traveler || first.traveler || {}

      const secondTraveler =
        secondTrip.traveler || second.traveler || {}

      if (filters.sortBy === 'price-low') {
        return (
          numericValue(firstTrip.pricePerKg) -
          numericValue(secondTrip.pricePerKg)
        )
      }

      if (filters.sortBy === 'rating-high') {
        return (
          numericValue(
            secondTraveler.travelerInfo?.averageRating
          ) -
          numericValue(
            firstTraveler.travelerInfo?.averageRating
          )
        )
      }

      if (filters.sortBy === 'trust-high') {
        return (
          numericValue(
            secondTraveler.travelerInfo?.trustScore
          ) -
          numericValue(
            firstTraveler.travelerInfo?.trustScore
          )
        )
      }

      if (filters.sortBy === 'capacity-high') {
        return (
          numericValue(
            secondTrip.remainingCapacityKg
          ) -
          numericValue(
            firstTrip.remainingCapacityKg
          )
        )
      }

      return (
        new Date(firstTrip.travelDate) -
        new Date(secondTrip.travelDate)
      )
    })
  }, [filters, options])

  const activeFilterCount = useMemo(() => {
    return [
      filters.keyword,
      filters.dateFrom,
      filters.dateTo,
      filters.minCapacity,
      filters.maxPrice,
      filters.minRating,
      filters.minTrust,
      filters.sortBy !== 'soonest'
        ? filters.sortBy
        : '',
      filters.verifiedOnly ? '' : 'not-verified-only',
    ].filter(Boolean).length
  }, [filters])

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  async function handleSendRequest(option) {
    const tripId = option.trip._id
    const proposedFee = Number(fees[tripId])

    if (
      !Number.isFinite(proposedFee) ||
      proposedFee <= 0
    ) {
      toast({
        tone: 'error',
        title: 'Invalid fee',
        message:
          'Enter a proposed fee greater than 0.',
      })

      return
    }

    try {
      setSubmittingTripId(tripId)

      await sendDirectBookingRequest(orderId, {
        tripId,
        proposedFee,
        message: messages[tripId] || '',
      })

      toast({
        tone: 'success',
        title: 'Request sent',
        message:
          'The traveler can accept or reject it. Your marketplace post remains active.',
      })

      await loadOptions()
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Could not send request',
        message:
          err.response?.data?.message ||
          'Please try again.',
      })
    } finally {
      setSubmittingTripId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <button
          onClick={() =>
            navigate('/booking-center')
          }
          className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={14} />
          Back to Booking Center
        </button>

        <div className="mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-primary mb-2">
            Smart traveler search
          </p>

          <h1 className="text-[30px] font-bold text-ink tracking-tight">
            Find a Traveler
          </h1>

          <p className="text-[14px] text-ink-secondary mt-1">
            {routeLabel ||
              'Matching your delivery route'}

            {order?.totalWeightKg
              ? ` · ${order.totalWeightKg} kg required`
              : ''}
          </p>
        </div>

        <div className="mb-5 rounded-[13px] bg-primary-light border border-primary/15 px-4 py-3 flex items-start gap-2.5">
          <Search
            size={15}
            className="text-primary shrink-0 mt-0.5"
          />

          <p className="text-[12px] text-ink-secondary">
            Route, eligibility, verification and required
            capacity are checked by BringBuddy. Use the
            filters below to choose your best match.
          </p>
        </div>

        {!loading &&
          !error &&
          options.length > 0 && (
            <section className="mb-6 rounded-[18px] border border-border bg-white p-5 shadow-[var(--shadow-e1)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[9px] bg-primary-light text-primary flex items-center justify-center">
                    <Filter size={15} />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-bold text-ink">
                      Search and filters
                    </h2>

                    <p className="text-[11px] text-ink-muted">
                      {filteredOptions.length} of{' '}
                      {options.length} eligible trips shown
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeFilterCount === 0}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary disabled:text-ink-muted disabled:cursor-not-allowed"
                >
                  <RotateCcw size={13} />
                  Reset filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="block sm:col-span-2">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Search traveler or location
                  </span>

                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                    />

                    <input
                      type="search"
                      value={filters.keyword}
                      onChange={(event) =>
                        updateFilter(
                          'keyword',
                          event.target.value
                        )
                      }
                      placeholder="Name, city or country"
                      className="w-full h-10 rounded-[8px] border border-border pl-9 pr-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Travel from
                  </span>

                  <input
                    type="date"
                    value={filters.dateFrom}
                    max={filters.dateTo || undefined}
                    onChange={(event) =>
                      updateFilter(
                        'dateFrom',
                        event.target.value
                      )
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Travel until
                  </span>

                  <input
                    type="date"
                    value={filters.dateTo}
                    min={filters.dateFrom || undefined}
                    onChange={(event) =>
                      updateFilter(
                        'dateTo',
                        event.target.value
                      )
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Minimum capacity (kg)
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={filters.minCapacity}
                    onChange={(event) =>
                      updateFilter(
                        'minCapacity',
                        event.target.value
                      )
                    }
                    placeholder={
                      order?.totalWeightKg
                        ? String(order.totalWeightKg)
                        : 'Any'
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Maximum price (৳/kg)
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={filters.maxPrice}
                    onChange={(event) =>
                      updateFilter(
                        'maxPrice',
                        event.target.value
                      )
                    }
                    placeholder="Any price"
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Minimum rating
                  </span>

                  <select
                    value={filters.minRating}
                    onChange={(event) =>
                      updateFilter(
                        'minRating',
                        event.target.value
                      )
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Any rating
                    </option>
                    <option value="3">3.0+</option>
                    <option value="4">4.0+</option>
                    <option value="4.5">4.5+</option>
                  </select>
                </label>

                <label className="block">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Minimum trust score
                  </span>

                  <select
                    value={filters.minTrust}
                    onChange={(event) =>
                      updateFilter(
                        'minTrust',
                        event.target.value
                      )
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Any trust score
                    </option>
                    <option value="40">40+</option>
                    <option value="60">60+</option>
                    <option value="80">80+</option>
                  </select>
                </label>

                <label className="block sm:col-span-2 lg:col-span-2">
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Sort results
                  </span>

                  <select
                    value={filters.sortBy}
                    onChange={(event) =>
                      updateFilter(
                        'sortBy',
                        event.target.value
                      )
                    }
                    className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="soonest">
                      Soonest travel date
                    </option>
                    <option value="price-low">
                      Lowest price
                    </option>
                    <option value="rating-high">
                      Highest rating
                    </option>
                    <option value="trust-high">
                      Highest trust score
                    </option>
                    <option value="capacity-high">
                      Highest capacity
                    </option>
                  </select>
                </label>

                <label className="sm:col-span-2 lg:col-span-2 min-h-10 rounded-[8px] border border-success/25 bg-success-light px-3 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(event) =>
                      updateFilter(
                        'verifiedOnly',
                        event.target.checked
                      )
                    }
                    className="accent-primary"
                  />

                  <ShieldCheck
                    size={14}
                    className="text-success"
                  />

                  <span className="text-[12px] font-semibold text-success">
                    Verified travelers only
                  </span>
                </label>
              </div>
            </section>
          )}

        {loading && (
          <div className="rounded-[18px] border border-border bg-white p-10 flex items-center justify-center gap-3 text-ink-muted">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Finding matching verified trips…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[16px] border border-danger/20 bg-danger-light p-5 text-[14px] text-danger">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          options.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
              <Package
                size={30}
                className="mx-auto mb-3 text-ink-muted"
              />

              <p className="text-[16px] font-semibold text-ink">
                No new matching traveler right now
              </p>

              <p className="text-[13px] text-ink-muted mt-1">
                Travelers who already applied or already
                have a pending request are not shown here.
              </p>

              <Button
                variant="secondary"
                size="md"
                className="mt-4"
                onClick={() =>
                  navigate('/booking-center')
                }
              >
                Review booking activity
              </Button>
            </div>
          )}

        {!loading &&
          !error &&
          options.length > 0 &&
          filteredOptions.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
              <Filter
                size={30}
                className="mx-auto mb-3 text-ink-muted"
              />

              <p className="text-[16px] font-semibold text-ink">
                No traveler matches these filters
              </p>

              <p className="text-[13px] text-ink-muted mt-1">
                Clear some filters to see more eligible
                travelers.
              </p>

              <Button
                variant="secondary"
                size="md"
                className="mt-4"
                leadingIcon={
                  <RotateCcw size={14} />
                }
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredOptions.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredOptions.map((option) => {
                const trip = option.trip

                const traveler =
                  trip.traveler ||
                  option.traveler ||
                  {}

                const busy =
                  submittingTripId === trip._id

                return (
                  <div
                    key={trip._id}
                    className="rounded-[18px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold shrink-0">
                        {initialsFor(traveler.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-[16px] font-bold text-ink">
                            {traveler.name ||
                              'Traveler'}
                          </h2>

                          {traveler.travelerInfo
                            ?.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                              <ShieldCheck
                                size={10}
                              />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[12px] text-ink-muted">
                          <span className="flex items-center gap-1">
                            <Star size={11} />

                            {numericValue(
                              traveler.travelerInfo
                                ?.averageRating
                            ).toFixed(1)}
                          </span>

                          <span>
                            {traveler.travelerInfo
                              ?.completedDeliveries ||
                              0}{' '}
                            deliveries
                          </span>

                          <span>
                            Trust{' '}
                            {traveler.travelerInfo
                              ?.trustScore || 0}
                          </span>

                          <span>
                            {option.activeOrderCount ||
                              0}
                            /
                            {option.activeOrderLimit ||
                              1}{' '}
                            active orders
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-4">
                          <div className="rounded-[10px] bg-divider px-3 py-2">
                            <p className="text-[10px] text-ink-muted">
                              Route
                            </p>

                            <p className="text-[12px] font-semibold text-ink flex items-center gap-1">
                              <MapPin size={11} />

                              {trip.departureCity} →{' '}
                              {trip.destinationCity}
                            </p>
                          </div>

                          <div className="rounded-[10px] bg-divider px-3 py-2">
                            <p className="text-[10px] text-ink-muted">
                              Travel date
                            </p>

                            <p className="text-[12px] font-semibold text-ink flex items-center gap-1">
                              <Clock size={11} />

                              {formatDate(
                                trip.travelDate
                              )}
                            </p>
                          </div>

                          <div className="rounded-[10px] bg-divider px-3 py-2">
                            <p className="text-[10px] text-ink-muted">
                              Available capacity
                            </p>

                            <p className="text-[12px] font-semibold text-ink">
                              {
                                trip.remainingCapacityKg
                              }{' '}
                              kg
                            </p>
                          </div>

                          <div className="rounded-[10px] bg-divider px-3 py-2">
                            <p className="text-[10px] text-ink-muted">
                              Listed price
                            </p>

                            <p className="text-[12px] font-semibold text-ink">
                              ৳
                              {numericValue(
                                trip.pricePerKg
                              ).toLocaleString()}
                              /kg
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 mt-5 pt-4 border-t border-border items-end">
                      <label className="block">
                        <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                          Proposed fee (৳)
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={
                            fees[trip._id] ?? ''
                          }
                          onChange={(event) =>
                            setFees((current) => ({
                              ...current,
                              [trip._id]:
                                event.target.value,
                            }))
                          }
                          className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-[11px] font-semibold text-ink-muted mb-1">
                          Message (optional)
                        </span>

                        <input
                          type="text"
                          maxLength={500}
                          placeholder="Pickup timing, item note, etc."
                          value={
                            messages[trip._id] ?? ''
                          }
                          onChange={(event) =>
                            setMessages(
                              (current) => ({
                                ...current,
                                [trip._id]:
                                  event.target.value,
                              })
                            )
                          }
                          className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </label>

                      <Button
                        variant="primary"
                        size="md"
                        disabled={
                          busy ||
                          submittingTripId !== null
                        }
                        trailingIcon={
                          busy ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <ArrowRight size={14} />
                          )
                        }
                        onClick={() =>
                          handleSendRequest(option)
                        }
                      >
                        {busy
                          ? 'Sending…'
                          : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </main>
    </div>
  )
}