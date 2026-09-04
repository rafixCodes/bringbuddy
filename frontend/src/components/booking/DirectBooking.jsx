import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  MapPin,
  Package,
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
          option.suggestedFee || option.trip.pricePerKg || ''
      }
      setFees(initialFees)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load matching travelers.'
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
    return `${order.pickup?.city || '?'} → ${order.destination?.city || '?'}`
  }, [order])

  async function handleSendRequest(option) {
    const tripId = option.trip._id
    const proposedFee = Number(fees[tripId])

    if (!Number.isFinite(proposedFee) || proposedFee <= 0) {
      toast({
        tone: 'error',
        title: 'Invalid fee',
        message: 'Enter a proposed fee greater than 0.',
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
        message: err.response?.data?.message || 'Please try again.',
      })
    } finally {
      setSubmittingTripId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1000px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <button
          onClick={() => navigate('/booking-center')}
          className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to Booking Center
        </button>

        <div className="mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-primary mb-2">
            Manual traveler search
          </p>
          <h1 className="text-[30px] font-bold text-ink tracking-tight">
            Find a Traveler
          </h1>
          <p className="text-[14px] text-ink-secondary mt-1">
            {routeLabel || 'Matching your delivery route'}
            {order?.totalWeightKg ? ` · ${order.totalWeightKg} kg` : ''}
          </p>
        </div>

        <div className="mb-5 rounded-[13px] bg-primary-light border border-primary/15 px-4 py-3 flex items-start gap-2.5">
          <Search size={15} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[12px] text-ink-secondary">
            Your marketplace post stays active while you approach travelers.
            It closes only after one traveler is accepted.
          </p>
        </div>

        {loading && (
          <div className="rounded-[18px] border border-border bg-white p-10 flex items-center justify-center gap-3 text-ink-muted">
            <Loader2 size={20} className="animate-spin" /> Finding matching verified
            trips…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[16px] border border-danger/20 bg-danger-light p-5 text-[14px] text-danger">
            {error}
          </div>
        )}

        {!loading && !error && options.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
            <Package size={30} className="mx-auto mb-3 text-ink-muted" />
            <p className="text-[16px] font-semibold text-ink">
              No new matching traveler right now
            </p>
            <p className="text-[13px] text-ink-muted mt-1">
              Travelers who already applied or already have a pending request are
              not shown here.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-4"
              onClick={() => navigate('/booking-center')}
            >
              Review booking activity
            </Button>
          </div>
        )}

        {!loading && !error && options.length > 0 && (
          <div className="flex flex-col gap-4">
            {options.map((option) => {
              const trip = option.trip
              const traveler = trip.traveler || {}
              const busy = submittingTripId === trip._id

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
                          {traveler.name || 'Traveler'}
                        </h2>

                        {traveler.travelerInfo?.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[12px] text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Star size={11} />{' '}
                          {Number(
                            traveler.travelerInfo?.averageRating || 0
                          ).toFixed(1)}
                        </span>
                        <span>
                          {traveler.travelerInfo?.completedDeliveries || 0}{' '}
                          deliveries
                        </span>
                        <span>
                          Trust {traveler.travelerInfo?.trustScore || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                        <div className="rounded-[10px] bg-divider px-3 py-2">
                          <p className="text-[10px] text-ink-muted">Route</p>
                          <p className="text-[12px] font-semibold text-ink flex items-center gap-1">
                            <MapPin size={11} /> {trip.departureCity} →{' '}
                            {trip.destinationCity}
                          </p>
                        </div>

                        <div className="rounded-[10px] bg-divider px-3 py-2">
                          <p className="text-[10px] text-ink-muted">
                            Travel date
                          </p>
                          <p className="text-[12px] font-semibold text-ink flex items-center gap-1">
                            <Clock size={11} /> {formatDate(trip.travelDate)}
                          </p>
                        </div>

                        <div className="rounded-[10px] bg-divider px-3 py-2">
                          <p className="text-[10px] text-ink-muted">
                            Available capacity
                          </p>
                          <p className="text-[12px] font-semibold text-ink">
                            {trip.remainingCapacityKg} kg
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
                        value={fees[trip._id] ?? ''}
                        onChange={(e) =>
                          setFees((prev) => ({
                            ...prev,
                            [trip._id]: e.target.value,
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
                        placeholder="Pickup timing, item note, etc."
                        value={messages[trip._id] ?? ''}
                        onChange={(e) =>
                          setMessages((prev) => ({
                            ...prev,
                            [trip._id]: e.target.value,
                          }))
                        }
                        className="w-full h-10 rounded-[8px] border border-border px-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>

                    <Button
                      variant="primary"
                      size="md"
                      disabled={busy || submittingTripId !== null}
                      trailingIcon={
                        busy ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ArrowRight size={14} />
                        )
                      }
                      onClick={() => handleSendRequest(option)}
                    >
                      {busy ? 'Sending…' : 'Send Request'}
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
