import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Plane,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react'
import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../lib/toast'
import { getMyOrders } from '../../services/orderService'
import {
  acceptApplication,
  acceptDirectBookingRequest,
  getMyApplications,
  getMyDirectBookingRequests,
  getOrderApplications,
  getOrderDirectBookingRequests,
  rejectApplication,
  rejectDirectBookingRequest,
} from '../../services/applicationService'

const statusClass = {
  created: 'bg-divider text-ink-muted',
  pending: 'bg-warning-light text-warning',
  accepted: 'bg-success-light text-success',
  rejected: 'bg-danger-light text-danger',
}

const labelStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ')
}

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="rounded-[18px] border border-dashed border-border bg-white p-8 text-center">
      <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-divider flex items-center justify-center text-ink-muted">
        {icon}
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="text-[12px] text-ink-muted mt-1">{message}</p>
    </div>
  )
}

function MarketplaceApplicationCard({ application, onAccept, onReject, busy }) {
  const traveler = application.traveler || {}
  const trip = application.trip || {}
  const info = traveler.travelerInfo || {}

  return (
    <div className="rounded-[16px] border border-border bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-ink">
              {traveler.name || 'Traveler'}
            </p>
            {info.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                statusClass[application.status] || 'bg-divider text-ink-muted'
              }`}
            >
              {labelStatus(application.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted mt-1">
            <span className="flex items-center gap-1">
              <Star size={10} /> {Number(info.averageRating || 0).toFixed(1)}
            </span>
            <span>{info.completedDeliveries || 0} deliveries</span>
            <span>
              {trip.departureCity} → {trip.destinationCity}
            </span>
            <span>{formatDate(trip.travelDate)}</span>
          </div>

          {application.message && (
            <p className="mt-3 rounded-[9px] bg-divider px-3 py-2 text-[12px] text-ink-secondary">
              “{application.message}”
            </p>
          )}
        </div>

        <div className="sm:text-right shrink-0">
          <p className="text-[18px] font-bold text-ink">
            ৳{Number(application.proposedFee || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-muted">proposed fee</p>
        </div>
      </div>

      {application.status === 'pending' && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="primary"
            size="md"
            disabled={busy}
            onClick={onAccept}
            leadingIcon={
              busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={13} />
              )
            }
          >
            Accept
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={busy}
            onClick={onReject}
            leadingIcon={<XCircle size={13} />}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

function SentDirectRequestCard({ request }) {
  const traveler = request.traveler || {}
  const trip = request.trip || {}

  return (
    <div className="rounded-[14px] border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-ink">
              {traveler.name || 'Traveler'}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                statusClass[request.status] || 'bg-divider text-ink-muted'
              }`}
            >
              {labelStatus(request.status)}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">
            {trip.departureCity} → {trip.destinationCity} · {formatDate(trip.travelDate)}
          </p>
          {request.message && (
            <p className="mt-2 text-[12px] text-ink-secondary">
              “{request.message}”
            </p>
          )}
        </div>
        <p className="text-[15px] font-bold text-ink shrink-0">
          ৳{Number(request.proposedFee || 0).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export function BookingCenter() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const mode = user?.currentMode

  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [orderApplications, setOrderApplications] = useState([])
  const [orderDirectRequests, setOrderDirectRequests] = useState([])

  const [incomingDirectRequests, setIncomingDirectRequests] = useState([])
  const [myApplications, setMyApplications] = useState([])

  async function loadSender() {
    const data = await getMyOrders()
    setOrders(data.orders || [])
  }

  async function loadTraveler() {
    const [directData, applicationData] = await Promise.all([
      getMyDirectBookingRequests(),
      getMyApplications(),
    ])

    setIncomingDirectRequests(directData.requests || [])
    setMyApplications(applicationData.applications || [])
  }

  async function loadOrderActivity(orderId) {
    try {
      setSelectedOrderId(orderId)
      setActivityLoading(true)

      const [applicationData, directData] = await Promise.all([
        getOrderApplications(orderId),
        getOrderDirectBookingRequests(orderId),
      ])

      setOrderApplications(applicationData.applications || [])
      setOrderDirectRequests(directData.requests || [])
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Could not load booking activity',
        message: error.response?.data?.message || 'Please try again.',
      })
    } finally {
      setActivityLoading(false)
    }
  }

  async function refresh() {
    try {
      setLoading(true)

      if (mode === 'sender') {
        await loadSender()
        if (selectedOrderId) {
          await loadOrderActivity(selectedOrderId)
        }
      }

      if (mode === 'traveler') {
        await loadTraveler()
      }
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Could not load bookings',
        message: error.response?.data?.message || 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        if (mode === 'sender') {
          const data = await getMyOrders()
          if (!cancelled) setOrders(data.orders || [])
        }

        if (mode === 'traveler') {
          const [directData, applicationData] = await Promise.all([
            getMyDirectBookingRequests(),
            getMyApplications(),
          ])

          if (!cancelled) {
            setIncomingDirectRequests(directData.requests || [])
            setMyApplications(applicationData.applications || [])
          }
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            tone: 'error',
            title: 'Could not load bookings',
            message: error.response?.data?.message || 'Please try again.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mode])

  async function handlePublicAction(applicationId, action) {
    try {
      setBusyId(applicationId)

      if (action === 'accept') {
        await acceptApplication(applicationId)
        toast({
          tone: 'success',
          title: 'Traveler selected',
          message:
            'The order is accepted. Marketplace and other pending requests are now closed.',
        })
      } else {
        await rejectApplication(applicationId)
        toast({
          tone: 'info',
          title: 'Application rejected',
          message: 'The order remains available to other travelers.',
        })
      }

      if (selectedOrderId) {
        await loadOrderActivity(selectedOrderId)
      }
      await loadSender()
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Action failed',
        message: error.response?.data?.message || 'Please try again.',
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDirectAction(requestId, action) {
    try {
      setBusyId(requestId)

      if (action === 'accept') {
        await acceptDirectBookingRequest(requestId)
        toast({
          tone: 'success',
          title: 'Booking accepted',
          message: 'The order is now assigned to you.',
        })
      } else {
        await rejectDirectBookingRequest(requestId)
        toast({
          tone: 'info',
          title: 'Request rejected',
          message: 'The sender can approach another traveler.',
        })
      }

      await loadTraveler()
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Action failed',
        message: error.response?.data?.message || 'Please try again.',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1120px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[30px] font-bold text-ink tracking-tight">
              Booking Center
            </h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {mode === 'traveler'
                ? 'Review direct booking requests and the marketplace applications you sent.'
                : 'Review marketplace applications or approach a matching traveler yourself.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={refresh}
            disabled={loading}
            leadingIcon={
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            }
          >
            Refresh
          </Button>
        </div>

        {loading && (
          <div className="rounded-[18px] border border-border bg-white p-10 flex items-center justify-center gap-3 text-ink-muted">
            <Loader2 size={20} className="animate-spin" /> Loading bookings…
          </div>
        )}

        {!loading && mode === 'sender' && (
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-bold text-ink">
                  Your delivery posts
                </h2>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/orders/new')}
                >
                  Post delivery
                </Button>
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  icon={<Package size={22} />}
                  title="No delivery posts yet"
                  message="Post a delivery to the marketplace. You can then wait for applications or find a traveler yourself."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => {
                    const isOpen =
                      !order.traveler &&
                      ['created', 'pending'].includes(order.status)

                    return (
                      <div
                        key={order._id}
                        className={`rounded-[15px] border bg-white p-4 ${
                          selectedOrderId === order._id
                            ? 'border-primary shadow-[var(--shadow-e1)]'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                              {order.isPublic && isOpen
                                ? 'Marketplace active'
                                : order.status === 'accepted'
                                ? 'Marketplace closed'
                                : 'Delivery order'}
                            </p>
                            <p className="text-[15px] font-bold text-ink mt-1">
                              {order.pickup?.city} → {order.destination?.city}
                            </p>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              {order.orderType === 'parcel'
                                ? `${order.totalWeightKg || 0} kg parcel`
                                : 'Shopping request'}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              statusClass[order.status] ||
                              'bg-divider text-ink-muted'
                            }`}
                          >
                            {labelStatus(order.status)}
                          </span>
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => loadOrderActivity(order._id)}
                          >
                            Review Activity
                          </Button>

                          {isOpen && (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() =>
                                navigate(`/booking/direct/${order._id}`)
                              }
                              leadingIcon={<Search size={13} />}
                              trailingIcon={<ArrowRight size={13} />}
                            >
                              Find Traveler
                            </Button>
                          )}

                          {order.status === 'accepted' && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-success font-medium">
                              <CheckCircle2 size={12} /> Traveler assigned
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              {!selectedOrderId ? (
                <EmptyState
                  icon={<Plane size={22} />}
                  title="Select a delivery post"
                  message="Review its marketplace applications and the direct requests you have sent."
                />
              ) : activityLoading ? (
                <div className="rounded-[18px] border border-border bg-white p-10 flex justify-center">
                  <Loader2 size={20} className="animate-spin text-ink-muted" />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[17px] font-bold text-ink mb-3">
                      Marketplace applications
                    </h2>

                    {orderApplications.length === 0 ? (
                      <EmptyState
                        icon={<Clock size={22} />}
                        title="No applications yet"
                        message="Your marketplace post can stay active while you manually find a traveler."
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {orderApplications.map((application) => (
                          <MarketplaceApplicationCard
                            key={application._id}
                            application={application}
                            busy={busyId === application._id}
                            onAccept={() =>
                              handlePublicAction(application._id, 'accept')
                            }
                            onReject={() =>
                              handlePublicAction(application._id, 'reject')
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-[17px] font-bold text-ink mb-3">
                      Requests you sent
                    </h2>

                    {orderDirectRequests.length === 0 ? (
                      <EmptyState
                        icon={<Search size={22} />}
                        title="No direct requests sent"
                        message="Use Find Traveler to approach a verified traveler for this same order."
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {orderDirectRequests.map((request) => (
                          <SentDirectRequestCard
                            key={request._id}
                            request={request}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {!loading && mode === 'traveler' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <h2 className="text-[17px] font-bold text-ink mb-3">
                Booking requests
              </h2>

              {incomingDirectRequests.length === 0 ? (
                <EmptyState
                  icon={<Package size={22} />}
                  title="No direct requests"
                  message="Senders can approach you when one of your published trips matches their delivery."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {incomingDirectRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-[16px] border border-border bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[15px] font-bold text-ink">
                              {request.order?.pickup?.city} →{' '}
                              {request.order?.destination?.city}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                statusClass[request.status] ||
                                'bg-divider text-ink-muted'
                              }`}
                            >
                              {labelStatus(request.status)}
                            </span>
                          </div>

                          <p className="text-[12px] text-ink-muted mt-1">
                            Sender: {request.order?.sender?.name || 'BringBuddy sender'} ·
                            Trip {formatDate(request.trip?.travelDate)}
                          </p>

                          {request.message && (
                            <p className="mt-3 rounded-[9px] bg-divider px-3 py-2 text-[12px] text-ink-secondary">
                              “{request.message}”
                            </p>
                          )}
                        </div>

                        <p className="text-[18px] font-bold text-ink shrink-0">
                          ৳{Number(request.proposedFee || 0).toLocaleString()}
                        </p>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button
                            variant="primary"
                            size="md"
                            disabled={busyId === request._id}
                            onClick={() =>
                              handleDirectAction(request._id, 'accept')
                            }
                            leadingIcon={<CheckCircle2 size={13} />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                            disabled={busyId === request._id}
                            onClick={() =>
                              handleDirectAction(request._id, 'reject')
                            }
                            leadingIcon={<XCircle size={13} />}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-ink mb-3">
                Your marketplace applications
              </h2>

              {myApplications.length === 0 ? (
                <EmptyState
                  icon={<Plane size={22} />}
                  title="No marketplace applications"
                  message="Applications you submit to public delivery posts will appear here."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {myApplications.map((application) => (
                    <div
                      key={application._id}
                      className="rounded-[16px] border border-border bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-bold text-ink">
                            {application.order?.pickup?.city} →{' '}
                            {application.order?.destination?.city}
                          </p>
                          <p className="text-[12px] text-ink-muted mt-1">
                            Trip {formatDate(application.trip?.travelDate)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            statusClass[application.status] ||
                            'bg-divider text-ink-muted'
                          }`}
                        >
                          {labelStatus(application.status)}
                        </span>
                      </div>

                      <p className="text-[13px] font-semibold text-ink mt-3">
                        Proposed fee: ৳
                        {Number(application.proposedFee || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {!loading && !['sender', 'traveler'].includes(mode) && (
          <EmptyState
            icon={<Clock size={22} />}
            title="Choose a mode first"
            message="Switch to Sender or Traveler mode to manage bookings."
          />
        )}
      </main>
    </div>
  )
}
