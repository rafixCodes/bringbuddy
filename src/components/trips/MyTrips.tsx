import { useState } from 'react'
import {
  Plane, Plus, ArrowRight, ChevronRight, Package, AlertCircle,
  MoreVertical, Edit3, X, CheckCircle2, Clock, MapPin,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type MyTrip } from '../../lib/router'
import { useToast } from '../../lib/toast'

const TRUST_COLORS = {
  'High Trust': 'bg-success-light text-success',
  'Trusted': 'bg-primary-light text-primary',
  'New': 'bg-divider text-ink-muted',
}

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100))
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

function CloseConfirmModal({ trip, onClose, onConfirm }: { trip: MyTrip; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[400px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] p-6 animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-warning" />
        </div>
        <h3 className="text-[18px] font-bold text-ink mb-1">Close this trip?</h3>
        <p className="text-[13px] text-ink-secondary mb-3">
          Stop accepting new delivery requests for <strong>{trip.from} → {trip.to}</strong>?
        </p>
        <div className="rounded-[12px] bg-info-light border border-info/20 px-4 py-3 text-[12px] text-ink-secondary mb-5">
          <strong className="text-ink">Existing accepted orders will remain active.</strong> Only new requests will be blocked.
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Keep Active</Button>
          <Button variant="coral" size="md" className="flex-1" onClick={onConfirm}>Close Trip</Button>
        </div>
      </div>
    </div>
  )
}

