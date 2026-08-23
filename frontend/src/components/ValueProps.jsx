import { Check, MapPin, Plane, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui'

const senderBenefits = [
  'Find travelers already flying your route',
  'Verified profiles and reputation scores',
  'Secure escrow payment',
  'Live delivery tracking',
]

const travelerBenefits = [
  'Publish your trip in minutes',
  'Choose your available capacity',
  'Accept delivery requests you like',
  'Build reputation and earn more',
]

function BenefitList({ items, accent }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] text-ink-secondary">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              accent === 'primary' ? 'bg-primary-light text-primary' : 'bg-coral-light text-coral'
            }`}
          >
            <Check size={13} strokeWidth={2.6} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function ValueProps() {
  const navigate = useNavigate()
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sender */}
        <div className="bb-reveal group relative overflow-hidden rounded-[16px] border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-e2)]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-light opacity-60 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[var(--shadow-e1)]">
              <MapPin size={22} />
            </span>
            <h3 className="mt-5 text-[24px] font-bold text-ink">Send something</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
              Send internationally without traditional courier prices.
            </p>
            <BenefitList items={senderBenefits} accent="primary" />
            <Button variant="primary" className="mt-7" leadingIcon={<MapPin size={16} />} onClick={() => navigate('/register')}>
              Find a Traveler
            </Button>
          </div>
        </div>

        {/* Traveler */}
        <div className="bb-reveal bb-delay-1 group relative overflow-hidden rounded-[16px] border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-e2)]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-coral-light opacity-70 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-coral text-white shadow-[var(--shadow-e1)]">
              <Plane size={22} />
            </span>
            <h3 className="mt-5 text-[24px] font-bold text-ink">Earn while you travel</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
              Turn unused luggage capacity into extra income.
            </p>
            <BenefitList items={travelerBenefits} accent="coral" />
            <Button variant="coral" className="mt-7" leadingIcon={<Plane size={16} />} onClick={() => navigate('/register')}>
              Post Your Trip
            </Button>
          </div>
        </div>
      </div>

      {/* same-account note */}
      <div className="bb-reveal mt-6 flex items-center justify-center gap-2 rounded-[12px] border border-dashed border-border bg-white/60 px-4 py-3 text-center text-[14px] text-ink-secondary">
        <RefreshCw size={16} className="text-primary" />
        One BringBuddy account does both — switch between{' '}
        <span className="font-semibold text-primary">Sender</span> and{' '}
        <span className="font-semibold text-coral">Traveler</span> mode anytime.
      </div>
    </section>
  )
}
