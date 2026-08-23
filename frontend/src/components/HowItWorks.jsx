import { Search, PackagePlus, ShieldCheck, Radar, KeyRound, UserCheck, MapPinned, Handshake, Plane, Wallet } from 'lucide-react'
import { SectionHeader } from './ui'

const senderSteps = [
  { icon: Search, title: 'Find a Traveler', desc: 'Search routes and dates that match your delivery.' },
  { icon: PackagePlus, title: 'Create Your Delivery', desc: 'Send a parcel or request a shopping purchase abroad.' },
  { icon: ShieldCheck, title: 'Book & Pay Securely', desc: 'Your payment is held safely in escrow.' },
  { icon: Radar, title: 'Track Your Parcel', desc: 'Follow every stage on the live timeline.' },
  { icon: KeyRound, title: 'Confirm Delivery', desc: 'Receiver confirms with a one-time password.' },
]

const travelerSteps = [
  { icon: UserCheck, title: 'Verify Yourself', desc: 'Submit ID and phone to earn your verified badge.' },
  { icon: MapPinned, title: 'Post Your Trip', desc: 'Share your route, date and spare luggage capacity.' },
  { icon: Handshake, title: 'Accept a Delivery', desc: 'Approve a direct request or a marketplace application.' },
  { icon: Plane, title: 'Carry the Parcel', desc: 'Pick up, travel, and keep the timeline updated.' },
  { icon: Wallet, title: 'Get Paid', desc: 'Escrow releases to you after OTP confirmation.' },
]

function Track({ role, accent, steps }) {
  const isPrimary = accent === 'primary'
  return (
    <div className="bb-reveal relative">
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] ${
            isPrimary ? 'bg-primary-light text-primary' : 'bg-coral-light text-coral'
          }`}
        >
          {role}
        </span>
        <span className="text-[13px] text-ink-muted">
          {isPrimary ? 'needs something delivered' : 'has spare luggage capacity'}
        </span>
      </div>

      <ol className="relative space-y-4 pl-2">
        {/* connecting route line */}
        <span
          className="absolute left-[27px] top-4 bottom-6 w-px border-l border-dashed border-border"
          aria-hidden="true"
        />
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <li key={title} className="relative flex items-start gap-4">
            <span
              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ${
                isPrimary ? 'text-primary ring-primary/25' : 'text-coral ring-coral/25'
              }`}
            >
              <Icon size={19} strokeWidth={2} />
            </span>
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-bold tabular-nums ${isPrimary ? 'text-primary' : 'text-coral'}`}>
                  0{i + 1}
                </span>
                <span className="text-[16px] font-semibold text-ink">{title}</span>
              </div>
              <p className="mt-0.5 text-[14px] leading-relaxed text-ink-secondary">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10">
      <div className="bb-reveal">
        <SectionHeader
          eyebrow="How BringBuddy works"
          title="One marketplace. Two ways to participate."
          subtitle="Senders and travelers use the same account — switch modes anytime. When a request is accepted, both sides meet in a shared Order Hub."
        />
      </div>

      <div className="relative mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Track role="Sender" accent="primary" steps={senderSteps} />
        {/* center convergence divider */}
        <span className="pointer-events-none absolute left-1/2 top-16 bottom-0 hidden -translate-x-1/2 border-l border-dashed border-border lg:block" />
        <Track role="Traveler" accent="coral" steps={travelerSteps} />
      </div>

      <div className="bb-reveal mt-12 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[14px] font-medium text-ink-secondary shadow-[var(--shadow-e1)]">
          <Handshake size={16} className="text-primary" />
          Both journeys converge in a secure <span className="font-semibold text-ink">Order Hub</span>
        </span>
      </div>
    </section>
  )
}
