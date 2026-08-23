import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { Button } from './ui'

/**
 * Lightweight sticky navbar. Gains a hairline border + soft blur once the
 * page scrolls, so the hero feels borderless on load.
 */
export function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-border bg-white/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-10">
        <a href="#top" className="rounded-lg transition-opacity hover:opacity-80">
          <Logo />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {[
            { label: 'Home', href: '#top' },
            { label: 'How It Works', href: '#how-it-works' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative rounded-lg px-3.5 py-2 text-[14px] font-medium text-ink-secondary transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </nav>
    </header>
  )
}
