import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui'
import { verifyDeliveryOtp } from '../../services/otpService'

export function ReceiverDeliveryConfirmation() {
  const { id } = useParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      await verifyDeliveryOtp(id, code)
      setConfirmed(true)
    } catch (err) {
      const message = err.response?.data?.message || 'Could not confirm delivery'
      const remaining = err.response?.data?.attemptsRemaining
      setError(remaining == null ? message : `${message}. ${remaining} attempts remaining.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto mb-8 w-fit"><Logo /></div>
      <main className="mx-auto max-w-[480px] rounded-[20px] border border-border bg-white p-7 text-center shadow-[var(--shadow-e2)]">
        {confirmed ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success"><CheckCircle2 size={34} /></div>
            <h1 className="mt-5 text-[26px] font-bold text-ink">Delivery confirmed</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">Thank you. BringBuddy recorded the confirmation and updated the order timeline.</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-primary-light text-primary"><KeyRound size={27} /></div>
            <h1 className="mt-5 text-[26px] font-bold text-ink">Confirm your delivery</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">No account is required. Enter the six-digit OTP supplied for this delivery.</p>
            <form onSubmit={handleSubmit} className="mt-7">
              <label htmlFor="delivery-otp" className="sr-only">Six-digit delivery OTP</label>
              <input
                id="delivery-otp"
                value={code}
                onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="h-14 w-full rounded-[10px] border border-border text-center text-[25px] font-bold tracking-[0.28em] text-ink outline-none focus:border-primary"
              />
              <Button type="submit" size="lg" className="mt-4 w-full" disabled={code.length !== 6 || loading}>
                {loading ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
                Confirm delivery
              </Button>
            </form>
            {error && <p className="mt-4 rounded-[10px] bg-danger-light p-3 text-left text-[12px] text-danger">{error}</p>}
            <p className="mt-5 text-[11px] text-ink-muted">For security, the OTP expires after 10 minutes and allows five attempts.</p>
          </>
        )}
      </main>
    </div>
  )
}
