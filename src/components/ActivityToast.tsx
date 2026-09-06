import { useEffect, useState } from 'react'
import { ShieldCheck, Package, KeyRound, Star } from 'lucide-react'

/**
 * A small, real interface-style notification that cycles through BringBuddy
 * activity events — previewing the platform's live trust/activity system.
 * Slides in bottom-left, holds, fades, then advances.
 */
const events = [
  { icon: ShieldCheck, tone: 'text-success bg-success-light', title: 'Payment Secured', body: '৳4,725 is safely held in escrow.' },
  { icon: Package, tone: 'text-info bg-info-light', title: 'Parcel picked up', body: 'Dhaka → London is now in transit.' },
  { icon: KeyRound, tone: 'text-primary bg-primary-light', title: 'Delivery confirmed', body: 'Receiver verified the OTP. Payment released.' },
  { icon: Star, tone: 'text-warning bg-warning-light', title: 'New 5-star review', body: 'Rahim earned a review. Trust score up.' },
]

export function ActivityToast() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>
    const show = setTimeout(() => setVisible(true), 2000)
    const cycle = setInterval(() => {
      setVisible(false)
      hideTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % events.length)
        setVisible(true)
      }, 600)
    }, 5000)
    return () => {
      clearTimeout(show)
      clearTimeout(hideTimer)
      clearInterval(cycle)
    }
  }, [])

  const ev = events[index]
  const Icon = ev.icon

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-6 z-40 hidden max-w-[320px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-[12px] border border-border bg-white p-3.5 shadow-[var(--shadow-e3)]">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${ev.tone}`}>
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <div>
          <div className="text-[14px] font-semibold text-ink">{ev.title}</div>
          <div className="mt-0.5 text-[13px] leading-snug text-ink-secondary">{ev.body}</div>
        </div>
      </div>
    </div>
  )
}
