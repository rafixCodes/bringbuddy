import { Search, PackageCheck, MapPin, ArrowRight, Plane } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { Logo } from '../Logo'
import { useToast } from '../../lib/toast'
import { completeOnboarding } from '../../services/authService'

const steps = [
  {
    number: '01',
    icon: <Search size={22} className="text-primary" />,
    title: 'Find a Traveler',
    desc: 'Browse verified travelers already flying your route, or post a public request and let travelers apply.',
  },
  {
    number: '02',
    icon: <PackageCheck size={22} className="text-primary" />,
    title: 'Create Your Delivery',
    desc: 'Describe your parcel, set the value, and agree on a carry fee. Funds are held in escrow until delivery.',
  },
  {
    number: '03',
    icon: <MapPin size={22} className="text-primary" />,
    title: 'Track & Confirm',
    desc: 'Monitor your parcel in real time. Release the escrow when you confirm delivery with your unique OTP.',
  },
]

export function SenderOnboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()

  async function handleSwitchToTraveler() {
    try {
      await completeOnboarding('traveler')
      navigate('/traveler-onboarding')
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
          <div className="w-14 h-14 rounded-[16px] bg-primary-light flex items-center justify-center mb-7">
            <PackageCheck size={28} className="text-primary" />
          </div>

          <h1 className="text-[34px] font-bold text-ink tracking-tight mb-3">Ready to send?</h1>
          <p className="text-[16px] text-ink-secondary leading-relaxed mb-10 max-w-lg">
            Find travelers already going your way, create a delivery request, and track the journey securely.
          </p>

          <div className="flex flex-col gap-0 mb-10 rounded-[16px] border border-border bg-white overflow-hidden">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex items-start gap-4 px-6 py-5 ${i < steps.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{step.number}</span>
                    <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                  </div>
                  <p className="text-[13px] text-ink-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              trailingIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/sender-dashboard')}
            >
              Continue to Sender Dashboard
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSwitchToTraveler}
              leadingIcon={<Plane size={15} />}
            >
              Switch to Traveler
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}