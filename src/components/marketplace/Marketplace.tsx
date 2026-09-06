import { useState, useMemo } from 'react'
import {
  Search, Package, ShoppingBag, Filter, X, ArrowRight, CheckCircle2,
  Clock, ChevronDown, Globe, Plus, Plane,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type MarketplaceRequest, type MyTrip } from '../../lib/router'
import { formatPostedAgo, daysApart } from '../../data/prototype'

type Tab = 'all' | 'carry-only' | 'shopping-request'
type Scope = 'mine' | 'everyone'
type SortKey = 'newest' | 'travel-date' | 'highest-fee' | 'closest-match'

const MATCH_WINDOW_DAYS = 14

function requestValue(req: MarketplaceRequest) {
  return req.suggestedFee ?? req.budget ?? 0
}

function matchingTrip(req: MarketplaceRequest, trips: MyTrip[]) {
  let best: { trip: MyTrip; gap: number } | null = null
  for (const trip of trips) {
    if (trip.status !== 'active') continue
    if (trip.from !== req.from || trip.to !== req.to) continue
    const gap = daysApart(trip.date, req.travelDate)
    if (gap > MATCH_WINDOW_DAYS) continue
    if (!best || gap < best.gap) best = { trip, gap }
  }
  return best
}

function RequestCard({ req, onView, onReviewApplications, isTraveler, hasApplied, isMine, match }: {
  req: MarketplaceRequest
  onView: () => void
  onReviewApplications: () => void
  isTraveler: boolean
  hasApplied: boolean
  isMine: boolean
  match: { trip: MyTrip; gap: number } | null
}) {
  const statusLabel: Record<MarketplaceRequest['status'], string> = {
    open: 'Open',
    'traveler-selected': 'Traveler Selected',
    closed: 'Closed',
  }
  const statusCls: Record<MarketplaceRequest['status'], string> = {
    open: 'bg-success-light text-success',
    'traveler-selected': 'bg-warning-light text-warning',
    closed: 'bg-divider text-ink-muted',
  }

  return (
    <div className="rounded-[18px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
            req.type === 'carry-only' ? 'bg-primary-light' : 'bg-coral-light'
          }`}>
            {req.type === 'carry-only'
              ? <Package size={18} className="text-primary" />
              : <ShoppingBag size={18} className="text-coral" />
            }
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink-muted mb-0.5">
              {req.type === 'carry-only' ? 'Need a parcel carried' : 'Need help buying abroad'}
            </p>
            <p className="text-[16px] font-bold text-ink">{req.from} → {req.to}</p>
            <p className="text-[12px] text-ink-muted flex items-center gap-1 mt-0.5">
              <Clock size={11} /> Travel by {req.travelDate}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusCls[req.status]}`}>
            {statusLabel[req.status]}
          </span>
          {hasApplied && (
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold bg-primary-light text-primary">
              You applied
            </span>
          )}
        </div>
      </div>

      {match && (
        <div className="flex items-center gap-1.5 rounded-[10px] bg-success-light border border-success/20 px-3 py-2 mb-3 text-[12px] text-success font-medium">
          <Plane size={12} className="shrink-0" />
          Matches your {match.trip.from} → {match.trip.to} trip on {match.trip.date}
        </div>
      )}

      {req.type === 'carry-only' ? (
        <div className="flex gap-4 mb-4">
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Weight</p>
            <p className="text-[14px] font-bold text-ink">{req.weightKg} kg</p>
          </div>
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Suggested fee</p>
            <p className="text-[14px] font-bold text-ink">৳{req.suggestedFee?.toLocaleString()}</p>
          </div>
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Item</p>
            <p className="text-[12px] font-semibold text-ink truncate">{req.itemDescription}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-4">
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Product</p>
            <p className="text-[12px] font-semibold text-ink truncate">{req.productName}</p>
          </div>
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Budget</p>
            <p className="text-[14px] font-bold text-ink">৳{req.budget?.toLocaleString()}</p>
          </div>
          <div className="flex-1 rounded-[10px] bg-divider px-3 py-2">
            <p className="text-[11px] text-ink-muted">Qty</p>
            <p className="text-[14px] font-bold text-ink">{req.quantity}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 rounded-[10px] bg-divider px-3 py-2">
        <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
          {req.senderInitials}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-ink">{isMine ? 'You' : req.senderName}</p>
          {req.senderVerified && <CheckCircle2 size={11} className="text-success shrink-0" />}
          <span className="text-[11px] text-ink-muted ml-auto">{formatPostedAgo(req.postedHoursAgo)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={hasApplied ? 'secondary' : 'primary'}
          size="md"
          trailingIcon={<ArrowRight size={13} />}
          className="flex-1"
          onClick={onView}
        >
          {isTraveler && hasApplied ? 'View Application' : 'View Request'}
        </Button>
        {isMine && req.applications.length > 0 && (
          <Button variant="secondary" size="md" onClick={onReviewApplications}>
            {req.applications.length} application{req.applications.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </div>
  )
}

function FilterDrawer({ open, onClose, filters, setFilters }: {
  open: boolean
  onClose: () => void
  filters: { route: string; minFee: number; maxFee: number; verifiedOnly: boolean }
  setFilters: (f: typeof filters) => void
}) {
  const [local, setLocal] = useState(filters)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[340px] bg-white h-full shadow-[var(--shadow-e3)] animate-[bb-slide-right_0.25s_cubic-bezier(0.22,1,0.36,1)_both] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-[16px] font-bold text-ink">Filters</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-divider text-ink-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-2">Route (city)</label>
            <input
              type="text"
              value={local.route}
              onChange={e => setLocal(p => ({ ...p, route: e.target.value }))}
              placeholder="e.g. London"
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-2">Budget / Fee range (৳)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={local.minFee || ''}
                onChange={e => setLocal(p => ({ ...p, minFee: Number(e.target.value) }))}
                placeholder="Min"
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <input
                type="number"
                min={0}
                value={local.maxFee || ''}
                onChange={e => setLocal(p => ({ ...p, maxFee: Number(e.target.value) }))}
                placeholder="Max"
                className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-2">Leave blank for no limit.</p>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setLocal(p => ({ ...p, verifiedOnly: !p.verifiedOnly }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${local.verifiedOnly ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${local.verifiedOnly ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">Verified senders only</p>
                <p className="text-[11px] text-ink-muted">Only show requests from identity-verified senders</p>
              </div>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <Button variant="ghost" size="md" className="flex-1" onClick={() => setLocal({ route: '', minFee: 0, maxFee: 0, verifiedOnly: false })}>
            Reset
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={() => { setFilters(local); onClose() }}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Marketplace() {
  const {
    navigate, marketplaceRequests, user, myTrips,
    currentTravelerId, currentSenderId,
    setViewingRequestId, setOrderDraft,
  } = useRouter()
  const isTraveler = user?.mode === 'traveler'
  const [tab, setTab] = useState<Tab>('all')
  const [scope, setScope] = useState<Scope>('mine')
  const [sort, setSort] = useState<SortKey>(isTraveler ? 'closest-match' : 'newest')
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ route: '', minFee: 0, maxFee: 0, verifiedOnly: false })

  const myRequestCount = useMemo(
    () => marketplaceRequests.filter(r => r.senderId === currentSenderId).length,
    [marketplaceRequests, currentSenderId]
  )

  const effectiveSort: SortKey = !isTraveler && sort === 'closest-match' ? 'newest' : sort

  const filtered = useMemo(() => {
    let list = marketplaceRequests.filter(r => r.status !== 'closed')

    if (!isTraveler && scope === 'mine') list = list.filter(r => r.senderId === currentSenderId)
    if (isTraveler) list = list.filter(r => r.senderId !== currentSenderId)
    if (tab !== 'all') list = list.filter(r => r.type === tab)

    if (query) {
      const q = query.toLowerCase()
      list = list.filter(r =>
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q) ||
        r.itemDescription?.toLowerCase().includes(q)
      )
    }

    if (filters.route) {
      const route = filters.route.toLowerCase()
      list = list.filter(r => r.to.toLowerCase().includes(route) || r.from.toLowerCase().includes(route))
    }
    if (filters.verifiedOnly) list = list.filter(r => r.senderVerified)
    if (filters.minFee > 0) list = list.filter(r => requestValue(r) >= filters.minFee)
    if (filters.maxFee > 0) list = list.filter(r => requestValue(r) <= filters.maxFee)

    const sorted = [...list]
    switch (effectiveSort) {
      case 'travel-date':
        return sorted.sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
      case 'highest-fee':
        return sorted.sort((a, b) => requestValue(b) - requestValue(a))
      case 'closest-match':
        return sorted.sort((a, b) => {
          const ma = matchingTrip(a, myTrips)
          const mb = matchingTrip(b, myTrips)
          const ga = ma ? ma.gap : Number.POSITIVE_INFINITY
          const gb = mb ? mb.gap : Number.POSITIVE_INFINITY
          if (ga !== gb) return ga - gb
          return a.postedHoursAgo - b.postedHoursAgo
        })
      default:
        return sorted.sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
    }
  }, [marketplaceRequests, isTraveler, scope, currentSenderId, tab, query, filters, effectiveSort, myTrips])

  const activeFilters =
    (filters.route ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.minFee > 0 || filters.maxFee > 0 ? 1 : 0)

  function openRequest(req: MarketplaceRequest) {
    setViewingRequestId(req.id)
    navigate('marketplace-request')
  }

  function openApplications(req: MarketplaceRequest) {
    setViewingRequestId(req.id)
    navigate('applications-view')
  }

  function handlePostRequest() {
    setOrderDraft({ bookingMethod: 'marketplace' })
    navigate('order-new')
  }

  function resetSearch() {
    setQuery('')
    setFilters({ route: '', minFee: 0, maxFee: 0, verifiedOnly: false })
    setTab('all')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[13px] text-ink-muted mb-1">
              {isTraveler ? 'Find delivery & shopping requests' : 'Public delivery requests'}
            </p>
            <h1 className="text-[30px] font-bold text-ink tracking-tight">Marketplace</h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {isTraveler
                ? 'Browse open requests and apply to carry.'
                : 'Post a request and let travelers apply to carry for you.'}
            </p>
          </div>
          {!isTraveler && (
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Plus size={16} />}
              trailingIcon={<ArrowRight size={15} />}
              onClick={handlePostRequest}
            >
              Post a Request
            </Button>
          )}
        </div>

        {!isTraveler && (
          <div className="flex gap-1 mb-5 rounded-[12px] bg-divider p-1 w-fit animate-[bb-rise_0.42s_cubic-bezier(0.22,1,0.36,1)_both]">
            {([
              { key: 'mine', label: `My Requests${myRequestCount ? ` (${myRequestCount})` : ''}` },
              { key: 'everyone', label: 'All Requests' },
            ] as { key: Scope; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={`rounded-[9px] px-4 py-2 text-[13px] font-medium transition-all ${
                  scope === s.key ? 'bg-white shadow-[var(--shadow-e1)] text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search route, product, or destination…"
              className="w-full rounded-[10px] border border-border bg-white pl-9 pr-4 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium transition-all ${
              activeFilters ? 'border-primary bg-primary-light text-primary' : 'border-border bg-white text-ink-secondary hover:border-primary/40'
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
          <div className="relative">
            <select
              value={effectiveSort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="rounded-[10px] border border-border bg-white pl-3 pr-8 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="travel-date">Travel Date</option>
              <option value="highest-fee">Highest Fee</option>
              {isTraveler && <option value="closest-match">Closest Match</option>}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-1 mb-6 rounded-[12px] bg-divider p-1 w-fit animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {([
            { key: 'all', label: 'All' },
            { key: 'carry-only', label: 'Carry Only' },
            { key: 'shopping-request', label: 'Shopping Requests' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-[9px] px-4 py-2 text-[13px] font-medium transition-all ${
                tab === t.key ? 'bg-white shadow-[var(--shadow-e1)] text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <Globe size={28} className="text-ink-muted mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-ink mb-1.5">
              {!isTraveler && scope === 'mine' ? 'You have not posted a request yet' : 'No matching requests'}
            </h3>
            <p className="text-[14px] text-ink-secondary mb-5">
              {!isTraveler && scope === 'mine'
                ? 'Post a request and travelers going your route can apply with their fee.'
                : 'Try another route or check back later.'}
            </p>
            <div className="flex justify-center gap-3">
              {!isTraveler && scope === 'mine' ? (
                <Button variant="primary" size="md" leadingIcon={<Plus size={15} />} onClick={handlePostRequest}>
                  Post a Request
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={resetSearch}>
                  Adjust Search
                </Button>
              )}
              <Button variant="secondary" size="md" onClick={() => navigate(isTraveler ? 'my-trips' : 'trip-search')}>
                {isTraveler ? 'My Trips' : 'Browse Trips'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((req, i) => (
              <div key={req.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
                <RequestCard
                  req={req}
                  onView={() => openRequest(req)}
                  onReviewApplications={() => openApplications(req)}
                  isTraveler={isTraveler}
                  hasApplied={isTraveler && req.applications.some(a => a.travelerId === currentTravelerId)}
                  isMine={!isTraveler && req.senderId === currentSenderId}
                  match={isTraveler ? matchingTrip(req, myTrips) : null}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-[20px] bg-white border border-border p-6 animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <h3 className="text-[15px] font-bold text-ink mb-4">
            {isTraveler ? 'How Marketplace Works for Travelers' : 'How the Marketplace Works'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(isTraveler ? [
              { step: '1', title: 'Browse open requests', desc: 'Find carry or shopping requests that match your route.' },
              { step: '2', title: 'Apply with your fee', desc: 'Submit your proposed carrying fee and a short message.' },
              { step: '3', title: 'Get selected & earn', desc: 'Sender reviews applications and selects the best traveler.' },
            ] : [
              { step: '1', title: 'Post your request', desc: 'Describe what you need and set a suggested fee.' },
              { step: '2', title: 'Travelers apply', desc: 'Verified travelers submit applications with their proposed fees.' },
              { step: '3', title: 'Choose your traveler', desc: 'Compare applicants and select the one you trust most.' },
            ]).map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center shrink-0">{s.step}</div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{s.title}</p>
                  <p className="text-[12px] text-ink-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
