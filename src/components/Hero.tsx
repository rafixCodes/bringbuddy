import { BadgeCheck, ShieldCheck, Package, Plane, MapPin, TrendingUp } from 'lucide-react'
import { Avatar, Button, Rating } from './ui'
import { useRouter } from '../lib/router'

/* ============================================================
   Hero — Sender → Parcel → Traveler → Flight → Destination
   ============================================================ */

function FloatingCard({
  className,
  animation,
  delay,
  children,
}: {
  className: string
  animation: string
  delay: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`absolute z-20 rounded-[12px] border border-border bg-white/95 p-3.5 shadow-[var(--shadow-e3)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{ animation: `${animation}, bb-fade 0.6s ease both`, animationDelay: `${delay}, ${delay}` }}
    >
      {children}
    </div>
  )
}

export function Hero() {
  const { navigate } = useRouter()
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 lg:pt-32">
      {/* soft ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-light blur-3xl" />
        <div className="absolute top-40 -left-32 h-[360px] w-[360px] rounded-full bg-coral-light blur-3xl opacity-70" />
      </div>

      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-10">
        {/* ---- Copy column ---- */}
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-ink-secondary"
            style={{ animation: 'bb-rise 0.6s var(--ease-out-soft) both' }}
          >
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 rounded-full bg-coral" style={{ animation: 'bb-pulse-ring 2s ease-out infinite' }} />
              <span className="h-2 w-2 rounded-full bg-coral" />
            </span>
            Cross-border parcel sharing, powered by real travelers
          </span>

          <h1
            className="mt-5 text-[44px] font-bold leading-[1.05] tracking-tight text-ink lg:text-[56px]"
            style={{ animation: 'bb-rise 0.7s var(--ease-out-soft) 0.05s both' }}
          >
            Carry smarter.
            <br />
            <span className="text-primary">Deliver globally.</span>
          </h1>

          <p
            className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink-secondary"
            style={{ animation: 'bb-rise 0.7s var(--ease-out-soft) 0.14s both' }}
          >
            Turn unused luggage space into extra income — or send parcels internationally through
            verified travelers already flying your route.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            style={{ animation: 'bb-rise 0.7s var(--ease-out-soft) 0.22s both' }}
          >
            <Button size="lg" variant="primary" leadingIcon={<MapPin size={18} />} onClick={() => navigate('register')}>
              Find a Traveler
            </Button>
            <Button size="lg" variant="secondary" leadingIcon={<Plane size={18} />} onClick={() => navigate('register')}>
              Earn While You Travel
            </Button>
          </div>

          <p
            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-ink-muted"
            style={{ animation: 'bb-fade 0.8s ease 0.4s both' }}
          >
            <BadgeCheck size={16} className="text-success" />
            Verified travelers
            <span className="text-border">•</span>
            Secure payments
            <span className="text-border">•</span>
            Track every delivery
          </p>
        </div>

        {/* ---- Route visual column ---- */}
        <div
          className="relative mx-auto w-full max-w-[520px]"
          style={{ animation: 'bb-rise 0.8s var(--ease-out-soft) 0.3s both' }}
        >
          <RouteVisual />

          {/* Floating product cards */}
          <FloatingCard className="-left-4 top-6 w-[228px] lg:-left-10" animation="bb-float-a 6s ease-in-out infinite" delay="0.9s">
            <div className="flex items-center gap-2.5">
              <Avatar initials="RA" verified size={40} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[14px] font-semibold text-ink">Rahim Ahmed</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success">
                  <BadgeCheck size={12} /> Verified Traveler
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-divider pt-2.5 text-[13px]">
              <span className="flex items-center gap-1 text-ink-secondary">
                <MapPin size={13} className="text-primary" /> Dhaka → London
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[13px]">
              <Rating value={4.9} />
              <span className="font-medium text-ink-secondary">8 kg available</span>
            </div>
          </FloatingCard>

          <FloatingCard className="-right-3 top-2 w-[200px] lg:-right-8" animation="bb-float-b 7s ease-in-out infinite" delay="1.05s">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-light text-success">
                <ShieldCheck size={18} />
              </span>
              <div>
                <div className="text-[14px] font-semibold text-ink">Payment Protected</div>
                <div className="text-[12px] text-ink-muted">Escrow secured</div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard className="-right-4 bottom-16 w-[214px] lg:-right-12" animation="bb-float-c 6.5s ease-in-out infinite" delay="1.2s">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-info">
              <Plane size={14} /> Parcel In Transit
            </div>
            <div className="mt-2 text-[14px] font-semibold text-ink">Dhaka → London</div>
            <div className="mt-1 flex items-center justify-between text-[12px] text-ink-muted">
              <span>Estimated arrival</span>
              <span className="font-medium text-ink-secondary">02 Sep</span>
            </div>
          </FloatingCard>

          <FloatingCard className="-left-2 bottom-4 w-[172px] lg:-left-8" animation="bb-float-a 7.5s ease-in-out infinite" delay="1.35s">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral-light text-coral">
                <TrendingUp size={18} />
              </span>
              <div>
                <div className="text-[18px] font-bold leading-none text-ink">+৳4,500</div>
                <div className="mt-1 text-[12px] text-ink-muted">Traveler earnings</div>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  )
}

/**
 * Route visualization: origin marker (Dhaka), dashed arc, destination (London),
 * and a coral plane travelling the path via CSS offset-path.
 */
function RouteVisual() {
  // Path shared by the SVG stroke and the plane's offset-path.
  const routePath = 'M60 210 C 150 60, 330 60, 420 150'

  return (
    <div className="relative aspect-square w-full rounded-[20px] border border-border bg-white p-5 shadow-[var(--shadow-e2)]">
      <div className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_30%_25%,var(--color-primary-light),transparent_60%)]" />
      <svg viewBox="0 0 480 300" className="relative h-full w-full" fill="none">
        {/* faint globe grid */}
        <g stroke="var(--color-border)" strokeWidth="1" opacity="0.55">
          <ellipse cx="240" cy="150" rx="150" ry="150" />
          <ellipse cx="240" cy="150" rx="60" ry="150" />
          <ellipse cx="240" cy="150" rx="150" ry="60" />
          <line x1="90" y1="150" x2="390" y2="150" />
        </g>

        {/* route */}
        <path
          d={routePath}
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="7 8"
          style={{ strokeDashoffset: 320, animation: 'bb-draw 2s var(--ease-out-soft) 0.6s forwards' }}
        />

        {/* origin: Dhaka */}
        <g>
          <circle cx="60" cy="210" r="14" fill="var(--color-coral)" opacity="0.15" style={{ transformOrigin: '60px 210px', animation: 'bb-pulse-ring 2.4s ease-out infinite' }} />
          <circle cx="60" cy="210" r="6" fill="var(--color-coral)" />
          <circle cx="60" cy="210" r="2.5" fill="#fff" />
        </g>
        {/* destination: London */}
        <g>
          <circle cx="420" cy="150" r="6" fill="var(--color-primary)" />
          <circle cx="420" cy="150" r="2.5" fill="#fff" />
        </g>

        {/* travelling parcel-plane — animateMotion shares the exact route path */}
        <g>
          <circle r="14" fill="var(--color-primary)" />
          {/* arrow/plane glyph, centered on origin, points along travel via rotate="auto" */}
          <path d="M6 0 -4 -5 -1.5 0 -4 5 Z" fill="#fff" />
          <animateMotion dur="6s" begin="1.2s" repeatCount="indefinite" rotate="auto" path={routePath} />
        </g>
      </svg>

      {/* city labels */}
      <span className="absolute bottom-6 left-6 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink shadow-[var(--shadow-e1)] ring-1 ring-border">
        Dhaka
      </span>
      <span className="absolute right-8 top-12 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink shadow-[var(--shadow-e1)] ring-1 ring-border">
        London
      </span>

      {/* center parcel badge */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-1.5 text-[12px] font-medium text-ink-secondary shadow-[var(--shadow-e1)] backdrop-blur">
        <Package size={14} className="text-primary" /> 1 parcel, one shared journey
      </div>
    </div>
  )
}
