import { BadgeCheck, ShieldCheck, Radar, KeyRound } from 'lucide-react'

const items = [
  { icon: BadgeCheck, title: 'Verified Travelers', desc: 'ID & phone checked by admin' },
  { icon: ShieldCheck, title: 'Secure Escrow', desc: 'Payment held until delivery' },
  { icon: Radar, title: 'Live Tracking', desc: 'Follow every stage' },
  { icon: KeyRound, title: 'OTP Confirmation', desc: 'Receiver confirms delivery' },
]

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 lg:px-10">
      <div className="bb-reveal grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-border bg-border shadow-[var(--shadow-e1)] lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group flex items-center gap-3 bg-white px-5 py-5 transition-colors hover:bg-primary-light/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary-light text-primary transition-transform duration-300 group-hover:scale-105">
              <Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-ink">{title}</div>
              <div className="text-[13px] text-ink-muted">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
