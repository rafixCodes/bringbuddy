import { useState } from 'react'
import {
  CheckCircle2, Star, Clock, ArrowRight, ChevronLeft, X, Shield,
  BarChart3, Loader2, MessageCircle, User,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type TravelerApplication, type MarketplaceRequest } from '../../lib/router'
import { useToast } from '../../lib/toast'

const TRUST_COLORS: Record<string, string> = {
  'High Trust': 'bg-success-light text-success border-success/25',
  'Trusted': 'bg-primary-light text-primary border-primary/25',
  'New': 'bg-divider text-ink-muted border-border',
}

function ApplicationCard({ app, onAccept, onCompare, onViewProfile, isComparing }: {
  app: TravelerApplication
  onAccept: () => void
  onCompare: () => void
  onViewProfile: () => void
  isComparing: boolean
}) {
  return (
    <div className={`rounded-[18px] border bg-white p-5 transition-all duration-200 ${
      isComparing ? 'border-primary shadow-[var(--shadow-e2)] -translate-y-0.5' : 'border-border hover:shadow-[var(--shadow-e1)]'
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center text-[14px] font-bold text-primary shrink-0">
          {app.travelerInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-ink">{app.travelerName}</p>
            {app.travelerVerified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                <CheckCircle2 size={9} /> Verified
              </span>
            )}
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${TRUST_COLORS[app.travelerTrustLevel]}`}>
              {app.travelerTrustLevel}
            </span>
          </div>
          <p className="text-[12px] text-ink-muted mt-0.5">
            {app.travelerRating} ★ · {app.travelerDeliveries} deliveries · {app.travelerCancellationRate} cancel rate
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[19px] font-bold text-ink">৳{app.proposedFee.toLocaleString()}</p>
          <p className="text-[10px] text-ink-muted">proposed fee</p>
        </div>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
          <p className="text-[10px] text-ink-muted">Trip</p>
          <p className="text-[12px] font-semibold text-ink">{app.tripFrom} → {app.tripTo}</p>
        </div>
        <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
          <p className="text-[10px] text-ink-muted">Date</p>
          <p className="text-[12px] font-semibold text-ink">{app.tripDate}</p>
        </div>
        <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
          <p className="text-[10px] text-ink-muted">Response</p>
          <p className="text-[12px] font-semibold text-ink">{app.travelerResponseTime}</p>
        </div>
      </div>

      {app.message && (
        <div className="rounded-[10px] bg-divider px-3 py-2.5 mb-4 text-[12px] text-ink-secondary italic">
          "{app.message}"
        </div>
      )}

      {app.status !== 'pending' && (
        <div className={`rounded-[10px] px-3 py-2 mb-3 text-[12px] font-semibold ${
          app.status === 'accepted' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
        }`}>
          {app.status === 'accepted' ? '✓ Traveler selected' : '✗ Declined'}
        </div>
      )}

      {app.status === 'pending' && (
        <div className="flex gap-2">
          <Button variant="primary" size="md" className="flex-1" trailingIcon={<ArrowRight size={13} />} onClick={onAccept}>
            Accept Traveler
          </Button>
          <Button
            variant={isComparing ? 'secondary' : 'ghost'}
            size="md"
            leadingIcon={<BarChart3 size={13} />}
            onClick={onCompare}
          >
            {isComparing ? 'Remove' : 'Compare'}
          </Button>
          <Button variant="ghost" size="md" leadingIcon={<User size={13} />} onClick={onViewProfile}>
            Profile
          </Button>
        </div>
      )}
    </div>
  )
}

