import { useState, useEffect } from 'react'
import {
  Plane, Plus, ArrowRight, AlertCircle,
  MoreVertical, Edit3, X, Clock, Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useToast } from '../../lib/toast'
import { getMyTrips, updateTrip } from '../../services/tripService'
import { getTripStatusInfo } from '../../data/tripStatus'

// NOTE: Trip.js's real schema has no `notes` or `pickupPreferences` fields
// at all (the Figma prototype collected both, but the actual backend model
// never had anywhere to store them). Dropped consistently here too, same
// as PostTrip.jsx — not silently referencing fields that don't exist.

function CapacityBar({ used, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between text-[11px] text-ink-muted mb-1.5">
        <span>{used} kg committed</span>
        <span>{total - used} kg available</span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct > 70 ? 'linear-gradient(90deg,#F9735B,#e05a42)' : 'linear-gradient(90deg,#3157D5,#4466e0)',
          }}
        />
      </div>
    </div>
  )
}

function CloseConfirmModal({ trip, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[400px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] p-6 animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-warning" />
        </div>
        <h3 className="text-[18px] font-bold text-ink mb-1">Close this trip?</h3>
        <p className="text-[13px] text-ink-secondary mb-3">
          Stop accepting new delivery requests for <strong>{trip.departureCity} → {trip.destinationCity}</strong>?
        </p>
        <div className="rounded-[12px] bg-info-light border border-info/20 px-4 py-3 text-[12px] text-ink-secondary mb-5">
          <strong className="text-ink">Existing accepted orders will remain active.</strong> Only new requests will be blocked.
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose} disabled={loading}>Keep Active</Button>
          <Button variant="coral" size="md" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Close Trip'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditTripModal({ trip, onClose, onSave, loading }) {
  const [capacityKg, setCapacityKg] = useState(trip.luggageCapacityKg)
  const [feePerKg, setFeePerKg] = useState(trip.pricePerKg)
  const [error, setError] = useState('')

  const usedKg = trip.luggageCapacityKg - trip.remainingCapacityKg

  function handleSave() {
    if (capacityKg < usedKg) {
      setError(`Capacity can't be less than the ${usedKg} kg already committed to active orders.`)
      return
    }
    onSave({
      luggageCapacityKg: capacityKg,
      remainingCapacityKg: capacityKg - usedKg,
      pricePerKg: feePerKg,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[440px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-[17px] font-bold text-ink">Edit Trip</h3>
          <p className="text-[13px] text-ink-muted mt-0.5">{trip.departureCity} → {trip.destinationCity}</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Total Capacity (kg)</label>
            <input
              type="number"
              min={usedKg} max={50} step={0.5}
              value={capacityKg}
              onChange={e => { setCapacityKg(+e.target.value); setError('') }}
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Carrying Fee (৳/kg)</label>
            <input
              type="number"
              min={50}
              value={feePerKg}
              onChange={e => setFeePerKg(+e.target.value)}
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-[12px] text-danger">
              <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TripCard({ trip, onEdit, onCloseRequest }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const usedKg = trip.luggageCapacityKg - trip.remainingCapacityKg
  const statusInfo = getTripStatusInfo(trip.status)
  const isClosed = trip.status === 'cancelled' || trip.status === 'completed'

  return (
    <div className={`rounded-[18px] border bg-white p-5 transition-all duration-200 hover:shadow-[var(--shadow-e2)] ${
      isClosed ? 'opacity-70 border-border' : 'border-border hover:-translate-y-0.5'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
            isClosed ? 'bg-divider' : 'bg-primary-light'
          }`}>
            <Plane size={18} className={isClosed ? 'text-ink-muted' : 'text-primary'} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-ink">{trip.departureCity} → {trip.destinationCity}</p>
            <div className="flex items-center gap-2 text-[12px] text-ink-muted mt-0.5">
              <Clock size={11} />
              <span>{new Date(trip.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(s => !s)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:bg-divider hover:text-ink transition-colors"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-[12px] bg-white shadow-[var(--shadow-e3)] border border-border overflow-hidden z-20 animate-[bb-rise_0.15s_ease_both]">
                {!isClosed && (
                  <>
                    <button
                      onClick={() => { onEdit(); setMenuOpen(false) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors"
                    >
                      <Edit3 size={13} /> Edit Trip
                    </button>
                    <button
                      onClick={() => { onCloseRequest(); setMenuOpen(false) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-danger hover:bg-danger-light transition-colors"
                    >
                      <X size={13} /> Close Trip
                    </button>
                  </>
                )}
                {isClosed && (
                  <div className="px-4 py-2.5 text-[12px] text-ink-muted">No actions available</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <CapacityBar used={usedKg} total={trip.luggageCapacityKg} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Fee', value: `৳${trip.pricePerKg}/kg` },
          { label: 'Available', value: `${trip.remainingCapacityKg} kg` },
        ].map(s => (
          <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2 text-center">
            <p className="text-[13px] font-bold text-ink">{s.value}</p>
            <p className="text-[10px] text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(trip.allowedCategories || []).slice(0, 3).map(c => (
          <span key={c} className="rounded-full bg-primary-light text-primary text-[10px] font-semibold px-2.5 py-0.5">
            {c}
          </span>
        ))}
        {(trip.allowedCategories || []).length > 3 && (
          <span className="rounded-full bg-divider text-ink-muted text-[10px] px-2 py-0.5">
            +{trip.allowedCategories.length - 3} more
          </span>
        )}
      </div>
    </div>
  )
}

export function MyTrips() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingTrip, setClosingTrip] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchTrips() {
      try {
        const data = await getMyTrips()
        if (!cancelled) setTrips(data.trips || [])
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTrips()
    return () => { cancelled = true }
  }, [])

  const activeTrips = trips.filter(t => t.status !== 'cancelled' && t.status !== 'completed')
  const closedTrips = trips.filter(t => t.status === 'cancelled' || t.status === 'completed')

  async function handleClose(trip) {
    setActionLoading(true)
    try {
      const data = await updateTrip(trip._id, { status: 'cancelled' })
      setTrips(prev => prev.map(t => t._id === trip._id ? data.trip : t))
      setClosingTrip(null)
      toast({ tone: 'info', title: 'Trip closed', message: `${trip.departureCity} → ${trip.destinationCity} is no longer accepting new requests.` })
    } catch (error) {
      const message = error.response?.data?.message || 'Could not close this trip. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSave(trip, updates) {
    setActionLoading(true)
    try {
      const data = await updateTrip(trip._id, updates)
      setTrips(prev => prev.map(t => t._id === trip._id ? data.trip : t))
      setEditingTrip(null)
      toast({ tone: 'success', title: 'Trip updated', message: 'Your changes have been saved.' })
    } catch (error) {
      const message = error.response?.data?.message || 'Could not save your changes. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    } finally {
      setActionLoading(false)
    }
  }

  const totalActiveCapacity = activeTrips.reduce((s, t) => s + t.luggageCapacityKg, 0)
  const totalCommitted = trips.reduce((s, t) => s + (t.luggageCapacityKg - t.remainingCapacityKg), 0)
  const totalAvailable = activeTrips.reduce((s, t) => s + t.remainingCapacityKg, 0)

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      {closingTrip && (
        <CloseConfirmModal
          trip={closingTrip}
          onClose={() => setClosingTrip(null)}
          onConfirm={() => handleClose(closingTrip)}
          loading={actionLoading}
        />
      )}
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSave={(u) => handleSave(editingTrip, u)}
          loading={actionLoading}
        />
      )}

      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[13px] text-ink-muted mb-1 flex items-center gap-1.5">
              <Plane size={13} /> Traveler Mode
            </p>
            <h1 className="text-[30px] font-bold text-ink tracking-tight">My Trips</h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {activeTrips.length} active trip{activeTrips.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="coral"
            size="lg"
            leadingIcon={<Plus size={16} />}
            trailingIcon={<ArrowRight size={15} />}
            onClick={() => navigate('/trips/new')}
          >
            Post a Trip
          </Button>
        </div>

        {loading ? (
          <div className="rounded-[18px] border border-border bg-white p-10 flex items-center justify-center mb-8">
            <Loader2 size={22} className="text-ink-muted animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-[18px] bg-white border border-border p-5 mb-8 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-bold text-ink">Capacity Overview</p>
                <span className="text-[11px] text-ink-muted">All active trips</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total capacity', value: `${totalActiveCapacity} kg` },
                  { label: 'Committed', value: `${totalCommitted} kg`, cls: 'text-coral' },
                  { label: 'Available', value: `${totalAvailable} kg`, cls: 'text-success' },
                ].map(s => (
                  <div key={s.label} className="rounded-[12px] bg-divider px-4 py-3">
                    <p className={`text-[20px] font-bold ${s.cls ?? 'text-ink'}`}>{s.value}</p>
                    <p className="text-[11px] text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {activeTrips.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[16px] font-bold text-ink mb-4">Active Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTrips.map(trip => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      onEdit={() => setEditingTrip(trip)}
                      onCloseRequest={() => setClosingTrip(trip)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTrips.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
                <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <Plane size={24} className="text-primary" />
                </div>
                <h3 className="text-[18px] font-bold text-ink mb-1.5">No active trips</h3>
                <p className="text-[14px] text-ink-secondary mb-6">Post a trip to start receiving delivery requests from senders.</p>
                <Button variant="primary" size="lg" leadingIcon={<Plus size={15} />} onClick={() => navigate('/trips/new')}>
                  Post Your First Trip
                </Button>
              </div>
            )}

            {closedTrips.length > 0 && (
              <div>
                <h2 className="text-[16px] font-bold text-ink mb-4 flex items-center gap-2">
                  <X size={15} className="text-ink-muted" /> Closed Trips
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {closedTrips.map(trip => (
                    <TripCard key={trip._id} trip={trip} onEdit={() => {}} onCloseRequest={() => {}} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}