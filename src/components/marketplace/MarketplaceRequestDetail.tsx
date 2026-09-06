import { useState } from 'react'
import {
  Package, ShoppingBag, CheckCircle2, Clock, ArrowRight, ChevronLeft,
  Shield, AlertCircle, Loader2, MessageCircle, ExternalLink, X, Plane,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type TravelerApplication, type MyTrip } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { getTravelerById, formatPostedAgo, daysApart } from '../../data/prototype'

const MATCH_WINDOW_DAYS = 14

function ApplyModal({ suggested, onClose, onSubmit }: {
  suggested?: number
  onClose: () => void
  onSubmit: (app: { fee: number; message: string }) => void
}) {
  const [fee, setFee] = useState(suggested ? String(suggested) : '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    const f = parseFloat(fee)
    if (!fee || isNaN(f) || f < 100) { setError('Please enter a valid carrying fee (min ৳100).'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    onSubmit({ fee: f, message })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[440px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] overflow-hidden animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-ink">Apply to Carry</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-divider text-ink-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Your Carrying Fee (৳)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted">৳</span>
              <input
                type="number"
                min={100}
                value={fee}
                onChange={e => { setFee(e.target.value); setError('') }}
                placeholder="e.g. 1,100"
                className="w-full rounded-[10px] border border-border bg-white pl-7 pr-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            {error && <p className="text-[11px] text-danger mt-1 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">Message to sender <span className="font-normal text-ink-muted">(optional)</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. I'll be flying to London on 28 Aug and can pick up in Dhanmondi."
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
          <div className="flex items-start gap-2 text-[12px] text-ink-secondary rounded-[10px] bg-info-light px-3 py-2.5">
            <Shield size={12} className="shrink-0 mt-0.5 text-info" />
            Your profile, rating, and verification status will be shared with the sender.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            trailingIcon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SuccessBanner({ senderName, onBack }: { senderName: string; onBack: () => void }) {
  return (
    <div className="rounded-[18px] bg-success-light border border-success/25 p-6 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 size={22} className="text-white" />
      </div>
      <h3 className="text-[18px] font-bold text-ink mb-1">Application sent!</h3>
      <p className="text-[13px] text-ink-secondary mb-4">
        <strong>{senderName}</strong> can now review your offer and compare you with other travelers.
      </p>
      <Button variant="secondary" size="md" onClick={onBack}>Browse More Requests</Button>
    </div>
  )
}

export function MarketplaceRequestDetail() {
  const {
    navigate, viewingRequestId, marketplaceRequests, setMarketplaceRequests,
    user, myTrips, currentTravelerId, currentSenderId,
  } = useRouter()
  const { toast } = useToast()
  const [applyOpen, setApplyOpen] = useState(false)
  const [applied, setApplied] = useState(false)

  const req = marketplaceRequests.find(r => r.id === viewingRequestId) ?? marketplaceRequests[0]
  const isTraveler = user?.mode === 'traveler'
  const isOwnRequest = req.senderId === currentSenderId
  const myApp = req.applications.find(a => a.travelerId === currentTravelerId)
  const alreadyApplied = !!myApp
  const isOpen = req.status === 'open'

  const matchedTrip: MyTrip | undefined = myTrips.find(t =>
    t.status === 'active' &&
    t.from === req.from &&
    t.to === req.to &&
    daysApart(t.date, req.travelDate) <= MATCH_WINDOW_DAYS
  )

  function handleApply({ fee, message }: { fee: number; message: string }) {
    const profile = getTravelerById(currentTravelerId)
    const name = user?.name ?? profile.name
    const app: TravelerApplication = {
      id: `app-${req.id}-${currentTravelerId}-${Date.now()}`,
      requestId: req.id,
      travelerId: currentTravelerId,
      travelerName: name,
      travelerInitials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      travelerVerified: profile.verified,
      travelerTrustLevel: profile.trustLevel,
      travelerRating: profile.rating,
      travelerDeliveries: profile.completedDeliveries,
      travelerCancellationRate: profile.cancellationRate,
      travelerResponseTime: profile.responseTime,
      proposedFee: fee,
      message: message || "I'll be flying on the travel date and can pick up at a convenient location.",
      status: 'pending',
      tripFrom: matchedTrip?.from ?? req.from,
      tripTo: matchedTrip?.to ?? req.to,
      tripDate: matchedTrip?.date ?? req.travelDate,
    }
    setMarketplaceRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, applications: [...r.applications, app] } : r
    ))
    setApplyOpen(false)
    setApplied(true)
    toast({ tone: 'success', title: '✅ Application submitted', message: `${req.senderName} can now review your offer.` })
  }

  function handleWithdraw() {
    if (!myApp) return
    setMarketplaceRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, applications: r.applications.filter(a => a.id !== myApp.id) } : r
    ))
    setApplied(false)
    toast({ tone: 'info', title: 'Application withdrawn', message: 'You can apply again while this request stays open.' })
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      {applyOpen && (
        <ApplyModal
          suggested={req.suggestedFee}
          onClose={() => setApplyOpen(false)}
          onSubmit={handleApply}
        />
      )}

      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <button
          onClick={() => navigate('marketplace')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Marketplace
        </button>

        {applied && (
          <SuccessBanner senderName={req.senderName} onBack={() => navigate('marketplace')} />
        )}

        {!applied && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 ${
                    req.type === 'carry-only' ? 'bg-primary-light' : 'bg-coral-light'
                  }`}>
                    {req.type === 'carry-only'
                      ? <Package size={22} className="text-primary" />
                      : <ShoppingBag size={22} className="text-coral" />
                    }
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-ink-muted mb-0.5">
                      {req.type === 'carry-only' ? 'Carry Only Request' : 'Shopping Request'}
                    </p>
                    <h2 className="text-[22px] font-bold text-ink">{req.from} → {req.to}</h2>
                    <p className="text-[13px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} /> Travel by {req.travelDate} · Posted {formatPostedAgo(req.postedHoursAgo)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {req.type === 'carry-only' ? (
                    <>
                      <div className="rounded-[12px] bg-divider px-4 py-3">
                        <p className="text-[11px] text-ink-muted mb-0.5">Weight</p>
                        <p className="text-[16px] font-bold text-ink">{req.weightKg} kg</p>
                      </div>
                      <div className="rounded-[12px] bg-divider px-4 py-3">
                        <p className="text-[11px] text-ink-muted mb-0.5">Suggested fee</p>
                        <p className="text-[16px] font-bold text-ink">৳{req.suggestedFee?.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-[12px] bg-divider px-4 py-3">
                        <p className="text-[11px] text-ink-muted mb-0.5">Budget</p>
                        <p className="text-[16px] font-bold text-ink">৳{req.budget?.toLocaleString()}</p>
                      </div>
                      <div className="rounded-[12px] bg-divider px-4 py-3">
                        <p className="text-[11px] text-ink-muted mb-0.5">Quantity</p>
                        <p className="text-[16px] font-bold text-ink">{req.quantity}</p>
                      </div>
                    </>
                  )}
                  <div className="rounded-[12px] bg-divider px-4 py-3">
                    <p className="text-[11px] text-ink-muted mb-0.5">Applications</p>
                    <p className="text-[16px] font-bold text-ink">{req.applications.length}</p>
                  </div>
                </div>

                {req.type === 'carry-only' && req.itemDescription && (
                  <div className="rounded-[12px] border border-border bg-divider px-4 py-3 mb-4">
                    <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Item Description</p>
                    <p className="text-[13px] text-ink">{req.itemDescription}</p>
                  </div>
                )}
                {req.type === 'shopping-request' && req.productName && (
                  <div className="rounded-[12px] border border-border bg-divider px-4 py-3 mb-4">
                    <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Product</p>
                    <p className="text-[14px] font-semibold text-ink">{req.productName}</p>
                    {req.productUrl && (
                      <a href={req.productUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[12px] text-primary mt-1 hover:underline">
                        <ExternalLink size={11} /> View product link
                      </a>
                    )}
                  </div>
                )}

                {req.specialInstructions && (
                  <div className="rounded-[12px] border border-border bg-warning-light/40 px-4 py-3">
                    <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Special Instructions</p>
                    <p className="text-[13px] text-ink-secondary">"{req.specialInstructions}"</p>
                  </div>
                )}
              </div>

              <div className="rounded-[20px] bg-white border border-border p-5">
                <p className="text-[13px] font-bold text-ink mb-3">Sender</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-bold text-primary">
                    {req.senderInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-ink">{req.senderName}</p>
                      {req.senderVerified && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                          <CheckCircle2 size={9} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-ink-muted">{req.senderRating} ★ · Trusted sender</p>
                  </div>
                </div>
                <p className="text-[12px] text-ink-muted mt-3 leading-snug bg-divider rounded-[10px] px-3 py-2">
                  Private contact details are only shared after a traveler is selected and order is accepted.
                </p>
              </div>

              {req.type === 'shopping-request' && (
                <div className="rounded-[16px] bg-coral-light border border-coral/20 px-5 py-4 flex items-start gap-3">
                  <ShoppingBag size={18} className="text-coral shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-ink mb-0.5">Shopping Request</p>
                    <p className="text-[12px] text-ink-secondary leading-snug">
                      The traveler will purchase this item abroad using the sender's budget and bring it to the destination. You'll receive the item cost + your carrying fee.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {isTraveler && (
                <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-6 sticky top-24">
                  {alreadyApplied ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={18} className="text-success" />
                        <p className="text-[14px] font-bold text-ink">Application submitted</p>
                      </div>
                      <p className="text-[12px] text-ink-secondary mb-4">
                        {req.senderName} is reviewing applications. You'll be notified if selected.
                      </p>
                      <div className="rounded-[12px] bg-divider px-4 py-3 mb-4">
                        <p className="text-[11px] text-ink-muted mb-0.5">Your proposed fee</p>
                        <p className="text-[18px] font-bold text-ink">৳{myApp.proposedFee.toLocaleString()}</p>
                      </div>
                      {isOpen && (
                        <Button variant="ghost" size="md" className="w-full mb-3" onClick={handleWithdraw}>
                          Withdraw Application
                        </Button>
                      )}
                      <Button variant="secondary" size="md" className="w-full" onClick={() => navigate('marketplace')}>
                        Browse More Requests
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] text-ink-muted mb-1">Apply to carry this</p>
                      {req.suggestedFee && (
                        <p className="text-[22px] font-bold text-ink mb-0.5">
                          ৳{req.suggestedFee.toLocaleString()} <span className="text-[13px] font-normal text-ink-muted">suggested</span>
                        </p>
                      )}
                      {req.budget && (
                        <p className="text-[22px] font-bold text-ink mb-0.5">
                          ৳{req.budget.toLocaleString()} <span className="text-[13px] font-normal text-ink-muted">budget</span>
                        </p>
                      )}
                      <p className="text-[12px] text-ink-secondary mb-4">{req.from} → {req.to} · {req.travelDate}</p>

                      {matchedTrip && (
                        <div className="flex items-start gap-2 rounded-[10px] bg-success-light border border-success/20 px-3 py-2.5 mb-4 text-[12px] text-success font-medium">
                          <Plane size={12} className="shrink-0 mt-0.5" />
                          Matches your trip on {matchedTrip.date} with {matchedTrip.capacityKg - matchedTrip.usedKg} kg free
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          trailingIcon={<ArrowRight size={15} />}
                          onClick={() => setApplyOpen(true)}
                          disabled={isOwnRequest || !isOpen}
                        >
                          Apply to Carry
                        </Button>
                        <Button variant="ghost" size="md" className="w-full" leadingIcon={<MessageCircle size={14} />}>
                          Message Sender
                        </Button>
                      </div>

                      {isOwnRequest && (
                        <p className="text-[11px] text-ink-muted mt-3 text-center">This is your own request.</p>
                      )}
                      {!isOwnRequest && !isOpen && (
                        <p className="text-[11px] text-ink-muted mt-3 text-center">This request is no longer accepting applications.</p>
                      )}
                    </>
                  )}
                  <div className="mt-4 flex flex-col gap-2 text-[12px] text-ink-secondary">
                    <div className="flex items-center gap-2"><Shield size={12} className="text-success" /> Escrow-protected</div>
                    {req.senderVerified && (
                      <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-success" /> Verified sender</div>
                    )}
                  </div>
                </div>
              )}

              {!isTraveler && (
                <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e2)] p-6 sticky top-24">
                  <p className="text-[14px] font-bold text-ink mb-2">{isOwnRequest ? 'Your Request' : 'This Request'}</p>
                  <p className="text-[13px] text-ink-secondary mb-4">
                    {req.applications.length === 0
                      ? 'No applications yet. Travelers will apply once they see this request.'
                      : `${req.applications.length} traveler${req.applications.length > 1 ? 's' : ''} have applied.`
                    }
                  </p>
                  {isOwnRequest && req.applications.length > 0 && (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full mb-3"
                      trailingIcon={<ArrowRight size={14} />}
                      onClick={() => navigate('applications-view')}
                    >
                      Review Applications
                    </Button>
                  )}
                  <Button variant="secondary" size="md" className="w-full" onClick={() => navigate('marketplace')}>
                    Back to Marketplace
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
