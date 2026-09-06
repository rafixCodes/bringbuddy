import { useState, useRef, type ChangeEvent } from 'react'
import {
  CreditCard, Camera, Phone, Users, CheckCircle2,
  Upload, ArrowRight, ArrowLeft, Loader2, X, RefreshCw,
} from 'lucide-react'
import { Button } from '../ui'
import { FormField } from '../auth/FormField'
import { useRouter } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { Logo } from '../Logo'

const STEPS = [
  { id: 'document', label: 'Identity Document', icon: CreditCard },
  { id: 'photo', label: 'Profile Photo', icon: Camera },
  { id: 'phone', label: 'Phone Verification', icon: Phone },
  { id: 'emergency', label: 'Emergency Contact', icon: Users },
  { id: 'review', label: 'Review & Submit', icon: CheckCircle2 },
]

type UploadState = 'idle' | 'uploading' | 'done' | 'invalid'

function useUpload() {
  const [state, setState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState('')

  function handleFile(file: File) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setState('invalid'); return }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setState('invalid'); return
    }
    setState('uploading')
    setFileName(file.name)
    setTimeout(() => setState('done'), 1600)
  }

  function reset() { setState('idle'); setFileName('') }
  return { state, fileName, handleFile, reset }
}

/* ---- Step 1: Identity Document ---- */
function DocumentStep({ onNext }: { onNext: () => void }) {
  const upload = useUpload()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-ink mb-1.5">Identity Document</h2>
        <p className="text-[14px] text-ink-secondary">Upload a clear photo or scan of your passport or national ID card.</p>
      </div>

      <div
        onClick={() => upload.state === 'idle' && fileRef.current?.click()}
        className={`relative rounded-[16px] border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] ${
          upload.state === 'done'
            ? 'border-success/50 bg-success-light/40 cursor-default'
            : upload.state === 'invalid'
            ? 'border-danger/50 bg-danger-light/40 cursor-pointer'
            : upload.state === 'uploading'
            ? 'border-primary/40 bg-primary-light/40 cursor-default'
            : 'border-border hover:border-primary/40 hover:bg-primary-light/20'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="hidden"
          onChange={e => e.target.files?.[0] && upload.handleFile(e.target.files[0])}
        />
        {upload.state === 'idle' && (
          <>
            <div className="w-12 h-12 rounded-[12px] bg-primary-light flex items-center justify-center mb-3">
              <Upload size={22} className="text-primary" />
            </div>
            <p className="text-[14px] font-semibold text-ink mb-1">Drag & drop or click to upload</p>
            <p className="text-[12px] text-ink-muted">JPEG, PNG, PDF · Max 10 MB</p>
          </>
        )}
        {upload.state === 'uploading' && (
          <>
            <Loader2 size={28} className="text-primary animate-spin mb-3" />
            <p className="text-[14px] font-semibold text-ink">Uploading…</p>
            <p className="text-[12px] text-ink-muted mt-1">{upload.fileName}</p>
          </>
        )}
        {upload.state === 'done' && (
          <>
            <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mb-3">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <p className="text-[14px] font-semibold text-ink mb-1">Document uploaded</p>
            <p className="text-[12px] text-ink-muted">{upload.fileName}</p>
            <button
              onClick={e => { e.stopPropagation(); upload.reset() }}
              className="mt-3 flex items-center gap-1.5 text-[12px] text-primary hover:text-primary-hover font-medium"
            >
              <RefreshCw size={12} /> Replace
            </button>
          </>
        )}
        {upload.state === 'invalid' && (
          <>
            <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mb-3">
              <X size={22} className="text-danger" />
            </div>
            <p className="text-[14px] font-semibold text-danger mb-1">Invalid file</p>
            <p className="text-[12px] text-ink-muted mb-3">Use JPEG, PNG, or PDF under 10 MB.</p>
            <Button variant="secondary" size="md" onClick={e => { e.stopPropagation(); upload.reset() }}>
              Try again
            </Button>
          </>
        )}
      </div>

      <div className="rounded-[12px] bg-divider px-4 py-3 text-[12px] text-ink-muted">
        💡 Make sure all four corners are visible, text is legible, and there's no glare.
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={upload.state !== 'done'}
        trailingIcon={<ArrowRight size={16} />}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
}

/* ---- Step 2: Profile Photo ---- */
function PhotoStep({ onNext }: { onNext: () => void }) {
  const upload = useUpload()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-ink mb-1.5">Add your profile photo</h2>
        <p className="text-[14px] text-ink-secondary">Use a clear photo so other BringBuddy users know who they're dealing with.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div
          onClick={() => upload.state !== 'uploading' && fileRef.current?.click()}
          className="relative w-32 h-32 rounded-full border-2 border-dashed border-border hover:border-primary/40 bg-divider flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => e.target.files?.[0] && upload.handleFile(e.target.files[0])}
          />
          {upload.state === 'idle' && (
            <div className="flex flex-col items-center gap-1 text-ink-muted group-hover:text-primary transition-colors">
              <Camera size={28} />
              <span className="text-[11px] font-medium">Upload</span>
            </div>
          )}
          {upload.state === 'uploading' && <Loader2 size={24} className="text-primary animate-spin" />}
          {upload.state === 'done' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-success-light">
              <CheckCircle2 size={28} className="text-success" />
            </div>
          )}
          {upload.state === 'invalid' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-danger-light">
              <X size={24} className="text-danger" />
            </div>
          )}
        </div>
        {upload.state === 'done' && (
          <div className="text-center">
            <p className="text-[13px] font-medium text-success mb-1">✓ Photo uploaded</p>
            <button onClick={upload.reset} className="text-[12px] text-primary hover:underline font-medium">Replace</button>
          </div>
        )}
        {upload.state === 'invalid' && (
          <div className="text-center">
            <p className="text-[13px] font-medium text-danger mb-1">Invalid file type</p>
            <button onClick={upload.reset} className="text-[12px] text-primary hover:underline font-medium">Try again</button>
          </div>
        )}
        {upload.state === 'idle' && (
          <p className="text-[12px] text-ink-muted text-center">JPEG or PNG · Max 10 MB</p>
        )}
      </div>

      <div className="rounded-[12px] bg-divider px-4 py-3 text-[12px] text-ink-muted">
        💡 Use a clear, well-lit photo of just your face. Sunglasses and hats make it harder for senders to recognise you.
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={upload.state !== 'done'}
        trailingIcon={<ArrowRight size={16} />}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
}

/* ---- Step 3: Phone Verification ---- */
type PhoneStepState = 'input' | 'sending' | 'otp' | 'verifying' | 'verified' | 'invalid-otp'

function PhoneStep({ onNext }: { onNext: () => void }) {
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [stepState, setStepState] = useState<PhoneStepState>('input')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  async function sendOTP() {
    if (!phone || phone.length < 7) { setPhoneError('Enter a valid phone number.'); return }
    setPhoneError('')
    setStepState('sending')
    await new Promise(r => setTimeout(r, 1200))
    setStepState('otp')
    setTimer(60)
    const interval = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 }), 1000)
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  async function verifyOTP() {
    const code = otp.join('')
    if (code.length < 6) return
    setStepState('verifying')
    await new Promise(r => setTimeout(r, 1000))
    // Prototype: any 6-digit code works
    setStepState('verified')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-ink mb-1.5">Verify your phone</h2>
        <p className="text-[14px] text-ink-secondary">We'll send a one-time code to confirm your number.</p>
      </div>

      {(stepState === 'input' || stepState === 'sending') && (
        <div className="flex flex-col gap-4">
          <FormField
            label="Phone number"
            type="tel"
            placeholder="+44 7911 123456"
            value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError('') }}
            error={phoneError}
            hint="Include your country code"
            disabled={stepState === 'sending'}
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={sendOTP}
            disabled={stepState === 'sending'}
          >
            {stepState === 'sending' ? (
              <><Loader2 size={16} className="animate-spin" /> Sending code…</>
            ) : 'Send OTP'}
          </Button>
        </div>
      )}

      {(stepState === 'otp' || stepState === 'verifying' || stepState === 'invalid-otp') && (
        <div className="flex flex-col gap-5">
          <div className="rounded-[12px] bg-primary-light border border-primary/15 px-4 py-3 text-[13px] text-ink flex items-center gap-2">
            <Phone size={14} className="text-primary" />
            Code sent to <strong>{phone}</strong>
            <button onClick={() => setStepState('input')} className="ml-auto text-primary text-[12px] font-medium hover:underline">Change</button>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-ink block mb-3">Enter verification code</label>
            <div className="flex gap-2.5 justify-center" role="group" aria-label="Verification code input">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className={`w-12 h-14 text-center text-[20px] font-bold rounded-[10px] border-2 transition-all duration-150 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white ${
                    stepState === 'invalid-otp' ? 'border-danger/60 bg-danger-light/40' : digit ? 'border-primary/60' : 'border-border'
                  }`}
                />
              ))}
            </div>
            {stepState === 'invalid-otp' && (
              <p role="alert" className="text-[12px] text-danger text-center mt-2">Invalid code. Please try again.</p>
            )}
          </div>

          <div className="text-center text-[13px] text-ink-muted">
            {timer > 0
              ? <span>Resend in <strong className="text-ink">{timer}s</strong></span>
              : <button onClick={sendOTP} className="text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                  <RefreshCw size={12} /> Resend code
                </button>
            }
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={verifyOTP}
            disabled={otp.join('').length < 6 || stepState === 'verifying'}
          >
            {stepState === 'verifying' ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify Code'}
          </Button>
        </div>
      )}

      {stepState === 'verified' && (
        <div className="flex flex-col gap-5 animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <p className="text-[16px] font-bold text-ink">✓ Phone verified</p>
            <p className="text-[13px] text-ink-muted">Your phone number has been successfully verified.</p>
          </div>
          <Button variant="primary" size="lg" className="w-full" trailingIcon={<ArrowRight size={16} />} onClick={onNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---- Step 4: Emergency Contact ---- */
function EmergencyStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Contact name is required.'
    if (!phone.trim() || phone.length < 7) e.phone = 'Enter a valid phone number.'
    if (!relationship.trim()) e.relationship = 'Please specify the relationship.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-ink mb-1.5">Emergency contact</h2>
        <p className="text-[14px] text-ink-secondary">A trusted contact in case of an emergency during a trip.</p>
      </div>

      <div className="rounded-[12px] bg-primary-light border border-primary/15 px-4 py-3 text-[13px] text-ink-secondary">
        This information is kept private and only used in genuine emergency situations. It is never shared with senders.
      </div>

      <FormField
        label="Contact's full name"
        type="text"
        placeholder="Sarah Johnson"
        value={name}
        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
        error={errors.name}
      />
      <FormField
        label="Contact's phone number"
        type="tel"
        placeholder="+44 7911 000000"
        value={phone}
        onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }}
        error={errors.phone}
        hint="Include country code"
      />
      <FormField
        label="Relationship"
        type="text"
        placeholder="e.g. Spouse, Parent, Sibling"
        value={relationship}
        onChange={e => { setRelationship(e.target.value); setErrors(p => ({ ...p, relationship: '' })) }}
        error={errors.relationship}
      />

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        trailingIcon={<ArrowRight size={16} />}
        onClick={() => validate() && onNext()}
      >
        Continue
      </Button>
    </div>
  )
}

/* ---- Step 5: Review & Submit ---- */
function ReviewStep({ onSubmit, isSubmitting }: { onSubmit: () => void; isSubmitting: boolean }) {
  const items = [
    { label: 'Passport / NID', status: 'done' },
    { label: 'Profile Photo', status: 'done' },
    { label: 'Phone Number', status: 'done' },
    { label: 'Emergency Contact', status: 'done' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-ink mb-1.5">Review & Submit</h2>
        <p className="text-[14px] text-ink-secondary">Everything looks good. Submit your information for review.</p>
      </div>

      <div className="rounded-[16px] border border-border bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-divider">
          <p className="text-[12px] font-semibold text-ink uppercase tracking-widest">Verification Checklist</p>
        </div>
        {items.map((item, i) => (
          <div key={item.label} className={`flex items-center gap-3 px-5 py-4 ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
            <CheckCircle2 size={18} className="text-success shrink-0" />
            <span className="text-[14px] font-medium text-ink">{item.label}</span>
            <span className="ml-auto text-[12px] text-success font-medium">Submitted</span>
          </div>
        ))}
      </div>

      <div className="rounded-[12px] bg-success-light border border-success/20 px-4 py-3.5 flex items-center gap-3">
        <CheckCircle2 size={18} className="text-success" />
        <div>
          <p className="text-[13px] font-semibold text-ink">Ready to submit</p>
          <p className="text-[12px] text-ink-secondary">All required information has been provided.</p>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit for Verification'}
      </Button>
    </div>
  )
}

