import { useCallback, useEffect, useState } from 'react'
import { Check, FileCheck2, RefreshCw, ShieldCheck, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import {
  approveTravelerVerification,
  getPendingVerifications,
  rejectTravelerVerification,
} from '../../services/verificationService'

function messageFrom(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

export function AdminVerifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [reasons, setReasons] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const loadPending = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPendingVerifications()
      setItems(data.verifications)
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  async function approve(userId) {
    setBusyId(userId)
    setError('')
    try {
      await approveTravelerVerification(userId)
      setItems(current => current.filter(item => item._id !== userId))
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setBusyId('')
    }
  }

  async function reject(userId) {
    const reason = String(reasons[userId] || '').trim()
    if (!reason) {
      setError('Enter a rejection reason before rejecting this request.')
      return
    }

    setBusyId(userId)
    setError('')
    try {
      await rejectTravelerVerification(userId, reason)
      setItems(current => current.filter(item => item._id !== userId))
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to admin dashboard
        </button>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <ShieldCheck size={15} className="text-primary" />
          Admin
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-12 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary mb-2">Admin review</p>
            <h1 className="text-[30px] font-bold text-ink">Traveler verifications</h1>
            <p className="text-[14px] text-ink-secondary mt-1">Review identity, phone and emergency-contact information.</p>
          </div>
          <Button variant="secondary" onClick={loadPending} leadingIcon={<RefreshCw size={15} />}>Refresh</Button>
        </div>

        {error && <div className="mb-5 rounded-[10px] bg-danger-light text-danger px-4 py-3 text-[13px]">{error}</div>}

        {loading ? (
          <div className="rounded-[16px] border border-border bg-white p-10 text-center text-ink-muted">Loading requests...</div>
        ) : items.length === 0 ? (
          <div className="rounded-[16px] border border-border bg-white p-12 text-center">
            <ShieldCheck size={34} className="text-success mx-auto mb-3" />
            <h2 className="text-[18px] font-bold text-ink">No pending requests</h2>
            <p className="text-[13px] text-ink-muted mt-1">All traveler verification requests have been reviewed.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map(item => (
              <article key={item._id} className="rounded-[16px] border border-border bg-white p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                      <FileCheck2 size={22} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-ink">{item.name}</h2>
                      <p className="text-[13px] text-ink-muted">{item.email} · {item.phone}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-[13px]">
                        <p><span className="text-ink-muted">Phone:</span> <strong className="text-success">Verified</strong></p>
                        <p><span className="text-ink-muted">Document:</span> {item.travelerInfo.idDocumentType?.toUpperCase()}</p>
                        <p><span className="text-ink-muted">Emergency:</span> {item.travelerInfo.emergencyContact?.name}</p>
                        <p><span className="text-ink-muted">Emergency phone:</span> {item.travelerInfo.emergencyContact?.phone}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a href={item.travelerInfo.idDocumentUrl} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-primary hover:underline">View identity document</a>
                        <a href={item.profilePhoto} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-primary hover:underline">View profile photo</a>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-[320px] flex flex-col gap-3">
                    <input
                      value={reasons[item._id] || ''}
                      onChange={event => setReasons(current => ({ ...current, [item._id]: event.target.value }))}
                      placeholder="Reason required only for rejection"
                      className="h-10 rounded-[8px] border border-border px-3 text-[13px]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="danger" disabled={busyId === item._id} onClick={() => reject(item._id)} leadingIcon={<X size={15} />}>Reject</Button>
                      <Button disabled={busyId === item._id} onClick={() => approve(item._id)} leadingIcon={<Check size={15} />}>Approve</Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
