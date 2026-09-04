import { useState } from 'react'
import {
  Package, ShoppingBag, CheckCircle2, ChevronLeft,
  AlertTriangle, ArrowRight, User, Globe, Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { FormField } from '../auth/FormField'
import { useToast } from '../../lib/toast'
import { checkRestrictedItem } from '../../data/prototype'
import { createOrder } from '../../services/orderService'

// NOTE on mapping vs. the Figma source: the prototype used 'carry-only' /
// 'shopping-request' as its type keys. The real Order.js schema (already on
// main) uses 'parcel' / 'shopping'. Mapped at submit time, see handleSubmit.
//
// NOTE on destination: the Figma source only ever collected a single
// freeform "pickup address" string and never collected a destination at
// all — it assumed a traveler+trip had already been picked via Trip
// Search (Feature 6), which doesn't exist yet, so there was nothing to
// infer a destination from. Since Order.js requires structured
// pickup{city,country} AND destination{city,country}, both are collected
// as real fields below — a necessary, deliberate addition beyond the
// Figma design, not an oversight.

/* ---- Step 1: Order type ---- */
function OrderTypeStep({ onNext, current }) {
  const [selected, setSelected] = useState(
    current === 'carry-only' ? 'carry-only' : current === 'shopping-request' ? 'shopping-request' : null
  )

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Create a delivery</h2>
      <p className="text-[14px] text-ink-secondary mb-6">What would you like to do?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            key: 'carry-only',
            icon: <Package size={28} />,
            iconBg: 'bg-primary-light text-primary',
            title: 'Carry Only',
            sub: 'Send a parcel with a traveler.',
            features: ['You prepare the parcel', 'Traveler carries it to the destination', 'Receiver collects and confirms delivery'],
          },
          {
            key: 'shopping-request',
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
const RESTRICTED_SAMPLE = 'alcohol'

function CarryOnlyForm({ draft, onUpdate, onNext }) {
  const [itemError, setItemError] = useState('')
  const [itemOk, setItemOk] = useState(false)
  const [errors, setErrors] = useState({})

  function handleItemChange(val) {
    onUpdate('itemDescription', val)
    setItemError('')
    setItemOk(false)
    if (val.length > 3) {
      // Client-side advisory only — the real backend also runs its own
      // server-side restricted-keyword check on submit (orderController.js),
      // so this can't be bypassed just by skipping this warning.
      const err = checkRestrictedItem(val)
      if (err) setItemError(err)
      else if (val.length > 5) setItemOk(true)
    }
  }

  function validate() {
    const e = {}
    if (!draft.itemDescription) e.item = 'Please describe the item.'
    if (itemError) e.item = itemError
    if (!draft.weightKg || +draft.weightKg <= 0) e.weight = 'Enter a valid weight.'
    if (!draft.pickupCity) e.pickupCity = 'Pickup city is required.'
    if (!draft.pickupCountry) e.pickupCountry = 'Pickup country is required.'
    if (!draft.destinationCity) e.destinationCity = 'Destination city is required.'
    if (!draft.destinationCountry) e.destinationCountry = 'Destination country is required.'
    if (!draft.receiverName) e.receiver = 'Receiver name is required.'
    if (!draft.receiverPhone) e.receiverPhone = 'Receiver phone is required.'
    if (!draft.receiverAddress) e.receiverAddress = 'Receiver address is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Send a parcel</h2>
      <p className="text-[14px] text-ink-secondary mb-6">Tell us about what you need to send.</p>

      <div className="flex flex-col gap-4">
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
            Not sure? Try: "{RESTRICTED_SAMPLE}" to see a restricted item warning.
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Pickup city"
            type="text"
            placeholder="Dhaka"
            value={String(draft.pickupCity ?? '')}
            onChange={e => onUpdate('pickupCity', e.target.value)}
            error={errors.pickupCity}
          />
          <FormField
            label="Pickup country"
            type="text"
            placeholder="Bangladesh"
            value={String(draft.pickupCountry ?? '')}
            onChange={e => onUpdate('pickupCountry', e.target.value)}
            error={errors.pickupCountry}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Destination city"
            type="text"
            placeholder="London"
            value={String(draft.destinationCity ?? '')}
            onChange={e => onUpdate('destinationCity', e.target.value)}
            error={errors.destinationCity}
          />
          <FormField
            label="Destination country"
            type="text"
            placeholder="United Kingdom"
            value={String(draft.destinationCountry ?? '')}
            onChange={e => onUpdate('destinationCountry', e.target.value)}
            error={errors.destinationCountry}
          />
        </div>

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
          label="Receiver address"
          type="text"
          placeholder="10 Baker Street, London"
          value={String(draft.receiverAddress ?? '')}
          onChange={e => onUpdate('receiverAddress', e.target.value)}
          error={errors.receiverAddress}
        />

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
            <strong className="text-ink">Some items cannot be carried through BringBuddy.</strong>
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
function ShoppingRequestForm({ draft, onUpdate, onNext }) {
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!draft.productUrl) e.productUrl = 'Product URL is required.'
    if (!draft.quantity || +draft.quantity < 1) e.quantity = 'Quantity must be at least 1.'
    if (!draft.budget || +draft.budget <= 0) e.budget = 'Please enter a budget.'
    if (!draft.pickupCity) e.pickupCity = 'Pickup city is required.'
    if (!draft.pickupCountry) e.pickupCountry = 'Pickup country is required.'
    if (!draft.destinationCity) e.destinationCity = 'Destination city is required.'
    if (!draft.destinationCountry) e.destinationCountry = 'Destination country is required.'
    if (!draft.receiverName) e.receiver = 'Receiver name is required.'
    if (!draft.receiverPhone) e.receiverPhone = 'Receiver phone is required.'
    if (!draft.receiverAddress) e.receiverAddress = 'Receiver address is required.'
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Pickup city"
            type="text"
            placeholder="London"
            value={String(draft.pickupCity ?? '')}
            onChange={e => onUpdate('pickupCity', e.target.value)}
            error={errors.pickupCity}
            hint="Where the traveler will buy it"
          />
          <FormField
            label="Pickup country"
            type="text"
            placeholder="United Kingdom"
            value={String(draft.pickupCountry ?? '')}
            onChange={e => onUpdate('pickupCountry', e.target.value)}
            error={errors.pickupCountry}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Destination city"
            type="text"
            placeholder="Dhaka"
            value={String(draft.destinationCity ?? '')}
            onChange={e => onUpdate('destinationCity', e.target.value)}
            error={errors.destinationCity}
          />
          <FormField
            label="Destination country"
            type="text"
            placeholder="Bangladesh"
            value={String(draft.destinationCountry ?? '')}
            onChange={e => onUpdate('destinationCountry', e.target.value)}
            error={errors.destinationCountry}
          />
        </div>

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
            placeholder="+880 1700 000000"
            value={String(draft.receiverPhone ?? '')}
            onChange={e => onUpdate('receiverPhone', e.target.value)}
            error={errors.receiverPhone}
          />
        </div>

        <FormField
          label="Receiver address"
          type="text"
          placeholder="Gulshan-2, Dhaka"
          value={String(draft.receiverAddress ?? '')}
          onChange={e => onUpdate('receiverAddress', e.target.value)}
          error={errors.receiverAddress}
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

/* ---- Step 3: Publish ---- */
function BookingMethodStep({ onSelect, isSubmitting }) {
  return (
    <div>
      <h2 className="text-[24px] font-bold text-ink mb-1.5">Post your delivery</h2>
      <p className="text-[14px] text-ink-secondary mb-6">
        Your delivery will be listed in the marketplace so matching travelers can apply.
      </p>

      <div className="rounded-[16px] border-2 border-primary/20 bg-primary-light p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center shrink-0">
            <Globe size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink">Marketplace listing</p>
            <p className="text-[13px] text-ink-secondary mt-1">
              Travelers can find this delivery and send you applications with their trip and proposed fee.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-white px-4 py-3 mb-6">
        <p className="text-[12px] text-ink-secondary">
          <strong className="text-ink">You are not limited to waiting.</strong>{' '}
          After posting, open Booking Center and use <strong className="text-ink">Find Traveler</strong>{' '}
          to approach a matching verified traveler for this same order.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
        trailingIcon={
          isSubmitting
            ? <Loader2 size={16} className="animate-spin" />
            : <ArrowRight size={16} />
        }
        onClick={onSelect}
      >
        {isSubmitting ? 'Posting delivery…' : 'Post Delivery'}
      </Button>
    </div>
  )
}

/* ---- Progress indicator ---- */
const STEPS_LABELS = ['Order Type', 'Details', 'Publish']

function StepIndicator({ step }) {
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
  const navigate = useNavigate()
  const { toast } = useToast()
  const [orderType, setOrderType] = useState(null)
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    itemDescription: '',
    weightKg: '',
    itemValue: '',
    pickupCity: '',
    pickupCountry: '',
    destinationCity: '',
    destinationCountry: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    specialInstructions: '',
    productUrl: '',
    quantity: '',
    budget: '',
    instructions: '',
  })

  function update(k, v) {
    setFormData(p => ({ ...p, [k]: v }))
  }

  function handleTypeSelect(t) {
    setOrderType(t)
    setStep(1)
  }

  function handleDetailsNext() {
    setStep(2)
  }

  async function handleBookingSelect() {
    setIsSubmitting(true)
    try {
      const payload = {
        orderType: orderType === 'carry-only' ? 'parcel' : 'shopping',
        bookingMethod: 'public',
        isPublic: true,
        pickup: { city: formData.pickupCity, country: formData.pickupCountry },
        destination: { city: formData.destinationCity, country: formData.destinationCountry },
        receiver: {
          name: formData.receiverName,
          phone: formData.receiverPhone,
          address: formData.receiverAddress,
        },
      }

      if (orderType === 'carry-only') {
        payload.items = [{
          name: formData.itemDescription,
          description: formData.specialInstructions || formData.itemDescription,
          weightKg: +formData.weightKg,
        }]
        payload.totalWeightKg = +formData.weightKg
      } else {
        payload.shoppingDetails = {
          productLink: formData.productUrl,
          quantity: +formData.quantity,
          budget: +formData.budget,
          specialInstructions: formData.instructions,
        }
      }

      await createOrder(payload)

      toast({
        tone: 'success',
        title: 'Delivery posted!',
        message: 'Travelers can apply in the marketplace, or you can find a traveler yourself.',
      })

      navigate('/booking-center')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Could not create the order. Please try again.'

      toast({
        tone: 'error',
        title: 'Something went wrong',
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[600px] mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> {step === 0 ? 'Back to Dashboard' : 'Back'}
        </button>

        <StepIndicator step={step} />

        <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]" key={step}>
          {step === 0 && <OrderTypeStep current={orderType} onNext={handleTypeSelect} />}
          {step === 1 && orderType === 'carry-only' && (
            <CarryOnlyForm draft={formData} onUpdate={update} onNext={handleDetailsNext} />
          )}
          {step === 1 && orderType === 'shopping-request' && (
            <ShoppingRequestForm draft={formData} onUpdate={update} onNext={handleDetailsNext} />
          )}
          {step === 2 && (
            <BookingMethodStep onSelect={handleBookingSelect} isSubmitting={isSubmitting} />
          )}
        </div>
      </main>
    </div>
  )
}