/* ---- Main flow ---- */
export function VerificationFlow() {
  const { navigate, user, setUser } = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  async function handleSubmit() {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    if (user) setUser({ ...user, verificationStatus: 'pending' })
    toast({ tone: 'success', title: 'Verification submitted', message: 'Your documents are now under review.' })
    navigate('verification-pending')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-[bb-fade_0.4s_ease_both]">
      {/* Top bar with progress */}
      <div className="bg-white border-b border-border px-8 py-4">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center justify-between mb-1">
            <Logo />
            <button onClick={() => navigate('verification-intro')} className="text-[13px] text-ink-muted hover:text-ink transition-colors font-medium">
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[720px] mx-auto px-8 py-4">
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done ? 'bg-success text-white' : active ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(49,87,213,0.15)]' : 'bg-border text-ink-muted'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                    </div>
                    <span className={`text-[10px] font-medium mt-1 hidden sm:block whitespace-nowrap ${active ? 'text-primary' : done ? 'text-success' : 'text-ink-muted'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-1 sm:mx-2 mt-[-12px] sm:mt-[-16px] transition-colors duration-300" style={{ background: done ? 'var(--color-success)' : 'var(--color-border)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px] animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]" key={step}>
          {step === 0 && <DocumentStep onNext={next} />}
          {step === 1 && <PhotoStep onNext={next} />}
          {step === 2 && <PhoneStep onNext={next} />}
          {step === 3 && <EmergencyStep onNext={next} />}
          {step === 4 && <ReviewStep onSubmit={handleSubmit} isSubmitting={isSubmitting} />}

          {step > 0 && step < 4 && (
            <button onClick={prev} className="mt-6 flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors font-medium">
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
