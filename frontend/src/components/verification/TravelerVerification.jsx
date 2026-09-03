import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '../ui'
import { Logo } from '../Logo'
import { useAuth } from '../../context/AuthContext'
import { completeOnboarding } from '../../services/authService'
import {
  getMyVerification,
  requestPhoneOtp,
  submitTravelerVerification,
  verifyPhoneOtp,
} from '../../services/verificationService'

const emptyForm = {
  idDocumentType: 'passport',
  idDocumentUrl: '',
  profilePhoto: '',
  emergencyName: '',
  emergencyPhone: '',
}

function messageFrom(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

function StatusPanel({ status, rejectionReason, onResubmit, onDashboard }) {
  const config = {
    pending: {
      icon: <Clock size={30} className="text-warning" />,
      title: 'Verification under review',
      text: 'Your documents were submitted successfully. An admin will review them before you can publish trips or accept orders.',
      box: 'bg-warning-light border-warning/25',
    },
    approved: {
      icon: <BadgeCheck size={30} className="text-success" />,
      title: 'Traveler verified',
      text: 'Your identity has been approved. You can now use verified traveler features.',
      box: 'bg-success-light border-success/25',
    },
    rejected: {
      icon: <AlertCircle size={30} className="text-danger" />,
      title: 'Verification needs changes',
      text: rejectionReason || 'The admin rejected this submission. Review your details and submit again.',
      box: 'bg-danger-light border-danger/25',
    },
  }
  const item = config[status]

  return (
    <div className={`rounded-[16px] border p-7 ${item.box}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">{item.icon}</div>
        <div>
          <h2 className="text-[21px] font-bold text-ink mb-2">{item.title}</h2>
          <p className="text-[14px] text-ink-secondary leading-relaxed">{item.text}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        {status === 'rejected' && (
          <Button variant="coral" onClick={onResubmit}>Correct and resubmit</Button>
        )}
        <Button variant="secondary" onClick={onDashboard}>Go to dashboard</Button>
      </div>
    </div>
  )
}

export function TravelerVerification() {
  const navigate = useNavigate()
  const { user, isLoading, refreshUser } = useAuth()
  const [verification, setVerification] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [otp, setOtp] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!user) return

    getMyVerification()
      .then(data => {
        setVerification(data.verification)
        setPhoneVerified(data.verification.phoneVerified)
        const info = data.verification.travelerInfo
        setForm({
          idDocumentType: info.idDocumentType || 'passport',
          idDocumentUrl: info.idDocumentUrl || '',
          profilePhoto: data.verification.profilePhoto || '',
          emergencyName: info.emergencyContact?.name || '',
          emergencyPhone: info.emergencyContact?.phone || '',
        })
      })
      .catch(err => setError(messageFrom(err)))
      .finally(() => setLoading(false))
  }, [user])

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!user) return <Navigate to="/login" replace />

  async function handleRequestOtp() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await requestPhoneOtp()
      setDemoOtp(data.demoOtp || '')
      setNotice('OTP generated successfully. It expires in 10 minutes.')
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await verifyPhoneOtp(otp)
      setPhoneVerified(true)
      setDemoOtp('')
      setNotice('Phone number verified successfully.')
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await submitTravelerVerification({
        idDocumentType: form.idDocumentType,
        idDocumentUrl: form.idDocumentUrl,
        profilePhoto: form.profilePhoto,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
        },
      })

      if (!user.hasCompletedOnboarding || user.currentMode !== 'traveler') {
        await completeOnboarding('traveler')
      }
      await refreshUser()
      const data = await getMyVerification()
      setVerification(data.verification)
      setShowForm(false)
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setBusy(false)
    }
  }

  function updateField(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const status = verification?.travelerInfo?.verificationStatus || 'not_submitted'
  const displayStatus = status !== 'not_submitted' && !showForm

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-5">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <Logo />
          <button onClick={() => navigate('/traveler-dashboard')} className="text-[13px] font-medium text-ink-muted hover:text-primary">
            Exit verification
          </button>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-[14px] bg-primary-light flex items-center justify-center mb-5">
            <ShieldCheck size={25} className="text-primary" />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary mb-2">Traveler trust onboarding</p>
          <h1 className="text-[32px] font-bold text-ink tracking-tight">Verify your traveler identity</h1>
          <p className="text-[15px] text-ink-secondary mt-2">Complete phone and identity checks before publishing trips or accepting orders.</p>
        </div>

        {loading ? (
          <div className="rounded-[16px] border border-border bg-white p-8 text-center text-ink-muted">Loading verification status...</div>
        ) : displayStatus ? (
          <StatusPanel
            status={status}
            rejectionReason={verification.travelerInfo.rejectionReason}
            onResubmit={() => setShowForm(true)}
            onDashboard={() => navigate('/traveler-dashboard')}
          />
        ) : (
          <div className="flex flex-col gap-5">
            <section className="rounded-[16px] border border-border bg-white p-6">
              <div className="flex items-center gap-3 mb-5">
                <Phone size={20} className="text-primary" />
                <div>
                  <h2 className="text-[17px] font-bold text-ink">1. Verify your phone</h2>
                  <p className="text-[13px] text-ink-muted">{verification?.phone}</p>
                </div>
                {phoneVerified && <CheckCircle2 size={20} className="text-success ml-auto" />}
              </div>

              {!phoneVerified && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                  <Button type="button" variant="secondary" onClick={handleRequestOtp} disabled={busy}>
                    Generate demo OTP
                  </Button>
                  {demoOtp && (
                    <div className="rounded-[10px] bg-info-light text-info px-4 py-3 text-[13px]">
                      Demo OTP: <strong className="tracking-widest">{demoOtp}</strong>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      value={otp}
                      onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="h-11 flex-1 rounded-[8px] border border-border px-3 text-[14px]"
                    />
                    <Button type="submit" disabled={busy || otp.length !== 6}>Verify</Button>
                  </div>
                </form>
              )}
            </section>

            <form onSubmit={handleSubmit} className="rounded-[16px] border border-border bg-white p-6">
              <div className="flex items-center gap-3 mb-5">
                <FileCheck2 size={20} className="text-coral" />
                <div>
                  <h2 className="text-[17px] font-bold text-ink">2. Identity and emergency details</h2>
                  <p className="text-[13px] text-ink-muted">Use demonstration image URLs for this course project.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-[13px] font-medium text-ink">
                  Document type
                  <select name="idDocumentType" value={form.idDocumentType} onChange={updateField} className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-white px-3">
                    <option value="passport">Passport</option>
                    <option value="nid">National ID</option>
                  </select>
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Passport/NID image URL
                  <input required type="url" name="idDocumentUrl" value={form.idDocumentUrl} onChange={updateField} placeholder="https://..." className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3" />
                </label>
                <label className="text-[13px] font-medium text-ink sm:col-span-2">
                  Profile photo URL
                  <input required type="url" name="profilePhoto" value={form.profilePhoto} onChange={updateField} placeholder="https://..." className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3" />
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Emergency contact name
                  <input required name="emergencyName" value={form.emergencyName} onChange={updateField} className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3" />
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Emergency contact phone
                  <input required name="emergencyPhone" value={form.emergencyPhone} onChange={updateField} className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3" />
                </label>
              </div>

              {error && <div className="mt-4 rounded-[10px] bg-danger-light text-danger px-4 py-3 text-[13px]">{error}</div>}
              {notice && <div className="mt-4 rounded-[10px] bg-success-light text-success px-4 py-3 text-[13px]">{notice}</div>}

              <Button
                type="submit"
                variant="coral"
                size="lg"
                className="w-full mt-5"
                disabled={busy || !phoneVerified}
                trailingIcon={<ArrowRight size={16} />}
              >
                {busy ? 'Submitting...' : 'Submit for admin review'}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