function TripCard({ trip, onView, onEdit, onClose }: {
  trip: MyTrip
  onView: () => void
  onEdit: () => void
  onClose: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const available = trip.capacityKg - trip.usedKg

  return (
    <div className={`rounded-[18px] border bg-white p-5 transition-all duration-200 hover:shadow-[var(--shadow-e2)] ${
      trip.status === 'closed' ? 'opacity-70 border-border' : 'border-border hover:-translate-y-0.5'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
            trip.status === 'closed' ? 'bg-divider' : 'bg-primary-light'
          }`}>
            <Plane size={18} className={trip.status === 'closed' ? 'text-ink-muted' : 'text-primary'} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-ink">{trip.from} → {trip.to}</p>
            <div className="flex items-center gap-2 text-[12px] text-ink-muted mt-0.5">
              <Clock size={11} />
              <span>{trip.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            trip.status === 'active' ? 'bg-success-light text-success' :
            trip.status === 'closed' ? 'bg-divider text-ink-muted' :
            'bg-warning-light text-warning'
          }`}>
            {trip.status === 'active' ? 'Active' : trip.status === 'closed' ? 'Closed' : 'Draft'}
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
                <button
                  onClick={() => { onEdit(); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors"
                >
                  <Edit3 size={13} /> Edit Trip
                </button>
                {trip.status === 'active' && (
                  <button
                    onClick={() => { onClose(); setMenuOpen(false) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-danger hover:bg-danger-light transition-colors"
                  >
                    <X size={13} /> Close Trip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <CapacityBar used={trip.usedKg} total={trip.capacityKg} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Fee', value: `৳${trip.feePerKg}/kg` },
          { label: 'Available', value: `${available} kg` },
          { label: 'Orders', value: `${trip.activeOrders} active` },
        ].map(s => (
          <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2 text-center">
            <p className="text-[13px] font-bold text-ink">{s.value}</p>
            <p className="text-[10px] text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {trip.allowedCategories.slice(0, 3).map(c => (
          <span key={c} className="rounded-full bg-primary-light text-primary text-[10px] font-semibold px-2.5 py-0.5">
            {c}
          </span>
        ))}
        {trip.allowedCategories.length > 3 && (
          <span className="rounded-full bg-divider text-ink-muted text-[10px] px-2 py-0.5">
            +{trip.allowedCategories.length - 3} more
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="md" trailingIcon={<ArrowRight size={13} />} className="flex-1" onClick={onView}>
          View Trip
        </Button>
        {trip.status === 'active' && trip.activeOrders > 0 && (
          <Button variant="secondary" size="md" onClick={onView}>
            {trip.activeOrders} order{trip.activeOrders > 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </div>
  )
}

function EditTripModal({ trip, onClose, onSave }: {
  trip: MyTrip
  onClose: () => void
  onSave: (updated: Partial<MyTrip>) => void
}) {
  const [capacityKg, setCapacityKg] = useState(trip.capacityKg)
  const [feePerKg, setFeePerKg] = useState(trip.feePerKg)
  const [notes, setNotes] = useState(trip.notes)
  const [pickupPreferences, setPickupPreferences] = useState(trip.pickupPreferences)
  const [error, setError] = useState('')

  function handleSave() {
    if (capacityKg < trip.usedKg) {
      setError(`Cannot reduce capacity below the committed ${trip.usedKg} kg. Current committed: ${trip.usedKg} kg.`)
      return
    }
    if (feePerKg < 50) { setError('Fee must be at least ৳50/kg.'); return }
    onSave({ capacityKg, feePerKg, notes, pickupPreferences })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[480px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] overflow-hidden animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-ink">Edit Trip</h3>
            <p className="text-[12px] text-ink-muted">{trip.from} → {trip.to} · {trip.date}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-divider transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {trip.usedKg > 0 && (
            <div className="rounded-[12px] bg-warning-light border border-warning/20 px-4 py-3 text-[12px] text-ink-secondary">
              <strong className="text-ink">Current committed: {trip.usedKg} kg.</strong> You cannot reduce total capacity below this amount.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Total Capacity (kg)</label>
              <input
                type="number"
                min={trip.usedKg}
                max={30}
                value={capacityKg}
                onChange={e => setCapacityKg(Number(e.target.value))}
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Fee per kg (৳)</label>
              <input
                type="number"
                min={50}
                value={feePerKg}
                onChange={e => setFeePerKg(Number(e.target.value))}
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Pickup Preferences</label>
            <input
              type="text"
              value={pickupPreferences}
              onChange={e => setPickupPreferences(e.target.value)}
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. Gulshan-2 or Banani area"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Notes for senders</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              placeholder="Any notes for senders…"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-[12px] text-danger">
              <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

export function MyTrips() {
  const { navigate, myTrips, setMyTrips, setViewingTripId } = useRouter()
  const { toast } = useToast()
  const [closingTrip, setClosingTrip] = useState<MyTrip | null>(null)
  const [editingTrip, setEditingTrip] = useState<MyTrip | null>(null)

  const activeTrips = myTrips.filter(t => t.status !== 'closed')
  const closedTrips = myTrips.filter(t => t.status === 'closed')

  function handleClose(trip: MyTrip) {
    setMyTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: 'closed' } : t))
    setClosingTrip(null)
    toast({ tone: 'info', title: 'Trip closed', message: `${trip.from} → ${trip.to} is no longer accepting new requests.` })
  }

  function handleSave(trip: MyTrip, updates: Partial<MyTrip>) {
    setMyTrips(prev => prev.map(t => t.id === trip.id ? { ...t, ...updates } : t))
    setEditingTrip(null)
    toast({ tone: 'success', title: 'Trip updated', message: 'Your changes have been saved.' })
  }

  function handleView(trip: MyTrip) {
    setViewingTripId(trip.id)
    navigate('trip-detail')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      {closingTrip && (
        <CloseConfirmModal
          trip={closingTrip}
          onClose={() => setClosingTrip(null)}
          onConfirm={() => handleClose(closingTrip)}
        />
      )}
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSave={(u) => handleSave(editingTrip, u)}
        />
      )}

      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[13px] text-ink-muted mb-1 flex items-center gap-1.5">
              <Plane size={13} /> Traveler Mode
            </p>
            <h1 className="text-[30px] font-bold text-ink tracking-tight">My Trips</h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {myTrips.filter(t => t.status === 'active').length} active · {myTrips.reduce((s, t) => s + t.activeOrders, 0)} total orders
            </p>
          </div>
          <Button
            variant="coral"
            size="lg"
            leadingIcon={<Plus size={16} />}
            trailingIcon={<ArrowRight size={15} />}
            onClick={() => navigate('post-trip')}
          >
            Post a Trip
          </Button>
        </div>

        {/* Capacity overview */}
        <div className="rounded-[18px] bg-white border border-border p-5 mb-8 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-ink">Capacity Overview</p>
            <span className="text-[11px] text-ink-muted">All active trips</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total capacity', value: `${myTrips.filter(t => t.status === 'active').reduce((s, t) => s + t.capacityKg, 0)} kg` },
              { label: 'Committed', value: `${myTrips.reduce((s, t) => s + t.usedKg, 0)} kg`, cls: 'text-coral' },
              { label: 'Available', value: `${myTrips.filter(t => t.status === 'active').reduce((s, t) => s + t.capacityKg - t.usedKg, 0)} kg`, cls: 'text-success' },
              { label: 'Active orders', value: `${myTrips.reduce((s, t) => s + t.activeOrders, 0)}`, cls: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="rounded-[12px] bg-divider px-4 py-3">
                <p className={`text-[20px] font-bold ${s.cls ?? 'text-ink'}`}>{s.value}</p>
                <p className="text-[11px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active trips */}
        {activeTrips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[16px] font-bold text-ink mb-4">Active Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTrips.map((trip, i) => (
                <div key={trip.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
                  <TripCard
                    trip={trip}
                    onView={() => handleView(trip)}
                    onEdit={() => setEditingTrip(trip)}
                    onClose={() => setClosingTrip(trip)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {activeTrips.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-ink mb-1.5">No active trips</h3>
            <p className="text-[14px] text-ink-secondary mb-6">Post a trip to start receiving delivery requests from senders.</p>
            <Button variant="primary" size="lg" leadingIcon={<Plus size={15} />} onClick={() => navigate('post-trip')}>
              Post Your First Trip
            </Button>
          </div>
        )}

        {/* Closed trips */}
        {closedTrips.length > 0 && (
          <div>
            <h2 className="text-[16px] font-bold text-ink mb-4 flex items-center gap-2">
              <X size={15} className="text-ink-muted" /> Closed Trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closedTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onView={() => handleView(trip)}
                  onEdit={() => setEditingTrip(trip)}
                  onClose={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
