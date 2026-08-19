import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plane, ArrowRight, CheckCircle2, User, Bell, Settings, ShieldCheck } from 'lucide-react'
import { Button } from '../ui'
import { Logo } from '../Logo'
import { useToast } from '../../lib/toast'
import { getProfile, completeOnboarding } from '../../services/authService'

export function ModeSelection() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getProfile()
        setUser(data.user)
      } catch (error) {
        console.error(error)
        navigate('/login')
      }
    }
    fetchUser()
  }, [navigate])

  async function handleContinue() {
    if (!selected || isSubmitting) return
    setIsSubmitting(true)

    try {
      await completeOnboarding(selected)
      navigate(selected === 'sender' ? '/sender-onboarding' : '/traveler-onboarding')
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.'
      toast({ tone: 'error', title: 'Could not save your choice', message })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white">
        <Logo />
        <div className="text-[13px] text-ink-muted">
          Step 1 of 2 — Choose your starting mode
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[760px]">
          <div className="text-center mb-10 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
            {user && (
              <p className="text-[14px] text-ink-muted mb-2">
                Welcome, <strong className="text-ink">{user.name.split(' ')[0]}</strong>!
              </p>
            )}
            <h1 className="text-[34px] font-bold text-ink tracking-tight mb-3">
              How do you want to use BringBuddy?
            </h1>
            <p className="text-[16px] text-ink-secondary max-w-md mx-auto leading-relaxed">
              You can do both. Choose where you'd like to start.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              {
                key: 'sender',
                icon: <Package size={32} />,
                title: 'Send Something',
                sub: "I need to send a parcel or request something from abroad.",
                cta: 'Start as Sender',
                iconBg: 'bg-primary-light text-primary',
                features: ['Post a delivery request', 'Browse verified travelers', 'Track parcels securely'],
              },
              {
                key: 'traveler',
                icon: <Plane size={32} />,
                title: 'Travel & Earn',
                sub: "I'm traveling and have spare luggage space.",
                cta: 'Start as Traveler',
                iconBg: 'bg-coral-light text-coral',
                features: ['List your upcoming trips', 'Earn from spare luggage', 'Get verified & trusted'],
              },
            ].map(card => {
              const isSelected = selected === card.key
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setSelected(card.key)}
                  className={`relative text-left rounded-[16px] border-2 p-7 transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-e3)] focus-visible:outline-2 focus-visible:outline-primary ${
                    isSelected
                      ? 'border-primary shadow-[var(--shadow-e3)] -translate-y-1 bg-white'
                      : 'border-border bg-white hover:border-primary/30'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 size={22} />
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-[14px] ${card.iconBg} flex items-center justify-center mb-5`}>
                    {card.icon}
                  </div>
                  <h2 className="text-[20px] font-bold text-ink mb-2">{card.title}</h2>
                  <p className="text-[14px] text-ink-secondary leading-relaxed mb-5">{card.sub}</p>
                  <ul className="flex flex-col gap-1.5">
                    {card.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[13px] text-ink-secondary">
                        <span className="w-4 h-4 rounded-full bg-success-light flex items-center justify-center shrink-0">
                          <CheckCircle2 size={10} className="text-success" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-5 inline-flex items-center gap-2 text-[13px] font-semibold ${card.key === 'sender' ? 'text-primary' : 'text-coral'}`}>
                    {card.cta} <ArrowRight size={14} />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="h-px w-16 bg-border" />
            <p className="text-[13px] text-ink-muted font-medium text-center">
              Don't worry — you can switch modes anytime.
            </p>
            <div className="h-px w-16 bg-border" />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mb-10"
            disabled={!selected || isSubmitting}
            onClick={handleContinue}
            trailingIcon={<ArrowRight size={16} />}
          >
            {isSubmitting ? 'Saving…' : 'Continue'}
          </Button>

          <div className="rounded-[16px] border border-border bg-white px-6 py-6">
            <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest text-center mb-5">One account — two modes</p>
            <div className="flex items-center justify-center gap-0 flex-wrap">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <p className="text-[11px] font-bold text-ink mt-1.5">Your Account</p>
              </div>

              <div className="flex items-center gap-0 mx-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-border" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 bg-primary-light rounded-[8px] px-3 py-1.5">
                        <Package size={13} className="text-primary" />
                        <span className="text-[12px] font-semibold text-primary">Sender Mode</span>
                      </div>
                      <div className="flex items-center gap-2 bg-coral-light rounded-[8px] px-3 py-1.5">
                        <Plane size={13} className="text-coral" />
                        <span className="text-[12px] font-semibold text-coral">Traveler Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center mx-3">
                <div className="h-px w-8 bg-border mb-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-center">
                {[
                  { icon: <ShieldCheck size={11} />, label: 'Identity' },
                  { icon: <User size={11} />, label: 'Profile' },
                  { icon: <Bell size={11} />, label: 'Notifications' },
                  { icon: <Settings size={11} />, label: 'Settings' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-ink-muted bg-divider rounded-[6px] px-2.5 py-1.5">
                    <span className="text-ink-muted">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-[11px] text-ink-muted mt-4">Shared across both modes</p>
          </div>
        </div>
      </div>
    </div>
  )
}