function ConfirmModal({ app, req, onClose, onConfirm }: {
  app: TravelerApplication
  req: MarketplaceRequest
  onClose: () => void
  onConfirm: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] p-6 animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-bold text-primary">
            {app.travelerInitials}
          </div>
          <div>
            <p className="text-[16px] font-bold text-ink">Choose {app.travelerName.split(' ')[0]}?</p>
            <p className="text-[12px] text-ink-muted">{app.travelerRating} ★ · {app.travelerDeliveries} deliveries</p>
          </div>
        </div>
        <div className="rounded-[12px] bg-divider px-4 py-3 mb-5 flex flex-col gap-2">
          {[
            { label: 'Fee', value: `৳${app.proposedFee.toLocaleString()}` },
            { label: 'Route', value: `${req.from} → ${req.to}` },
            { label: 'Travel date', value: app.tripDate },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-[13px]">
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-semibold text-ink">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-ink-secondary mb-5 text-center">
          After choosing, you'll proceed to the Order Hub to secure payment and coordinate the delivery.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            trailingIcon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirming…' : 'Choose Traveler'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CompareDrawer({ apps, onClose, onAccept }: {
  apps: TravelerApplication[]
  onClose: () => void
  onAccept: (app: TravelerApplication) => void
}) {
  if (apps.length < 2) return null
  const fields: { label: string; getValue: (a: TravelerApplication) => string }[] = [
    { label: 'Rating', getValue: a => `${a.travelerRating} ★` },
    { label: 'Deliveries', getValue: a => `${a.travelerDeliveries}` },
    { label: 'Trust Level', getValue: a => a.travelerTrustLevel },
    { label: 'Cancel Rate', getValue: a => a.travelerCancellationRate },
    { label: 'Response', getValue: a => a.travelerResponseTime },
    { label: 'Proposed Fee', getValue: a => `৳${a.proposedFee.toLocaleString()}` },
    { label: 'Travel Date', getValue: a => a.tripDate },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[900px] bg-white rounded-t-[24px] shadow-[var(--shadow-e3)] max-h-[80vh] flex flex-col animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-[16px] font-bold text-ink">Compare Travelers</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-divider text-ink-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th className="text-left text-ink-muted font-semibold pr-6 pb-4 w-32">Criterion</th>
                  {apps.map(a => (
                    <th key={a.id} className="text-center pb-4 px-4">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary mx-auto mb-1">
                        {a.travelerInitials}
                      </div>
                      <p className="text-ink font-bold">{a.travelerName.split(' ')[0]}</p>
                      {a.travelerVerified && <p className="text-[10px] text-success">✓ Verified</p>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(f => (
                  <tr key={f.label} className="border-t border-border">
                    <td className="text-ink-muted py-3 pr-6 font-medium">{f.label}</td>
                    {apps.map(a => {
                      const val = f.getValue(a)
                      const isBest = f.label === 'Proposed Fee'
                        ? a.proposedFee === Math.min(...apps.map(x => x.proposedFee))
                        : f.label === 'Rating'
                        ? a.travelerRating === Math.max(...apps.map(x => x.travelerRating))
                        : f.label === 'Deliveries'
                        ? a.travelerDeliveries === Math.max(...apps.map(x => x.travelerDeliveries))
                        : false
                      return (
                        <td key={a.id} className="text-center py-3 px-4">
                          <span className={`${isBest ? 'font-bold text-success' : 'text-ink'}`}>{val}</span>
                          {isBest && <span className="text-[9px] text-success block">best</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end shrink-0">
          {apps.map(a => (
            <Button key={a.id} variant="primary" size="md" onClick={() => onAccept(a)}>
              Choose {a.travelerName.split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ApplicationsView() {
  const { navigate, viewingRequestId, marketplaceRequests, setMarketplaceRequests, setActiveOrder, setOrderDraft } = useRouter()
  const { toast } = useToast()
  const [confirmApp, setConfirmApp] = useState<TravelerApplication | null>(null)
  const [comparing, setComparing] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const req = marketplaceRequests.find(r => r.id === viewingRequestId) ?? marketplaceRequests[0]
  const applications = req.applications

  function toggleCompare(id: string) {
    setComparing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleViewProfile(app: TravelerApplication) {
    setOrderDraft(prev => ({ ...prev, selectedTravelerId: app.travelerId }))
    navigate('traveler-profile')
  }

  function handleAccept(app: TravelerApplication) {
    setMarketplaceRequests(prev => prev.map(r =>
      r.id === req.id
        ? {
            ...r,
            status: 'traveler-selected',
            applications: r.applications.map(a =>
              a.id === app.id ? { ...a, status: 'accepted' } : { ...a, status: 'declined' }
            ),
          }
        : r
    ))

    setActiveOrder({
      id: `BB-${1060 + Math.floor(Math.random() * 100)}`,
      status: 'accepted',
      type: req.type,
      bookingMethod: 'marketplace',
      travelerId: app.travelerId,
      travelerName: app.travelerName,
      tripId: 'tr1',
      from: req.from,
      to: req.to,
      travelDate: app.tripDate,
      itemDescription: req.itemDescription ?? req.productName ?? 'Parcel',
      weightKg: req.weightKg ?? 0,
      pickupAddress: 'To be arranged',
      receiverName: 'Receiver TBD',
      carryingFee: app.proposedFee,
      serviceFee: Math.round(app.proposedFee * 0.08),
      senderName: req.senderName,
      productUrl: req.productUrl,
      quantity: req.quantity,
      budget: req.budget,
      specialInstructions: req.specialInstructions,
      timestamps: { accepted: new Date().toISOString() },
    })

    setConfirmApp(null)
    toast({ tone: 'success', title: '✅ Traveler selected!', message: `${app.travelerName} has been chosen. Opening Order Hub.` })
    setTimeout(() => navigate('order-hub'), 700)
  }

  const compareApps = applications.filter(a => comparing.includes(a.id))

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      {confirmApp && (
        <ConfirmModal
          app={confirmApp}
          req={req}
          onClose={() => setConfirmApp(null)}
          onConfirm={() => handleAccept(confirmApp)}
        />
      )}
      {compareOpen && compareApps.length >= 2 && (
        <CompareDrawer
          apps={compareApps}
          onClose={() => setCompareOpen(false)}
          onAccept={(app) => { setCompareOpen(false); setConfirmApp(app) }}
        />
      )}

      <main className="max-w-[1000px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <button
          onClick={() => navigate('marketplace-request')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Request
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[13px] text-ink-muted mb-0.5">{req.from} → {req.to} · {req.travelDate}</p>
            <h1 className="text-[26px] font-bold text-ink">Applications</h1>
            <p className="text-[14px] text-ink-secondary mt-0.5">{applications.length} traveler{applications.length > 1 ? 's' : ''} applied</p>
          </div>
          {comparing.length >= 2 && (
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<BarChart3 size={15} />}
              onClick={() => setCompareOpen(true)}
            >
              Compare {comparing.length} Travelers
            </Button>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <CheckCircle2 size={28} className="text-ink-muted mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-ink mb-1.5">No applications yet</h3>
            <p className="text-[14px] text-ink-secondary">Travelers will apply once they see your request. Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, i) => (
              <div key={app.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
                <ApplicationCard
                  app={app}
                  onAccept={() => setConfirmApp(app)}
                  onCompare={() => toggleCompare(app.id)}
                  onViewProfile={() => handleViewProfile(app)}
                  isComparing={comparing.includes(app.id)}
                />
              </div>
            ))}
          </div>
        )}

        {comparing.length === 1 && (
          <div className="mt-4 rounded-[12px] bg-info-light border border-info/20 px-4 py-3 text-[12px] text-ink-secondary text-center animate-[bb-rise_0.3s_ease_both]">
            Select one more traveler to compare side by side.
          </div>
        )}
      </main>
    </div>
  )
}
