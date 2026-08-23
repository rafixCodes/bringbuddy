import { Logo } from './Logo'

// NOTE: the Figma source had a "click 5 times to enter admin mode" easter
// egg here (AdminDemoEntry), which faked isAdmin=true with zero real
// authentication — a prototype-only trick, not something to ship into the
// real app. Real admin access goes through actual login + accountType,
// wired separately (see App.jsx / AdminCenter conversion). Deliberately
// dropped, replaced with plain text below.

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
          <span className="select-none">Made for people, travel &amp; trust.</span>
        </div>
      </div>
    </footer>
  )
}
