import { useState } from 'react'
import {
  Plane, CheckCircle2, ArrowRight, ChevronLeft, Loader2,
  MapPin, Calendar, Weight, DollarSign, AlertCircle,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type MyTrip } from '../../lib/router'
import { useToast } from '../../lib/toast'

const CITIES = ['Dhaka', 'London', 'New York', 'Dubai', 'Toronto', 'Sydney', 'Paris', 'Frankfurt', 'Kuala Lumpur', 'Singapore']

const ALL_CATEGORIES = ['Documents', 'Clothing', 'Small Electronics', 'Gifts', 'Books', 'Food items', 'Cosmetics', 'Toys']

interface FormState {
  from: string
  to: string
  departureDate: string
  capacityKg: string
  feePerKg: string
  pickupPreferences: string
  notes: string
  allowedCategories: string[]
}

interface SuccessState {
  trip: MyTrip
}

function SuccessView({ trip, onViewTrip, onDashboard }: {
  trip: MyTrip
  onViewTrip: () => void
  onDashboard: () => void
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] text-center animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        {/* Success ring */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-success-light animate-[bb-pulse_1.2s_ease_both]" />
          <div className="absolute inset-2 rounded-full bg-success flex items-center justify-center">
            <CheckCircle2 size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-ink mb-2">Trip published!</h1>
        <p className="text-[15px] text-ink-secondary mb-6">
          Your <strong>{trip.from} → {trip.to}</strong> trip is now visible to Senders.
        </p>

        {/* Trip card */}
        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center shrink-0">
              <Plane size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-[17px] font-bold text-ink">{trip.from} → {trip.to}</p>
              <p className="text-[12px] text-ink-muted">{trip.date}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Capacity', value: `${trip.capacityKg} kg` },
              { label: 'Fee', value: `৳${trip.feePerKg}/kg` },
              { label: 'Status', value: 'Active' },
            ].map(s => (
              <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2 text-center">
                <p className="text-[13px] font-bold text-ink">{s.value}</p>
                <p className="text-[10px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trip.allowedCategories.map(c => (
              <span key={c} className="rounded-full bg-primary-light text-primary text-[10px] font-semibold px-2.5 py-0.5">{c}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" className="w-full" trailingIcon={<ArrowRight size={15} />} onClick={onViewTrip}>
            View Trip
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={onDashboard}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PostTrip() {
  const { navigate, setMyTrips, setViewingTripId } = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<SuccessState | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const [form, setForm] = useState<FormState>({
    from: 'Dhaka',
    to: 'London',
    departureDate: '',
    capacityKg: '',
    feePerKg: '',
    pickupPreferences: '',
    notes: '',
    allowedCategories: ['Documents', 'Clothing'],
  })

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function toggleCategory(cat: string) {
    setForm(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(cat)
        ? prev.allowedCategories.filter(c => c !== cat)
        : [...prev.allowedCategories, cat],
    }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.from || !form.to) e.from = 'Please enter both origin and destination.'
    if (form.from === form.to) e.to = 'Origin and destination must be different.'
    if (!form.departureDate) e.departureDate = 'Travel date must be in the future.'
    else {
      const d = new Date(form.departureDate)
      if (d <= new Date()) e.departureDate = 'Travel date must be in the future.'
    }
    const cap = parseFloat(form.capacityKg)
    if (!form.capacityKg || isNaN(cap) || cap <= 0 || cap > 50) e.capacityKg = 'Enter a valid luggage capacity (1–50 kg).'
    const fee = parseFloat(form.feePerKg)
    if (!form.feePerKg || isNaN(fee) || fee < 50) e.feePerKg = 'Please enter a carrying fee (min ৳50/kg).'
    if (form.allowedCategories.length === 0) e.allowedCategories = 'Select at least one allowed category.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePublish() {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    const newTrip: MyTrip = {
      id: `mt-${Date.now()}`,
      from: form.from,
      to: form.to,
      date: new Date(form.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      capacityKg: parseFloat(form.capacityKg),
      usedKg: 0,
      feePerKg: parseFloat(form.feePerKg),
      allowedCategories: form.allowedCategories,
      pickupPreferences: form.pickupPreferences,
      notes: form.notes,
      status: 'active',
      activeOrders: 0,
    }
    setMyTrips(prev => [newTrip, ...prev])
    setLoading(false)
    toast({ tone: 'success', title: '✈️ Trip published!', message: `${form.from} → ${form.to} is now visible to senders.` })
    setSuccess({ trip: newTrip })
  }

  async function handleSaveDraft() {
    toast({ tone: 'info', title: 'Draft saved', message: 'You can resume this later.' })
    navigate('traveler-dashboard')
  }

  if (success) {
    return (
      <>
        <AuthNavbar />
        <SuccessView
          trip={success.trip}
          onViewTrip={() => { setViewingTripId(success.trip.id); navigate('my-trips') }}
          onDashboard={() => navigate('traveler-dashboard')}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[680px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate('my-trips')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> My Trips
        </button>

        <div className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <h1 className="text-[28px] font-bold text-ink mb-1">Post Your Trip</h1>
          <p className="text-[14px] text-ink-secondary mb-8">Share your luggage capacity and start earning from your travel.</p>

          <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-6 flex flex-col gap-5">
            {/* Route */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5">From</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <select
                    value={form.from}
                    onChange={e => set('from', e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-white pl-8 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                  >
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {errors.from && <p className="text-[11px] text-danger mt-1">{errors.from}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5">To</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <select
                    value={form.to}
                    onChange={e => set('to', e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-white pl-8 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                  >
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {errors.to && <p className="text-[11px] text-danger mt-1">{errors.to}</p>}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Travel Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={e => set('departureDate', e.target.value)}
                  className="w-full rounded-[10px] border border-border bg-white pl-8 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {errors.departureDate && <p className="text-[11px] text-danger mt-1">{errors.departureDate}</p>}
            </div>

            {/* Capacity & Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5">Available Capacity (kg)</label>
                <div className="relative">
                  <Weight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input
                    type="number"
                    min={1} max={50} step={0.5}
                    value={form.capacityKg}
                    onChange={e => set('capacityKg', e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full rounded-[10px] border border-border bg-white pl-8 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                {errors.capacityKg && <p className="text-[11px] text-danger mt-1">{errors.capacityKg}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5">Carrying Fee (৳/kg)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted pointer-events-none">৳</span>
                  <input
                    type="number"
                    min={50}
                    value={form.feePerKg}
                    onChange={e => set('feePerKg', e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full rounded-[10px] border border-border bg-white pl-7 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                {errors.feePerKg && <p className="text-[11px] text-danger mt-1">{errors.feePerKg}</p>}
              </div>
            </div>

            {/* Fee preview */}
            {form.capacityKg && form.feePerKg && (
              <div className="rounded-[10px] bg-primary-light border border-primary/15 px-4 py-3 text-[12px] text-ink-secondary">
                At ৳{form.feePerKg}/kg for {form.capacityKg} kg →{' '}
                <strong className="text-ink">up to ৳{Math.round(Number(form.feePerKg) * Number(form.capacityKg)).toLocaleString()} per trip</strong>
              </div>
            )}

            {/* Allowed categories */}
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">Allowed Item Categories</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium border transition-all ${
                      form.allowedCategories.includes(cat)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-ink-secondary border-border hover:border-primary/40'
                    }`}
                  >
                    {form.allowedCategories.includes(cat) && '✓ '}{cat}
                  </button>
                ))}
              </div>
              {errors.allowedCategories && <p className="text-[11px] text-danger mt-1">{errors.allowedCategories}</p>}
            </div>

            {/* Pickup */}
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Pickup Preferences</label>
              <input
                type="text"
                value={form.pickupPreferences}
                onChange={e => set('pickupPreferences', e.target.value)}
                placeholder="e.g. Gulshan-2 or Banani area, on the day of travel"
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={2}
                placeholder="Any notes for senders about your trip…"
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="coral"
              size="lg"
              className="flex-1"
              trailingIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? 'Publishing…' : 'Publish Trip'}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleSaveDraft} disabled={loading}>
              Save Draft
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
