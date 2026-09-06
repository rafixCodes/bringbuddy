import { useEffect, useState } from 'react'
import { ChevronLeft, Loader2, Star } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthNavbar } from '../AuthNavbar'
import { getReviewContext, submitReview } from '../../services/reviewService'

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2" aria-label="Rating from 1 to 5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          disabled={disabled}
          className="disabled:cursor-default"
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
        >
          <Star size={32} className={star <= value ? 'fill-warning text-warning' : 'text-border'} />
        </button>
      ))}
    </div>
  )
}

export function ReviewPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [context, setContext] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getReviewContext(orderId)
      .then(data => { if (!cancelled) setContext(data) })
      .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Could not load this review') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!rating) return setError('Choose a rating from 1 to 5 stars')
    setSaving(true)
    setError('')
    try {
      const data = await submitReview({ orderId, rating, comment })
      setContext(current => ({ ...current, canReview: false, myReview: data.review, reviewee: {
        ...current.reviewee,
        travelerInfo: { ...current.reviewee.travelerInfo, ...data.reputation }
      } }))
      setMessage('Your review was submitted successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit the review')
    } finally {
      setSaving(false)
    }
  }

  const existing = context?.myReview
  const displayedRating = existing?.rating || rating

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[720px] mx-auto px-6 pt-28 pb-20">
        <button onClick={() => navigate('/order-history')} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium">
          <ChevronLeft size={15} /> Back to My Orders
        </button>

        {loading ? (
          <div className="rounded-[16px] border border-border bg-white p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : error && !context ? (
          <div className="rounded-[16px] border border-danger/30 bg-white p-8 text-danger">{error}</div>
        ) : (
          <div className="rounded-[20px] border border-border bg-white p-7 shadow-sm">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary">Completed delivery</p>
            <h1 className="text-[28px] font-bold text-ink mt-2">Review {context.reviewee.name}</h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {context.order.pickup?.city} → {context.order.destination?.city} · You participated as {context.reviewerRole}.
            </p>

            <div className="rounded-[14px] bg-background p-4 mt-6 flex justify-between gap-4">
              <div><p className="text-[11px] text-ink-muted">Current rating</p><p className="font-semibold text-ink">{context.reviewee.travelerInfo?.averageRating || 0} ★</p></div>
              <div><p className="text-[11px] text-ink-muted">Reviews</p><p className="font-semibold text-ink">{context.reviewee.travelerInfo?.totalReviews || 0}</p></div>
              <div><p className="text-[11px] text-ink-muted">Trust score</p><p className="font-semibold text-ink">{context.reviewee.travelerInfo?.trustScore || 0}/100</p></div>
            </div>

            {context.order.status !== 'completed' ? (
              <p className="mt-6 rounded-[12px] bg-warning-light p-4 text-[14px] text-warning">This order must reach Completed status before either party can review it.</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7">
                <label className="block text-[14px] font-semibold text-ink mb-3">Your rating</label>
                <StarPicker value={displayedRating} onChange={setRating} disabled={!!existing} />
                <label className="block text-[14px] font-semibold text-ink mt-6 mb-2" htmlFor="review-comment">Comment <span className="font-normal text-ink-muted">(optional)</span></label>
                <textarea
                  id="review-comment"
                  rows={5}
                  maxLength={500}
                  value={existing?.comment ?? comment}
                  onChange={event => setComment(event.target.value)}
                  disabled={!!existing}
                  placeholder="Describe your experience with this delivery"
                  className="w-full rounded-[12px] border border-border p-3 text-[14px] outline-none focus:border-primary disabled:bg-background"
                />
                {!existing && <p className="text-right text-[11px] text-ink-muted mt-1">{comment.length}/500</p>}
                {error && <p className="text-[13px] text-danger mt-3">{error}</p>}
                {message && <p className="text-[13px] text-success mt-3">{message}</p>}
                {existing ? (
                  <p className="mt-5 rounded-[12px] bg-success-light p-4 text-[14px] text-success">You have already reviewed this delivery.</p>
                ) : (
                  <button disabled={saving || !context.canReview} className="mt-5 w-full rounded-[10px] bg-primary py-3 text-[14px] font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? 'Submitting…' : 'Submit review'}
                  </button>
                )}
              </form>
            )}

            {context.reviewAboutMe && (
              <div className="border-t border-border mt-7 pt-6">
                <h2 className="text-[16px] font-bold text-ink">Review you received</h2>
                <p className="text-warning mt-2">{'★'.repeat(context.reviewAboutMe.rating)}<span className="text-border">{'★'.repeat(5 - context.reviewAboutMe.rating)}</span></p>
                <p className="text-[14px] text-ink-secondary mt-2">{context.reviewAboutMe.comment || 'No written comment.'}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
