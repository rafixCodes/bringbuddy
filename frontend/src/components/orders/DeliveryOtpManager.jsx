import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, Copy, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { generateDeliveryOtp, getDeliveryOtpStatus } from '../../services/otpService'

export function DeliveryOtpManager() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getDeliveryOtpStatus(id)
      .then(setData)
      .catch(err => setError(err.response?.data?.message || 'Could not load delivery confirmation'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleGenerate() {
    try {
      setGenerating(true)
      setError('')
      const result = await generateDeliveryOtp(id)
      setGenerated(result)
      setData(current => ({ ...current, otp: { ...current.otp, isGenerated: true, expiresAt: result.expiresAt } }))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate OTP')
    } finally {
      setGenerating(false)
    }
  }

  async function copyReceiverLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/delivery-confirmation/${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (loading) return <div className="min-h-screen bg-background"><AuthNavbar /><div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div></div>

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="mx-auto max-w-[760px] px-6 pb-20 pt-28">
        <button onClick={() => navigate('/order-history')} className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
          <ArrowLeft size={15} /> Back to My Orders
        </button>

        <section className="rounded-[20px] border border-border bg-white p-7 shadow-[var(--shadow-e1)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary-light text-primary"><KeyRound size={24} /></div>
          <h1 className="mt-4 text-[28px] font-bold tracking-tight text-ink">Receiver OTP confirmation</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            Generate a one-time password for {data?.order?.receiver?.name}. The receiver can confirm delivery without creating an account.
          </p>

          <div className="mt-6 grid gap-3 rounded-[14px] bg-background p-4 sm:grid-cols-2">
            <div><p className="text-[11px] text-ink-muted">Route</p><p className="text-[14px] font-semibold text-ink">{data?.order?.pickup?.city} → {data?.order?.destination?.city}</p></div>
            <div><p className="text-[11px] text-ink-muted">Current status</p><p className="text-[14px] font-semibold capitalize text-ink">{data?.order?.status?.replaceAll('_', ' ')}</p></div>
          </div>

          {data?.otp?.isVerified ? (
            <div className="mt-6 rounded-[14px] bg-success-light p-5 text-success"><CheckCircle2 className="mb-2" /><p className="font-semibold">Delivery already confirmed</p></div>
          ) : generated ? (
            <div className="mt-6 rounded-[16px] border border-primary/20 bg-primary-light p-6 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-primary">Demo delivery OTP</p>
              <p className="my-3 text-[38px] font-bold tracking-[0.22em] text-ink">{generated.demoOtp}</p>
              <p className="flex items-center justify-center gap-1.5 text-[12px] text-ink-secondary"><Clock3 size={14} /> Expires in 10 minutes</p>
              <Button variant="secondary" className="mt-5" onClick={copyReceiverLink} leadingIcon={<Copy size={15} />}>
                {copied ? 'Link copied' : 'Copy receiver link'}
              </Button>
            </div>
          ) : (
            <Button className="mt-6 w-full" size="lg" disabled={!data?.canGenerate || generating} onClick={handleGenerate}>
              {generating ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
              Generate secure OTP
            </Button>
          )}

          {!data?.canGenerate && !data?.otp?.isVerified && (
            <p className="mt-3 text-[12px] text-warning">The order must be accepted and not yet delivered before an OTP can be generated.</p>
          )}
          {error && <p className="mt-4 rounded-[10px] bg-danger-light p-3 text-[12px] text-danger">{error}</p>}
          <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">Generating a new OTP invalidates the previous code. Five incorrect attempts lock the current OTP.</p>
        </section>
      </main>
    </div>
  )
}
