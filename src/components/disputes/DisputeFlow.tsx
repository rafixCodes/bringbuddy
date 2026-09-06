import { useState } from 'react'
import {
  AlertTriangle, ChevronLeft, X, Loader2, CheckCircle2, ArrowRight,
  Paperclip, Upload,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type DisputeRecord } from '../../lib/router'
import { useToast } from '../../lib/toast'

const ISSUE_TYPES = [
  'Delivery issue',
  'Payment issue',
  'Damaged item',
  'Missing item',
  'Traveler / Sender issue',
  'Restricted-item concern',
  'Other',
]

type DisputeStep = 'form' | 'submitted' | 'resolved'

function StatusStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
        done ? 'bg-success text-white' : active ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-border text-ink-muted'
      }`}>
        {done ? '✓' : ''}
      </div>
      <span className={`text-[12px] font-medium ${active ? 'text-ink' : done ? 'text-success' : 'text-ink-muted'}`}>{label}</span>
    </div>
  )
}

export function DisputeFlow() {
  const { navigate, activeOrder, disputes, setDisputes, user } = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<DisputeStep>('form')
  const [loading, setLoading] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<string[]>(['package-photo.jpg'])
  const [errors, setErrors] = useState<{ issue?: string; description?: string }>({})

  const order = activeOrder ?? {
    id: 'BB-1048', from: 'Dhaka', to: 'London',
    travelerName: 'Aisha Rahman', senderName: 'Alex Johnson',
  }

  const existingDispute = disputes.find(d => d.orderId === order.id)
  const currentStep = existingDispute?.status

  function validate() {
    const e: typeof errors = {}
    if (!issueType) e.issue = 'Please select an issue type.'
    if (!description.trim() || description.length < 20) e.description = 'Please provide more detail (at least 20 characters).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const newDispute: DisputeRecord = {
      id: `DIS-${String(disputes.length + 2).padStart(3, '0')}`,
      orderId: order.id,
      senderName: (order as any).senderName ?? 'Sender',
      travelerName: (order as any).travelerName ?? 'Traveler',
      issueType,
      description,
      evidence,
      status: 'submitted',
      submittedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    setDisputes(prev => [...prev, newDispute])
    setLoading(false)
    toast({ tone: 'info', title: '📋 Dispute submitted', message: 'Our team will review and get back to you within 24 hours.' })
    setStep('submitted')
  }

  function removeEvidence(name: string) {
    setEvidence(prev => prev.filter(e => e !== name))
  }

  function addEvidence() {
    const name = `evidence-${Date.now()}.jpg`
    setEvidence(prev => [...prev, name])
  }

  const latestDispute = [...disputes].reverse().find(d => d.orderId === order.id)

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[680px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate('order-hub')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Order Hub
        </button>

        {step === 'form' && (
          <div className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-warning" />
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-ink">Report a Problem</h1>
                <p className="text-[13px] text-ink-muted">Order #{order.id} · {(order as any).from} → {(order as any).to}</p>
              </div>
            </div>

            <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-6 flex flex-col gap-5">
              {/* Issue type */}
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Issue Type</label>
                <div className="flex flex-wrap gap-2">
                  {ISSUE_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setIssueType(t); setErrors(p => ({ ...p, issue: undefined })) }}
                      className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all ${
                        issueType === t
                          ? 'bg-warning text-white border-warning'
                          : 'bg-white text-ink-secondary border-border hover:border-warning/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.issue && <p className="text-[11px] text-danger mt-1">{errors.issue}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5">Describe the issue</label>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: undefined })) }}
                  rows={4}
                  placeholder="Describe what happened in detail…"
                  className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description
                    ? <p className="text-[11px] text-danger">{errors.description}</p>
                    : <span />
                  }
                  <p className="text-[11px] text-ink-muted">{description.length} characters</p>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Evidence <span className="font-normal text-ink-muted">(optional)</span></label>
                <div className="flex flex-col gap-2 mb-3">
                  {evidence.map(name => (
                    <div key={name} className="flex items-center gap-3 rounded-[10px] bg-divider px-3 py-2.5">
                      <Paperclip size={13} className="text-ink-muted shrink-0" />
                      <p className="text-[12px] text-ink flex-1">{name}</p>
                      <button
                        onClick={() => removeEvidence(name)}
                        className="text-ink-muted hover:text-danger transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addEvidence}
                  className="flex items-center gap-2 text-[12px] text-primary font-medium hover:text-primary/70 transition-colors"
                >
                  <Upload size={13} /> Add evidence file (prototype)
                </button>
              </div>

              <div className="rounded-[10px] bg-info-light border border-info/20 px-4 py-3 text-[12px] text-ink-secondary">
                Disputes are reviewed within 24–48 hours. Do not submit disputes for issues that can be resolved directly with the traveler.
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="ghost" size="lg" onClick={() => navigate('order-hub')}>Cancel</Button>
              <Button
                variant="coral"
                size="lg"
                className="flex-1"
                trailingIcon={loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Submit Dispute'}
              </Button>
            </div>
          </div>
        )}

        {step === 'submitted' && (
          <div className="animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-8 text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-success" />
              </div>
              <h2 className="text-[22px] font-bold text-ink mb-1.5">Dispute submitted</h2>
              <p className="text-[14px] text-ink-secondary mb-6">
                Our team will review and respond within 24–48 hours.
              </p>

              {/* Status tracker */}
              <div className="flex items-center justify-between gap-2 mb-6 px-4">
                {['Submitted', 'Under Review', 'Resolution', 'Resolved'].map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-success text-white' : 'bg-border text-ink-muted'}`}>
                      {i === 0 ? '✓' : i + 1}
                    </div>
                    {i < 3 && <div className="h-0.5 flex-1 mx-1 bg-border" />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-ink-muted px-4 mb-6">
                {['Submitted', 'Under Review', 'Resolution', 'Resolved'].map(s => (
                  <span key={s} className="text-center" style={{ flex: 1 }}>{s}</span>
                ))}
              </div>

              {/* Dispute details */}
              {latestDispute && (
                <div className="rounded-[12px] bg-divider px-4 py-3 text-left flex flex-col gap-2 mb-6">
                  {[
                    { label: 'Dispute ID', value: latestDispute.id },
                    { label: 'Order ID', value: latestDispute.orderId },
                    { label: 'Submitted', value: latestDispute.submittedAt },
                    { label: 'Issue', value: latestDispute.issueType },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-[12px]">
                      <span className="text-ink-muted">{r.label}</span>
                      <span className="font-semibold text-ink">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate('order-hub')}>Back to Order</Button>
                <Button variant="primary" size="md" className="flex-1" onClick={() => navigate(user?.mode === 'traveler' ? 'traveler-dashboard' : 'sender-dashboard' as any)}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

