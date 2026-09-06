import { CreditCard, Camera, Phone, Users, ArrowRight, Package, Lock } from 'lucide-react'
import { Button } from '../ui'
import { useRouter } from '../../lib/router'
import { Logo } from '../Logo'

const requirements = [
  {
    icon: <CreditCard size={20} className="text-primary" />,
    title: 'Passport / NID',
    desc: 'A clear photo or scan of your government-issued identity document.',
    bg: 'bg-primary-light',
  },
  {
    icon: <Camera size={20} className="text-primary" />,
    title: 'Profile Photo',
    desc: 'A clear, recent photo of your face so senders know who to expect.',
    bg: 'bg-primary-light',
  },
  {
    icon: <Phone size={20} className="text-primary" />,
    title: 'Verified Phone Number',
    desc: "We'll send a one-time code to confirm your number.",
    bg: 'bg-primary-light',
  },
  {
    icon: <Users size={20} className="text-primary" />,
    title: 'Emergency Contact',
    desc: 'A trusted contact in case we ever need to reach someone on your behalf.',
    bg: 'bg-primary-light',
  },
]

export function VerificationIntro() {
  const { navigate, switchMode } = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white">
        <Logo />
        <button
          onClick={() => navigate('traveler-onboarding')}
          className="text-[13px] text-ink-muted hover:text-ink transition-colors font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[620px] animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Trust icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-[16px] bg-primary flex items-center justify-center shadow-[var(--shadow-e2)]">
              <Lock size={26} className="text-white" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-0.5">Traveler Verification</p>
              <p className="text-[13px] text-ink-muted">Takes about 5–10 minutes</p>
            </div>
          </div>

          <h1 className="text-[34px] font-bold text-ink tracking-tight mb-3">Become a verified traveler</h1>
          <p className="text-[16px] text-ink-secondary leading-relaxed mb-8 max-w-lg">
            Verification helps keep BringBuddy safe and trustworthy for everyone. Once approved, you can publish trips and accept delivery orders.
          </p>

          {/* Requirements checklist */}
          <div className="rounded-[16px] border border-border bg-white overflow-hidden mb-6">
            {requirements.map((req, i) => (
              <div
                key={req.title}
                className={`flex items-start gap-4 px-6 py-5 ${i < requirements.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className={`w-10 h-10 rounded-[10px] ${req.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  {req.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink mb-0.5">{req.title}</p>
                  <p className="text-[13px] text-ink-secondary leading-snug">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className="rounded-[12px] bg-primary-light border border-primary/15 px-5 py-4 flex items-start gap-3 mb-8">
            <Lock size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-ink-secondary leading-snug">
              <strong className="text-ink">Your data is safe.</strong> Documents are encrypted at rest, used only for identity verification, and never shared with senders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              trailingIcon={<ArrowRight size={16} />}
              onClick={() => navigate('verification-flow')}
            >
              Begin Verification
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => { switchMode('sender'); navigate('sender-dashboard') }}
              leadingIcon={<Package size={15} />}
            >
              Do This Later
            </Button>
          </div>
          <p className="text-center text-[12px] text-ink-muted mt-4">
            If you skip verification, you can still use BringBuddy as a Sender.
          </p>
        </div>
      </div>
    </div>
  )
}
