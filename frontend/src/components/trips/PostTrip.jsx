import { useState } from 'react'
import {
  Plane, CheckCircle2, ArrowRight, ChevronLeft, Loader2,
  MapPin, Calendar, Weight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useToast } from '../../lib/toast'
import { createTrip } from '../../services/tripService'
import { CITIES, CITY_COUNTRY } from '../../data/tripStatus'

// NOTE: real traveler-verification gating deliberately NOT enforced here.
// createTrip on the backend (copied from feature/profile-trip-management)
// has no verificationStatus check — any logged-in traveler can post a
// trip right now. This was a deliberate scope decision (Option B), not an
// oversight: the real verification/admin approve flow is a separate,
// deferred piece of work. See INDEX.md.

const ALL_CATEGORIES = ['Documents', 'Clothing', 'Small Electronics', 'Gifts', 'Books', 'Food items', 'Cosmetics', 'Toys']

function SuccessView({ trip, onViewTrips, onDashboard }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] text-center animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-success-light animate-[bb-pulse-ring_1.2s_ease_both]" />
          <div className="absolute inset-2 rounded-full bg-success flex items-center justify-center">
            <CheckCircle2 size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-ink mb-2">Trip published!</h1>
        <p className="text-[15px] text-ink-secondary mb-6">
          Your <strong>{trip.departureCity} → {trip.destinationCity}</strong> trip is now visible to Senders.
        </p>

        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center shrink-0">
              <Plane size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-[17px] font-bold text-ink">{trip.departureCity} → {trip.destinationCity}</p>
              <p className="text-[12px] text-ink-muted">{new Date(trip.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Capacity', value: `${trip.luggageCapacityKg} kg` },
              { label: 'Fee', value: `৳${trip.pricePerKg}/kg` },
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
          <Button variant="primary" size="lg" className="w-full" trailingIcon={<ArrowRight size={15} />} onClick={onViewTrips}>
            View My Trips
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
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    from: 'Dhaka',
    to: 'London',
    departureDate: '',
    capacityKg: '',
    feePerKg: '',
    allowedCategories: ['Documents', 'Clothing'],
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function toggleCategory(cat) {
    setForm(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(cat)
        ? prev.allowedCategories.filter(c => c !== cat)
        : [...prev.allowedCategories, cat],
    }))
  }

  function validate() {
    const e = {}
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
    try {
      const data = await createTrip({
        departureCity: form.from,
        departureCountry: CITY_COUNTRY[form.from],
        destinationCity: form.to,
        destinationCountry: CITY_COUNTRY[form.to],
        travelDate: form.departureDate,
        luggageCapacityKg: parseFloat(form.capacityKg),
        pricePerKg: parseFloat(form.feePerKg),
        allowedCategories: form.allowedCategories,
        status: 'published',
      })
      toast({ tone: 'success', title: '✈️ Trip published!', message: `${form.from} → ${form.to} is now visible to senders.` })
      setSuccess(data.trip)
    } catch (error) {
      const message = error.response?.data?.message || 'Could not publish your trip. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft() {
    if (!form.from || !form.to || !form.departureDate) {
      toast({ tone: 'error', title: 'Missing details', message: 'Route and travel date are required, even for a draft.' })
      return
    }
    setLoading(true)
    try {
      await createTrip({
        departureCity: form.from,
        departureCountry: CITY_COUNTRY[form.from],
        destinationCity: form.to,
        destinationCountry: CITY_COUNTRY[form.to],
        travelDate: form.departureDate,
        luggageCapacityKg: parseFloat(form.capacityKg) || 1,
        pricePerKg: parseFloat(form.feePerKg) || 50,
        allowedCategories: form.allowedCategories,
        status: 'draft',
      })
      toast({ tone: 'info', title: 'Draft saved', message: 'You can resume this later from My Trips.' })
      navigate('/trips/my')
    } catch (error) {
      const message = error.response?.data?.message || 'Could not save your draft. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <AuthNavbar />
        <SuccessView
          trip={success}
          onViewTrips={() => navigate('/trips/my')}
          onDashboard={() => navigate('/traveler-dashboard')}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[680px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate('/trips/my')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> My Trips
        </button>

        <div className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <h1 className="text-[28px] font-bold text-ink mb-1">Post Your Trip</h1>
          <p className="text-[14px] text-ink-secondary mb-8">Share your luggage capacity and start earning from your travel.</p>

          <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-6 flex flex-col gap-5">
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

            {form.capacityKg && form.feePerKg && (
              <div className="rounded-[10px] bg-primary-light border border-primary/15 px-4 py-3 text-[12px] text-ink-secondary">
                At ৳{form.feePerKg}/kg for {form.capacityKg} kg →{' '}
                <strong className="text-ink">up to ৳{Math.round(Number(form.feePerKg) * Number(form.capacityKg)).toLocaleString()} per trip</strong>
              </div>
            )}

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
          </div>

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