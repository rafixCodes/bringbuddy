import { MapPin, Plane, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui'

export function FinalCTA() {
  const navigate = useNavigate()
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10">
      <div className="bb-reveal relative overflow-hidden rounded-[24px] border border-primary-dark/20 bg-primary px-8 py-16 text-center shadow-[var(--shadow-e2)] lg:px-16">
        {/* subtle route lines, not a loud gradient */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 1200 400" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M-20 320 C 300 160, 620 160, 1220 40" stroke="#fff" strokeWidth="2" strokeDasharray="6 10" />
          <path d="M-20 380 C 380 260, 780 260, 1220 140" stroke="#F9735B" strokeWidth="2" strokeDasharray="6 10" />
          <circle cx="1040" cy="70" r="4" fill="#fff" />
          <circle cx="180" cy="300" r="4" fill="#F9735B" />
        </svg>

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[13px] font-medium text-white/90 ring-1 ring-white/20">
            <ShieldCheck size={15} /> Verified, escrow-protected, tracked end to end
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-tight text-white lg:text-[40px]">
            Your next trip could carry
            <br className="hidden sm:block" /> more than luggage.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-white/80">
            Send what you need. Earn from the space you have.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 hover:-translate-y-0.5"
              leadingIcon={<MapPin size={18} />}
              onClick={() => navigate('/register')}
            >
              Find a Traveler
            </Button>
            <Button
              size="lg"
              className="bg-coral text-white hover:bg-coral-hover hover:-translate-y-0.5"
              leadingIcon={<Plane size={18} />}
              onClick={() => navigate('/register')}
            >
              Post Your Trip
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
