import { useState } from 'react'
import { Logo } from './Logo'
import { useRouter } from '../lib/router'
import { useToast } from '../lib/toast'

function AdminDemoEntry() {
  const { setIsAdmin, navigate } = useRouter()
  const { toast } = useToast()
  const [clicks, setClicks] = useState(0)

  function handleClick() {
    const next = clicks + 1
    setClicks(next)
    if (next >= 5) {
      setIsAdmin(true)
      navigate('admin' as any)
      toast({ tone: 'info', title: '🔐 Admin mode activated', message: 'Prototype admin panel — not visible to real users.' })
      setClicks(0)
    }
  }

  return (
    <button
      onClick={handleClick}
      title={clicks > 0 ? `${5 - clicks} more to enter admin demo` : 'BringBuddy prototype'}
      className="text-[13px] text-ink-muted hover:text-ink-muted transition-colors select-none"
      aria-label="Prototype admin entry (click 5 times)"
    >
      Made for people, travel &amp; trust.
    </button>
  )
}

const columns = [
  { title: 'Product', links: ['How It Works', 'Marketplace', 'Trust & Safety'] },
  { title: 'Company', links: ['About', 'Contact', 'Support'] },
  { title: 'Legal', links: ['Privacy', 'Terms'] },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-secondary">
              A cross-border parcel-sharing marketplace connecting senders with trusted travelers who
              have spare luggage space.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[14px] text-ink-secondary transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-divider pt-6 text-[13px] text-ink-muted sm:flex-row">
          <span>© 2026 BringBuddy. All rights reserved.</span>
          <AdminDemoEntry />
        </div>
      </div>
    </footer>
  )
}
