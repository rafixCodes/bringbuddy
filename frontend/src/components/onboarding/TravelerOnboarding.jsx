import { ShieldCheck, Globe, Wallet, ArrowRight, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { Logo } from '../Logo'
import { useToast } from '../../lib/toast'
import { completeOnboarding } from '../../services/authService'

const steps = [
  {
    number: '01',
    icon: <ShieldCheck size={22} className="text-coral" />,
    title: 'Verify Yourself',
    desc: 'Submit your passport/NID, profile photo, verified phone, and emergency contact. Admin reviews within 24–48h.',
    iconBg: 'bg-coral-light',
  },
  {
    number: '02',
    icon: <Globe size={22} className="text-coral" />,
    title: 'Post Your Trip',
    desc: 'Publish your upcoming route with available weight and dates. Senders will see your listing and request you.',
    iconBg: 'bg-coral-light',
  },
  {
    number: '03',
    icon: <Wallet size={22} className="text-coral" />,
    title: 'Carry & Earn',
    desc: 'Agree on a carry fee, pick up the parcel, deliver it, and receive your payment from escrow on OTP confirmation.',
    iconBg: 'bg-coral-light',
  },
]

export function TravelerOnboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()

  async function handleContinueAsSender() {
    try {
      await completeOnboarding('sender')
      navigate('/sender-onboarding')
    } catch (error) {
      const message = error.response?.data?.message || 'Could not switch modes. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white">
        <Logo />
        <button
          onClick={() => navigate('/onboarding')}
          className="text-[13px] text-ink-muted hover:text-ink transition-colors font-medium"
        >
          ← Change mode
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[600px] animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-14 h-14 rounded-[16px] bg-coral-light flex items-center justify-center mb-7">
            <Globe size={28} className="text-coral" />
          </div>

          <h1 className="text-[34px] font-bold text-ink tracking-tight mb-3">
            Turn spare luggage space into income.
          </h1>
          <p className="text-[16px] text-ink-secondary leading-relaxed mb-10 max-w-lg">
            Verify yourself, publish your trip, and start carrying deliveries along routes you're already traveling.
          </p>

          <div className="flex flex-col gap-0 mb-10 rounded-[16px] border border-border bg-white overflow-hidden">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex items-start gap-4 px-6 py-5 ${i < steps.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className={`w-10 h-10 rounded-[10px] ${step.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-coral tracking-widest uppercase">{step.number}</span>
                    <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                  </div>
                  <p className="text-[13px] text-ink-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[12px] bg-warning-light border border-warning/20 px-5 py-4 flex items-start gap-3 mb-6">
            <ShieldCheck size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-ink mb-0.5">Verification required to post trips</p>
              <p className="text-[13px] text-ink-secondary leading-snug">
                You'll need to complete traveler verification before you can publish trips or accept orders. You can skip this now and use your Sender account in the meantime.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="coral"
              size="lg"
              className="flex-1"
              trailingIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/verification-intro')}
            >
              Start Verification
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleContinueAsSender}
              leadingIcon={<Package size={15} />}
            >
              Continue as Sender
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}