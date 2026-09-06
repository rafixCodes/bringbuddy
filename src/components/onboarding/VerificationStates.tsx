import { Clock, CheckCircle2, AlertTriangle, Package, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '../ui'
import { useRouter } from '../../lib/router'
import { Logo } from '../Logo'

/* ---- Pending ---- */
export function VerificationPending() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center px-8 py-5 border-b border-border bg-white">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[520px] text-center animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Pulsing icon */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-warning/15 animate-[bb-pulse-ring_2s_ease-out_infinite]" />
            <div className="absolute inset-0 rounded-full bg-warning/10 animate-[bb-pulse-ring_2s_ease-out_infinite_0.5s]" />
            <div className="relative w-20 h-20 rounded-full bg-warning-light border-2 border-warning/30 flex items-center justify-center">
              <Clock size={32} className="text-warning" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-warning-light border border-warning/30 px-4 py-1.5 text-[12px] font-semibold text-warning mb-5">
            <Clock size={12} /> Pending Verification
          </div>

          <h1 className="text-[30px] font-bold text-ink tracking-tight mb-3">Verification submitted</h1>
          <p className="text-[15px] text-ink-secondary leading-relaxed mb-4 max-w-sm mx-auto">
            Your information has been submitted for review. We'll notify you when your traveler verification is complete.
          </p>
          <p className="text-[13px] text-ink-muted mb-8">
            Typical review time: <strong className="text-ink">24–48 hours</strong>
          </p>

          <div className="rounded-[12px] bg-primary-light border border-primary/15 px-5 py-4 text-left mb-8">
            <p className="text-[13px] font-semibold text-ink mb-1.5">What happens while you wait?</p>
            <ul className="space-y-1.5">
              {[
                'Traveler features remain locked until approval.',
                'You can still use BringBuddy as a Sender.',
                "We'll send an email and in-app notification with the decision.",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                  <span className="text-primary mt-0.5">·</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leadingIcon={<Package size={15} />}
              trailingIcon={<ArrowRight size={15} />}
              onClick={() => navigate('sender-dashboard')}
            >
              Continue to Sender Mode
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('verification-pending')}>
              View Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Approved ---- */
export function VerificationApproved() {
  const { navigate, switchMode } = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center px-8 py-5 border-b border-border bg-white">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[520px] text-center animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-20 h-20 rounded-full bg-success-light border-2 border-success/30 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={36} className="text-success" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-success-light border border-success/30 px-4 py-1.5 text-[12px] font-semibold text-success mb-5">
            <CheckCircle2 size={12} /> Verified Traveler
          </div>

          <h1 className="text-[30px] font-bold text-ink tracking-tight mb-3">You're verified!</h1>
          <p className="text-[15px] text-ink-secondary leading-relaxed mb-8 max-w-sm mx-auto">
            Your traveler profile is now verified. You can publish trips and accept delivery orders.
          </p>

          <div className="rounded-[16px] border border-success/20 bg-success-light/30 px-6 py-5 mb-8 text-left">
            <p className="text-[13px] font-semibold text-ink mb-2">Your verified traveler badge is now active</p>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-success text-white rounded-full px-3 py-1 text-[12px] font-bold">
                <CheckCircle2 size={12} /> Verified
              </div>
              <span className="text-[13px] text-ink-secondary">Shown on your profile and trip listings</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              trailingIcon={<ArrowRight size={16} />}
              onClick={() => { switchMode('traveler'); navigate('traveler-dashboard') }}
            >
              Continue as Traveler
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => { switchMode('sender'); navigate('sender-dashboard') }}
            >
              Switch to Sender
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Rejected / Needs Correction ---- */
export function VerificationRejected() {
  const { navigate } = useRouter()

  const issues = [
    {
      icon: <AlertTriangle size={16} className="text-warning" />,
      field: 'Identity document',
      reason: 'Please upload a clearer document. All four corners and the text must be fully visible.',
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      <div className="flex items-center px-8 py-5 border-b border-border bg-white">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[520px] text-center animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-20 h-20 rounded-full bg-warning-light border-2 border-warning/30 flex items-center justify-center mx-auto mb-8">
            <AlertTriangle size={32} className="text-warning" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-warning-light border border-warning/30 px-4 py-1.5 text-[12px] font-semibold text-warning mb-5">
            <AlertTriangle size={12} /> Needs Attention
          </div>

          <h1 className="text-[30px] font-bold text-ink tracking-tight mb-3">Some information needs attention</h1>
          <p className="text-[15px] text-ink-secondary leading-relaxed mb-6 max-w-sm mx-auto">
            Please review the items below, make the requested corrections, and resubmit.
          </p>

          <div className="rounded-[16px] border border-border bg-white overflow-hidden mb-8 text-left">
            {issues.map(issue => (
              <div key={issue.field} className="flex items-start gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-[8px] bg-warning-light flex items-center justify-center shrink-0 mt-0.5">
                  {issue.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink mb-0.5">{issue.field}</p>
                  <p className="text-[13px] text-ink-secondary">{issue.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-ink-muted mb-6">
            Your Sender account remains fully active while you correct and resubmit.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leadingIcon={<RefreshCw size={15} />}
              onClick={() => navigate('verification-flow')}
            >
              Review & Resubmit
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('sender-dashboard')}
            >
              Continue as Sender
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
