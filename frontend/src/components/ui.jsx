import { BadgeCheck, Clock, CheckCircle2, Plane, XCircle, AlertTriangle, Star } from 'lucide-react'

/* ============================================================
   BringBuddy — Reusable UI Primitives
   ============================================================ */

const buttonBase =
  'inline-flex items-center justify-center gap-2 font-medium rounded-[8px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2'

const buttonVariants = {
  primary:
    'bg-primary text-white shadow-[var(--shadow-e1)] hover:bg-primary-hover hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5',
  secondary:
    'bg-white text-ink border border-border hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 hover:shadow-[var(--shadow-e1)]',
  ghost: 'bg-transparent text-ink-secondary hover:bg-primary-light hover:text-primary',
  coral:
    'bg-coral text-white shadow-[var(--shadow-e1)] hover:bg-coral-hover hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5',
  danger: 'bg-danger text-white hover:brightness-95 hover:-translate-y-0.5',
}

const buttonSizes = {
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-6 text-[16px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

/* ---- Badge ---- */

const badgeConfig = {
  verified: {
    label: 'Verified',
    className: 'bg-success-light text-success',
    icon: <BadgeCheck size={14} strokeWidth={2.2} />,
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning-light text-warning',
    icon: <Clock size={14} strokeWidth={2.2} />,
  },
  completed: {
    label: 'Completed',
    className: 'bg-success-light text-success',
    icon: <CheckCircle2 size={14} strokeWidth={2.2} />,
  },
  transit: {
    label: 'In Transit',
    className: 'bg-info-light text-info',
    icon: <Plane size={14} strokeWidth={2.2} />,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-danger-light text-danger',
    icon: <XCircle size={14} strokeWidth={2.2} />,
  },
  warning: {
    label: 'Warning',
    className: 'bg-warning-light text-warning',
    icon: <AlertTriangle size={14} strokeWidth={2.2} />,
  },
}

export function Badge({ tone, label }) {
  const cfg = badgeConfig[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {label ?? cfg.label}
    </span>
  )
}

/* ---- Card ---- */

export function Card({ children, className = '', interactive = false }) {
  return (
    <div
      className={`rounded-[12px] border border-border bg-white ${
        interactive
          ? 'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-e2)]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ---- Avatar with optional verification badge ---- */

export function Avatar({ initials, verified = false, size = 40, tone = 'primary' }) {
  const bg = tone === 'coral' ? 'bg-coral/12 text-coral' : 'bg-primary-light text-primary'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`flex h-full w-full items-center justify-center rounded-full font-semibold ${bg}`}
        style={{ fontSize: size * 0.36 }}
      >
        {initials}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
          <BadgeCheck size={16} className="text-primary" strokeWidth={2.4} />
        </span>
      )}
    </div>
  )
}

/* ---- Rating ---- */

export function Rating({ value, count }) {
  return (
    <span className="inline-flex items-center gap-1 text-[14px] font-medium text-ink">
      <Star size={15} className="fill-warning text-warning" strokeWidth={0} />
      {value.toFixed(1)}
      {count != null && <span className="font-normal text-ink-muted">({count})</span>}
    </span>
  )
}

/* ---- Section header ---- */

export function SectionHeader({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
      {eyebrow && (
        <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink">{title}</h2>
      {subtitle && <p className="mt-3 text-[16px] leading-relaxed text-ink-secondary">{subtitle}</p>}
    </div>
  )
}