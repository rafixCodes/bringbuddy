import { useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'
import { ArrowLeft, Shield, Globe, Users } from 'lucide-react'

const panelContent = {
  login: {
    headline: 'The global delivery network powered by real travelers.',
    sub: 'Thousands of verified travelers carry parcels along routes they are already flying.',
  },
  register: {
    headline: 'One account. Two ways to participate.',
    sub: 'Send parcels with trusted travelers or earn by sharing your luggage space.',
  },
  onboarding: {
    headline: 'Welcome to BringBuddy.',
    sub: 'Let\'s get you set up so you can start sending or earning right away.',
  },
}

const stats = [
  { icon: <Users size={15} />, value: '48,000+', label: 'Active users' },
  { icon: <Globe size={15} />, value: '120+', label: 'Countries' },
  { icon: <Shield size={15} />, value: '100%', label: 'Escrow-protected' },
]

const routes = [
  { from: 'DHA', to: 'LHR', flag: '🇧🇩', flag2: '🇬🇧', bg: 'bg-white/10' },
  { from: 'JFK', to: 'CDG', flag: '🇺🇸', flag2: '🇫🇷', bg: 'bg-white/8' },
  { from: 'BOM', to: 'DXB', flag: '🇮🇳', flag2: '🇦🇪', bg: 'bg-white/10' },
]

export function AuthLayout({ children, panel = 'login' }) {
  const navigate = useNavigate()
  const content = panelContent[panel]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ---- Left brand panel ---- */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #2849b8 0%, #3157D5 45%, #4466e0 100%)' }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        <div className="relative z-10 flex items-center justify-between px-10 pt-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-[13px] font-medium">
            <ArrowLeft size={14} />
            Back to site
          </button>
          <Logo variant="white" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-8">
          <div className="mb-10">
            <p className="text-white/60 text-[13px] font-medium tracking-widest uppercase mb-4">BringBuddy</p>
            <h2 className="text-white text-[28px] font-bold leading-tight mb-3 tracking-tight">
              {content.headline}
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed">{content.sub}</p>
          </div>

          <div className="flex flex-col gap-2.5 mb-10">
            {routes.map((r, i) => (
              <div
                key={r.from}
                className={`${r.bg} backdrop-blur-sm rounded-[12px] border border-white/10 px-4 py-3 flex items-center gap-3 animate-[bb-float-a_${4 + i}s_ease-in-out_infinite_${i * 0.6}s]`}
                style={{ animationDelay: `${i * 0.7}s` }}
              >
                <span className="text-lg">{r.flag}</span>
                <span className="text-white font-semibold text-[13px] tracking-wide">{r.from}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-px flex-1 bg-white/25" />
                  <div className="h-1.5 w-1.5 rounded-full bg-coral" />
                  <div className="h-px flex-1 bg-white/25" />
                </div>
                <span className="text-white font-semibold text-[13px] tracking-wide">{r.to}</span>
                <span className="text-lg">{r.flag2}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 px-10 py-6 flex gap-6">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-white/50">{s.icon}</span>
              <div>
                <p className="text-white text-[13px] font-bold leading-none">{s.value}</p>
                <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Right form area ---- */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-border">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors text-[13px] font-medium">
            <ArrowLeft size={14} />
            Back
          </button>
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[420px] animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}