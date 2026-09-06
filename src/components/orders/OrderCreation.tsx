import { useState, type FormEvent } from 'react'
import {
  Package, ShoppingBag, CheckCircle2, ChevronLeft,
  AlertTriangle, ArrowRight, User, Globe, Loader2,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { FormField } from '../auth/FormField'
import { useRouter } from '../../lib/router'
import { getTravelerById, getTripById, checkRestrictedItem, calcFees } from '../../data/prototype'

type OrderStep = 'type' | 'details' | 'booking'

/* ---- Step 1: Order type ---- */
function OrderTypeStep({ onNext, current }: { onNext: (t: 'carry-only' | 'shopping-request') => void; current?: string }) {
  const [selected, setSelected] = useState<'carry-only' | 'shopping-request' | null>(
    current === 'carry-only' ? 'carry-only' : current === 'shopping-request' ? 'shopping-request' : null
  )

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Create a delivery</h2>
      <p className="text-[14px] text-ink-secondary mb-6">What would you like to do?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            key: 'carry-only' as const,
            icon: <Package size={28} />,
            iconBg: 'bg-primary-light text-primary',
            title: 'Carry Only',
            sub: 'Send a parcel with a traveler.',
            features: ['You prepare the parcel', 'Traveler carries it to the destination', 'Receiver collects and confirms delivery'],
          },
          {
            key: 'shopping-request' as const,
            icon: <ShoppingBag size={28} />,
            iconBg: 'bg-coral-light text-coral',
            title: 'Shopping Request',
            sub: 'Ask a traveler to buy something abroad.',
            features: ['Traveler purchases the item abroad', 'Brings it back to you', 'Pay item cost + carrying fee'],
          },
        ].map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => setSelected(card.key)}
            aria-pressed={selected === card.key}
            className={`text-left rounded-[16px] border-2 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-e2)] focus-visible:outline-2 focus-visible:outline-primary ${
              selected === card.key ? 'border-primary shadow-[var(--shadow-e2)] -translate-y-0.5' : 'border-border'
            }`}
          >
            <div className={`w-12 h-12 rounded-[12px] ${card.iconBg} flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-[17px] font-bold text-ink">{card.title}</h3>
                <p className="text-[13px] text-ink-secondary mt-0.5">{card.sub}</p>
              </div>
              {selected === card.key && <CheckCircle2 size={18} className="text-primary shrink-0" />}
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {card.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-[12px] text-ink-secondary">
                  <CheckCircle2 size={11} className="text-success shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!selected}
        trailingIcon={<ArrowRight size={16} />}
        onClick={() => selected && onNext(selected)}
      >
        Continue
      </Button>
    </div>
  )
}

/* ---- Step 2a: Carry Only details ---- */
const RESTRICTED_SAMPLES = ['weapon', 'drugs', 'cash', 'alcohol', 'explosive']

function CarryOnlyForm({ draft, onUpdate, onNext }: {
  draft: Record<string, string | number>
  onUpdate: (k: string, v: string | number) => void
  onNext: () => void
}) {
  const [itemError, setItemError] = useState('')
  const [itemOk, setItemOk] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleItemChange(val: string) {
    onUpdate('itemDescription', val)
    setItemError('')
    setItemOk(false)
    if (val.length > 3) {
      const err = checkRestrictedItem(val)
      if (err) setItemError(err)
      else if (val.length > 5) setItemOk(true)
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!draft.itemDescription) e.item = 'Please describe the item.'
    if (itemError) e.item = itemError
    if (!draft.weightKg || +draft.weightKg <= 0) e.weight = 'Enter a valid weight.'
    if (!draft.pickupAddress) e.pickup = 'Pickup address is required.'
    if (!draft.receiverName) e.receiver = 'Receiver name is required.'
    if (!draft.receiverPhone) e.receiverPhone = 'Receiver phone is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Send a parcel</h2>
      <p className="text-[14px] text-ink-secondary mb-6">Tell us about what you need to send.</p>

      <div className="flex flex-col gap-4">
        {/* Item description */}
        <div>
          <FormField
            label="Item description"
            type="text"
            placeholder="e.g. Traditional clothing and small gifts"
            value={String(draft.itemDescription ?? '')}
            onChange={e => handleItemChange(e.target.value)}
            error={errors.item || itemError}
            success={itemOk && !itemError ? '✓ Item appears eligible' : undefined}
          />
          {itemOk && !itemError && (
            <p className="text-[12px] text-success mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} /> Item appears eligible to be carried through BringBuddy.
            </p>
          )}
          {itemError && (
            <div className="mt-2 rounded-[10px] bg-danger-light border border-danger/20 px-3.5 py-3 flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-danger">{itemError}</p>
                <p className="text-[12px] text-ink-secondary mt-0.5">This item can't be carried through BringBuddy.</p>
                <button
                  type="button"
                  onClick={() => { onUpdate('itemDescription', ''); setItemError(''); setItemOk(false) }}
                  className="mt-1.5 text-[12px] text-primary font-medium hover:underline"
                >
                  Change item
                </button>
              </div>
            </div>
          )}
          <p className="text-[11px] text-ink-muted mt-1.5">
            Not sure? Try: "{RESTRICTED_SAMPLES[0]}" to see a restricted item warning.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Weight (kg)"
            type="number"
            placeholder="2.5"
            min="0.1"
            max="25"
            step="0.1"
            value={String(draft.weightKg ?? '')}
            onChange={e => onUpdate('weightKg', e.target.value)}
            error={errors.weight}
            hint="Max 25 kg per order"
          />
          <FormField
            label="Estimated value (৳)"
            type="number"
            placeholder="5000"
            value={String(draft.itemValue ?? '')}
            onChange={e => onUpdate('itemValue', e.target.value)}
            hint="For customs purposes"
          />
        </div>

        <FormField
          label="Pickup address"
          type="text"
          placeholder="Gulshan-2, Dhaka"
          value={String(draft.pickupAddress ?? '')}
          onChange={e => onUpdate('pickupAddress', e.target.value)}
          error={errors.pickup}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Receiver name"
            type="text"
            placeholder="Sadia Islam"
            value={String(draft.receiverName ?? '')}
            onChange={e => onUpdate('receiverName', e.target.value)}
            error={errors.receiver}
          />
          <FormField
            label="Receiver phone"
            type="tel"
            placeholder="+44 7912 345678"
            value={String(draft.receiverPhone ?? '')}
            onChange={e => onUpdate('receiverPhone', e.target.value)}
            error={errors.receiverPhone}
          />
        </div>

        <FormField
          label="Special instructions (optional)"
          type="text"
          placeholder="Handle with care. Fragile items inside."
          value={String(draft.specialInstructions ?? '')}
          onChange={e => onUpdate('specialInstructions', e.target.value)}
        />

        <div className="rounded-[12px] bg-warning-light border border-warning/20 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
          <p className="text-[12px] text-ink-secondary">
            <strong className="text-ink">Some items cannot be carried through BringBuddy.</strong>{' '}
            <button className="text-primary font-medium hover:underline">View restricted items</button>
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-1"
          trailingIcon={<ArrowRight size={16} />}
          disabled={!!itemError}
          onClick={() => validate() && onNext()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

/* ---- Step 2b: Shopping Request ---- */
function ShoppingRequestForm({ draft, onUpdate, onNext }: {
  draft: Record<string, string | number>
  onUpdate: (k: string, v: string | number) => void
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!draft.productUrl) e.productUrl = 'Product URL is required.'
    if (!draft.quantity || +draft.quantity < 1) e.quantity = 'Quantity must be at least 1.'
    if (!draft.budget || +draft.budget <= 0) e.budget = 'Please enter a budget.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Shopping Request</h2>
      <p className="text-[14px] text-ink-secondary mb-2">Ask a traveler to purchase an item abroad and bring it to you.</p>

      <div className="rounded-[12px] bg-primary-light border border-primary/15 px-4 py-3 mb-5 text-[13px] text-ink-secondary">
        <strong className="text-ink">How it works:</strong> The traveler purchases the item abroad and brings it back. You pay the item cost plus a carrying fee — all held in escrow until delivery.
      </div>

      <div className="flex flex-col gap-4">
        <FormField
          label="Product URL"
          type="url"
          placeholder="https://www.example.com/product/..."
          value={String(draft.productUrl ?? '')}
          onChange={e => onUpdate('productUrl', e.target.value)}
          error={errors.productUrl}
          hint="Paste the link to the exact product you want"
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Quantity"
            type="number"
            placeholder="1"
            min="1"
            value={String(draft.quantity ?? '')}
            onChange={e => onUpdate('quantity', e.target.value)}
            error={errors.quantity}
          />
          <FormField
            label="Budget (৳)"
            type="number"
            placeholder="12000"
            value={String(draft.budget ?? '')}
            onChange={e => onUpdate('budget', e.target.value)}
            error={errors.budget}
            hint="Max you're willing to pay for the item"
          />
        </div>
        <FormField
          label="Instructions"
          type="text"
          placeholder="Please purchase the black version, size M."
          value={String(draft.instructions ?? '')}
          onChange={e => onUpdate('instructions', e.target.value)}
        />

        <Button
          variant="coral"
          size="lg"
          className="w-full mt-1"
          trailingIcon={<ArrowRight size={16} />}
          onClick={() => validate() && onNext()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

/* ---- Step 3: Booking method ---- */
function BookingMethodStep({ selectedTravelerId, selectedTripId, onSelect }: {
  selectedTravelerId?: string
  selectedTripId?: string
  onSelect: (m: 'direct' | 'marketplace') => void
}) {
  const [selected, setSelected] = useState<'direct' | 'marketplace' | null>(null)
  const traveler = selectedTravelerId ? getTravelerById(selectedTravelerId) : null
  const trip = selectedTripId ? getTripById(selectedTripId) : null

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">How do you want to find a traveler?</h2>
      <p className="text-[14px] text-ink-secondary mb-6">Choose between a direct request or a public marketplace post.</p>

      <div className="flex flex-col gap-4 mb-6">
        {/* Direct request */}
        <button
          type="button"
          onClick={() => setSelected('direct')}
          aria-pressed={selected === 'direct'}
          className={`text-left rounded-[16px] border-2 p-5 transition-all duration-200 ${selected === 'direct' ? 'border-primary shadow-[var(--shadow-e2)]' : 'border-border hover:border-primary/30'}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center shrink-0">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-ink">Direct Request</p>
                <p className="text-[13px] text-ink-secondary">Send this request directly to the traveler you selected.</p>
              </div>
            </div>
            {selected === 'direct' && <CheckCircle2 size={18} className="text-primary shrink-0" />}
          </div>
          {traveler && trip && (
            <div className="ml-13 flex items-center gap-3 bg-divider rounded-[10px] px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                {traveler.initials}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-ink">{traveler.name}</p>
                <p className="text-[11px] text-ink-muted">{trip.fromCity} → {trip.toCity} · {trip.date}</p>
              </div>
              {traveler.verified && <CheckCircle2 size={13} className="text-success ml-auto" />}
            </div>
          )}
        </button>

        {/* Public marketplace */}
        <button
          type="button"
          onClick={() => setSelected('marketplace')}
          aria-pressed={selected === 'marketplace'}
          className={`text-left rounded-[16px] border-2 p-5 transition-all duration-200 ${selected === 'marketplace' ? 'border-primary shadow-[var(--shadow-e2)]' : 'border-border hover:border-primary/30'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-coral-light flex items-center justify-center shrink-0">
                <Globe size={18} className="text-coral" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-ink">Public Marketplace</p>
                <p className="text-[13px] text-ink-secondary">Post your request publicly so eligible travelers can apply.</p>
                <p className="text-[12px] text-ink-muted mt-1.5">
                  Your request will be visible to travelers going this route. You can review applicants and choose the best match.
                </p>
              </div>
            </div>
            {selected === 'marketplace' && <CheckCircle2 size={18} className="text-primary shrink-0" />}
          </div>
        </button>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!selected}
        trailingIcon={<ArrowRight size={16} />}
        onClick={() => selected && onSelect(selected)}
      >
        Continue
      </Button>
    </div>
  )
}

/* ---- Progress indicator ---- */
const STEPS_LABELS = ['Order Type', 'Details', 'Booking Method']

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS_LABELS.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                done ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-border text-ink-muted'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium mt-1 whitespace-nowrap ${active ? 'text-primary' : done ? 'text-success' : 'text-ink-muted'}`}>
                {label}
              </span>
            </div>
            {i < STEPS_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-3.5 ${done ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ---- Main OrderCreation ---- */
export function OrderCreation() {
  const { navigate, orderDraft, setOrderDraft } = useRouter()
  const [step, setStep] = useState<number>(
    orderDraft.type ? 1 : 0
  )
  const [formData, setFormData] = useState<Record<string, string | number>>({
    itemDescription: String(orderDraft.itemDescription ?? ''),
    weightKg: orderDraft.weightKg ?? '',
    pickupAddress: String(orderDraft.pickupAddress ?? ''),
    receiverName: String(orderDraft.receiverName ?? ''),
    receiverPhone: '',
    specialInstructions: '',
    productUrl: '',
    quantity: '',
    budget: '',
    instructions: '',
  } as any)

  function update(k: string, v: string | number) {
    setFormData(p => ({ ...p, [k]: v }))
  }

  function handleTypeSelect(t: 'carry-only' | 'shopping-request') {
    setOrderDraft(p => ({ ...p, type: t }))
    setStep(1)
  }

  function handleDetailsNext() {
    setOrderDraft(p => ({
      ...p,
      itemDescription: String(formData.itemDescription),
      weightKg: +formData.weightKg,
      pickupAddress: String(formData.pickupAddress),
      receiverName: String(formData.receiverName),
      receiverPhone: String(formData.receiverPhone),
      specialInstructions: String(formData.specialInstructions),
      productUrl: String(formData.productUrl),
      quantity: +formData.quantity,
      budget: +formData.budget,
    }))
    setStep(2)
  }

  function handleBookingSelect(m: 'direct' | 'marketplace') {
    setOrderDraft(p => ({ ...p, bookingMethod: m }))
    if (m === 'marketplace') {
      navigate('marketplace-post')
    } else {
      navigate('order-review')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[600px] mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> {step === 0 ? 'Back to Dashboard' : 'Back'}
        </button>

        <StepIndicator step={step} />

        <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]" key={step}>
          {step === 0 && <OrderTypeStep current={orderDraft.type} onNext={handleTypeSelect} />}
          {step === 1 && orderDraft.type === 'carry-only' && (
            <CarryOnlyForm draft={formData} onUpdate={update} onNext={handleDetailsNext} />
          )}
          {step === 1 && orderDraft.type === 'shopping-request' && (
            <ShoppingRequestForm draft={formData} onUpdate={update} onNext={handleDetailsNext} />
          )}
          {step === 2 && (
            <BookingMethodStep
              selectedTravelerId={orderDraft.selectedTravelerId}
              selectedTripId={orderDraft.selectedTripId}
              onSelect={handleBookingSelect}
            />
          )}
        </div>
      </main>
    </div>
  )
}
