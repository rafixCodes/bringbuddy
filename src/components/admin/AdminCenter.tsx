import { useState } from 'react'
import React from 'react'
import {
  LayoutDashboard, ShieldCheck, Users, Plane, Package, AlertTriangle,
  XCircle, LogOut, Search, ChevronRight, CheckCircle2, X, Eye,
  Ban, RotateCcw, TrendingUp, Clock, AlertCircle, Plus,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '../ui'
import { useRouter, type AdminUser, type DisputeRecord } from '../../lib/router'
import { useToast } from '../../lib/toast'

type AdminView = 'overview' | 'verification' | 'users' | 'trips' | 'orders' | 'disputes' | 'restricted'

const NAV_ITEMS: { key: AdminView; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',     label: 'Overview',         icon: <LayoutDashboard size={15} /> },
  { key: 'verification', label: 'Verification',      icon: <ShieldCheck size={15} /> },
  { key: 'users',        label: 'Users',             icon: <Users size={15} /> },
  { key: 'trips',        label: 'Trips',             icon: <Plane size={15} /> },
  { key: 'orders',       label: 'Orders',            icon: <Package size={15} /> },
  { key: 'disputes',     label: 'Disputes',          icon: <AlertTriangle size={15} /> },
  { key: 'restricted',   label: 'Restricted Items',  icon: <XCircle size={15} /> },
]

// ─── shared types ─────────────────────────────────────────────────────────────

interface MockTrip {
  id: string; traveler: string; route: string; date: string
  capacity: number; used: number; status: 'active' | 'closed' | 'disabled'
}

interface MockOrder {
  id: string; route: string; sender: string; traveler: string
  type: string; status: string; amount: string; date: string
}

interface RestrictedItem {
  id: string; name: string; category: string; reason: string; enabled: boolean
}

// ─── seed data ─────────────────────────────────────────────────────────────────

const MOCK_TRIPS: MockTrip[] = [
  { id: 'TR-001', traveler: 'Aisha Rahman', route: 'Dhaka → London', date: '1 Sep 2026', capacity: 8, used: 6, status: 'active' },
  { id: 'TR-002', traveler: 'Karim Hossain', route: 'Dhaka → Singapore', date: '15 Sep 2026', capacity: 5, used: 2, status: 'active' },
  { id: 'TR-003', traveler: 'Priya Nair', route: 'London → Dhaka', date: '20 Sep 2026', capacity: 10, used: 10, status: 'closed' },
  { id: 'TR-004', traveler: 'Syed Imran', route: 'Dhaka → Dubai', date: '5 Oct 2026', capacity: 7, used: 0, status: 'active' },
]

const MOCK_ORDERS: MockOrder[] = [
  { id: 'BB-1048', route: 'Dhaka → London', sender: 'Alex Johnson', traveler: 'Aisha Rahman', type: 'Carry Only', status: 'completed', amount: '৳1,125', date: '28 Aug 2026' },
  { id: 'BB-1047', route: 'Dhaka → London', sender: 'Marcus Chen', traveler: 'Karim Hossain', type: 'Carry Only', status: 'in-transit', amount: '৳576', date: '1 Sep 2026' },
  { id: 'BB-1041', route: 'Dhaka → Singapore', sender: 'Rina Begum', traveler: 'Priya Nair', type: 'Shopping', status: 'completed', amount: '৳920', date: '22 Aug 2026' },
  { id: 'BB-1035', route: 'London → Dhaka', sender: 'Tom Clarke', traveler: 'Syed Imran', type: 'Carry Only', status: 'disputed', amount: '৳1,360', date: '14 Aug 2026' },
]

const INITIAL_RESTRICTED: RestrictedItem[] = [
  { id: 'r1', name: 'Firearms & Ammunition', category: 'Weapons', reason: 'Prohibited by all carriers', enabled: true },
  { id: 'r2', name: 'Narcotics / Controlled Substances', category: 'Drugs', reason: 'Illegal in transit countries', enabled: true },
  { id: 'r3', name: 'Counterfeit Goods', category: 'Fraud', reason: 'IP violation risk', enabled: true },
  { id: 'r4', name: 'Perishable / Live Animals', category: 'Biological', reason: 'Customs regulations', enabled: true },
  { id: 'r5', name: 'Lithium batteries (loose)', category: 'Hazmat', reason: 'Aviation safety', enabled: true },
  { id: 'r6', name: 'Currency over $10k', category: 'Financial', reason: 'Money laundering risk', enabled: false },
]

// ─── sub-views ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-[14px] border border-border bg-white p-5 border-l-4 ${color}`}>
      <p className="text-[26px] font-bold text-ink leading-none mb-1">{value}</p>
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      {sub && <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function Overview({ adminUsers, disputes }: { adminUsers: AdminUser[]; disputes: DisputeRecord[] }) {
  const pending = adminUsers.filter(u => u.verificationStatus === 'pending').length
  const openDisputes = disputes.filter(d => d.status === 'submitted' || d.status === 'under-review').length
  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-6">Platform Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={adminUsers.length} sub="Across all roles" color="border-l-primary" />
        <StatCard label="Pending Verification" value={pending} sub="Awaiting review" color="border-l-warning" />
        <StatCard label="Open Disputes" value={openDisputes} sub="Need attention" color="border-l-danger" />
        <StatCard label="Active Orders" value={2} sub="In transit" color="border-l-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[16px] bg-white border border-border p-5">
          <p className="text-[14px] font-bold text-ink mb-4">Recent Signups</p>
          <div className="flex flex-col gap-2">
            {adminUsers.slice(0, 4).map(u => (
              <div key={u.id} className="flex items-center gap-3 text-[13px]">
                <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <Users size={12} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{u.name}</p>
                  <p className="text-[11px] text-ink-muted">{u.mode} · {u.joinedAt}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  u.verificationStatus === 'approved' ? 'bg-success-light text-success' :
                  u.verificationStatus === 'pending' ? 'bg-warning-light text-warning' :
                  'bg-divider text-ink-muted'
                }`}>{u.verificationStatus}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] bg-white border border-border p-5">
          <p className="text-[14px] font-bold text-ink mb-4">Quick Stats</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Platform GMV (Aug)', value: '৳84,200', icon: <TrendingUp size={14} className="text-success" /> },
              { label: 'Avg delivery time', value: '3.2 days', icon: <Clock size={14} className="text-primary" /> },
              { label: 'Successful deliveries', value: '94%', icon: <CheckCircle2 size={14} className="text-success" /> },
              { label: 'Open disputes', value: `${openDisputes} of ${disputes.length}`, icon: <AlertCircle size={14} className="text-warning" /> },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-ink-secondary">{s.icon}{s.label}</div>
                <span className="font-bold text-ink">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VerificationQueue({ adminUsers, setAdminUsers }: { adminUsers: AdminUser[]; setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const { toast } = useToast()
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const queue = adminUsers.filter(u => u.verificationStatus === 'pending')

  function approve(id: string) {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, verificationStatus: 'approved' } : u))
    toast({ tone: 'success', title: 'User approved', message: 'Traveler verification approved successfully.' })
    setSelected(null)
  }
  function reject(id: string) {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, verificationStatus: 'rejected' } : u))
    toast({ tone: 'error', title: 'Verification rejected', message: 'User has been notified.' })
    setSelected(null)
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-2">Verification Queue</h2>
      <p className="text-[13px] text-ink-secondary mb-6">{queue.length} pending · {adminUsers.filter(u => u.verificationStatus === 'approved').length} approved</p>

      {selected ? (
        <div className="animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-4 font-medium transition-colors">
            <ArrowLeft size={14} /> Back to queue
          </button>
          <div className="rounded-[18px] bg-white border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-ink">{selected.name}</h3>
                <p className="text-[12px] text-ink-muted">{selected.email} · Joined {selected.joinedAt}</p>
              </div>
              <span className="ml-auto text-[11px] font-semibold px-3 py-1 rounded-full bg-warning-light text-warning">Pending</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Mode', value: selected.mode },
                { label: 'Deliveries', value: selected.completedDeliveries },
                { label: 'Trust', value: selected.trustLevel },
                { label: 'Documents', value: 'NID + Selfie' },
              ].map(r => (
                <div key={r.label} className="rounded-[12px] bg-divider px-4 py-3">
                  <p className="text-[11px] text-ink-muted mb-0.5">{r.label}</p>
                  <p className="text-[14px] font-bold text-ink">{r.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[12px] bg-divider px-4 py-3 mb-6">
              <p className="text-[12px] font-semibold text-ink mb-2">Submitted Documents (prototype)</p>
              <div className="flex gap-2">
                {['National ID (front)', 'National ID (back)', 'Selfie with ID'].map(d => (
                  <div key={d} className="flex-1 rounded-[8px] bg-border/40 px-2 py-3 text-center text-[10px] text-ink-muted">{d}</div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1 border-danger/40 text-danger hover:bg-danger-light" onClick={() => reject(selected.id)}>Reject</Button>
              <Button variant="primary" size="lg" className="flex-1" trailingIcon={<CheckCircle2 size={14} />} onClick={() => approve(selected.id)}>Approve</Button>
            </div>
          </div>
        </div>
      ) : queue.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center">
          <CheckCircle2 size={28} className="text-success mx-auto mb-3" />
          <h3 className="text-[18px] font-bold text-ink mb-1.5">Queue is clear</h3>
          <p className="text-[14px] text-ink-secondary">All pending verifications have been reviewed.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map(u => (
            <div key={u.id} className="rounded-[14px] bg-white border border-border p-4 flex items-center gap-4 hover:shadow-[var(--shadow-e1)] transition-all">
              <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center shrink-0">
                <Users size={16} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink">{u.name}</p>
                <p className="text-[12px] text-ink-muted">{u.email} · {u.mode} · Joined {u.joinedAt}</p>
              </div>
              <Button variant="secondary" size="md" trailingIcon={<Eye size={13} />} onClick={() => setSelected(u)}>Review</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UsersView({ adminUsers, setAdminUsers }: { adminUsers: AdminUser[]; setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<AdminUser | null>(null)

  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSuspend(id: string) {
    const u = adminUsers.find(u => u.id === id)
    const isSuspended = u?.accountStatus === 'suspended'
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, accountStatus: isSuspended ? 'active' : 'suspended' } : u))
    toast({ tone: 'info', title: isSuspended ? 'User reactivated' : 'User suspended', message: isSuspended ? 'Account is now active.' : 'User has been suspended.' })
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, accountStatus: isSuspended ? 'active' : 'suspended' } : prev)
  }

  const STATUS_CLS: Record<string, string> = {
    approved: 'bg-success-light text-success',
    pending: 'bg-warning-light text-warning',
    rejected: 'bg-danger-light text-danger',
    none: 'bg-divider text-ink-muted',
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      {detail ? (
        <div className="animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
          <button onClick={() => setDetail(null)} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-4 font-medium transition-colors">
            <ArrowLeft size={14} /> All Users
          </button>
          <div className="rounded-[18px] bg-white border border-border p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[17px] font-bold text-ink">{detail.name}</h3>
                  {detail.accountStatus === "suspended" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger-light text-danger">SUSPENDED</span>}
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLS[detail.verificationStatus]}`}>{detail.verificationStatus}</span>
                </div>
                <p className="text-[12px] text-ink-muted mt-0.5">{detail.email} · Joined {detail.joinedAt}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Mode', value: detail.mode },
                { label: 'Deliveries', value: detail.completedDeliveries },
                { label: 'Trust', value: detail.trustLevel },
              ].map(r => (
                <div key={r.label} className="rounded-[12px] bg-divider px-4 py-3 text-center">
                  <p className="text-[16px] font-bold text-ink">{r.value}</p>
                  <p className="text-[11px] text-ink-muted">{r.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant={detail.accountStatus === "suspended" ? 'secondary' : 'ghost'}
                size="lg"
                className={`flex-1 ${detail.accountStatus === "suspended" ? '' : 'border-danger/40 text-danger hover:bg-danger-light'}`}
                leadingIcon={detail.accountStatus === "suspended" ? <RotateCcw size={14} /> : <Ban size={14} />}
                onClick={() => toggleSuspend(detail.id)}
              >
                {detail.accountStatus === "suspended" ? 'Reactivate Account' : 'Suspend Account'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-[20px] font-bold text-ink">Users</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users…"
                className="rounded-[10px] border border-border bg-white pl-8 pr-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-52 transition-all"
              />
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-white overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                    <Users size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-ink">{u.name}</p>
                      {u.accountStatus === "suspended" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-danger-light text-danger">SUSPENDED</span>}
                    </div>
                    <p className="text-[12px] text-ink-muted">{u.email} · {u.mode} · {u.completedDeliveries} orders</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_CLS[u.verificationStatus]}`}>
                    {u.verificationStatus}
                  </span>
                  <button
                    onClick={() => setDetail(u)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:bg-primary-light hover:text-primary transition-colors shrink-0"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function TripsView({ trips, setTrips }: { trips: MockTrip[]; setTrips: (t: MockTrip[]) => void }) {
  const { toast } = useToast()
  const STATUS_CLS = {
    active: 'bg-success-light text-success',
    closed: 'bg-divider text-ink-muted',
    disabled: 'bg-danger-light text-danger',
  }

  function disableTrip(id: string) {
    setTrips(trips.map(t => t.id === id ? { ...t, status: 'disabled' as const } : t))
    toast({ tone: 'info', title: 'Trip disabled', message: 'The trip has been taken offline.' })
  }
  function enableTrip(id: string) {
    setTrips(trips.map(t => t.id === id ? { ...t, status: 'active' as const } : t))
    toast({ tone: 'success', title: 'Trip re-enabled', message: 'The trip is now active again.' })
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-6">Trips</h2>
      <div className="rounded-[16px] border border-border bg-white overflow-hidden">
        <div className="divide-y divide-border">
          {trips.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
              <div className="w-9 h-9 rounded-[9px] bg-primary-light flex items-center justify-center shrink-0">
                <Plane size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-ink">{t.route}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-[12px] text-ink-muted">{t.traveler} · {t.date} · {t.used}/{t.capacity} kg used</p>
              </div>
              <button
                onClick={() => t.status === 'disabled' ? enableTrip(t.id) : disableTrip(t.id)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-[8px] transition-colors ${
                  t.status === 'disabled'
                    ? 'text-success hover:bg-success-light'
                    : 'text-danger hover:bg-danger-light'
                }`}
              >
                {t.status === 'disabled' ? 'Re-enable' : 'Disable'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrdersView() {
  const STATUS_CLS: Record<string, string> = {
    completed: 'bg-success-light text-success',
    'in-transit': 'bg-primary-light text-primary',
    disputed: 'bg-danger-light text-danger',
    cancelled: 'bg-divider text-ink-muted',
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-6">Orders</h2>
      <div className="rounded-[16px] border border-border bg-white overflow-hidden">
        <div className="divide-y divide-border">
          {MOCK_ORDERS.map(o => (
            <div key={o.id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
              <div className="w-9 h-9 rounded-[9px] bg-divider flex items-center justify-center shrink-0">
                <Package size={14} className="text-ink-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-semibold text-ink">#{o.id}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[o.status] ?? 'bg-divider text-ink-muted'}`}>{o.status}</span>
                </div>
                <p className="text-[12px] text-ink-muted">{o.route} · {o.sender} → {o.traveler} · {o.type}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold text-ink">{o.amount}</p>
                <p className="text-[11px] text-ink-muted">{o.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DisputesView({ disputes, setDisputes }: { disputes: DisputeRecord[]; setDisputes: React.Dispatch<React.SetStateAction<DisputeRecord[]>> }) {
  const { toast } = useToast()
  const [selected, setSelected] = useState<DisputeRecord | null>(null)
  const [resolution, setResolution] = useState('')

  const STATUS_CLS: Record<string, string> = {
    submitted: 'bg-warning-light text-warning',
    'under-review': 'bg-primary-light text-primary',
    resolved: 'bg-success-light text-success',
    closed: 'bg-divider text-ink-muted',
  }

  function resolveDispute(id: string, outcome: string) {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution: outcome } : d))
    toast({ tone: 'success', title: 'Dispute resolved', message: 'Both parties have been notified.' })
    setSelected(null)
    setResolution('')
  }

  function markUnderReview(id: string) {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'under-review' } : d))
    toast({ tone: 'info', title: 'Marked as Under Review', message: 'Status updated.' })
    setSelected(prev => prev ? { ...prev, status: 'under-review' } : prev)
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-4 font-medium transition-colors">
            <ArrowLeft size={14} /> All Disputes
          </button>
          <div className="rounded-[18px] bg-white border border-border p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[17px] font-bold text-ink">{selected.id}</h3>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLS[selected.status]}`}>{selected.status}</span>
                </div>
                <p className="text-[12px] text-ink-muted">Order #{selected.orderId} · {selected.issueType}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'Sender', value: selected.senderName },
                { label: 'Traveler', value: selected.travelerName },
                { label: 'Submitted', value: selected.submittedAt },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-[13px]">
                  <span className="text-ink-muted">{r.label}</span>
                  <span className="font-semibold text-ink">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[12px] bg-divider px-4 py-3 mb-5">
              <p className="text-[12px] font-semibold text-ink mb-1">Description</p>
              <p className="text-[13px] text-ink-secondary">{selected.description || 'No description provided.'}</p>
            </div>
            {selected.status !== 'resolved' && (
              <>
                <div className="mb-4">
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">Resolution notes</label>
                  <textarea
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    rows={3}
                    placeholder="Describe the resolution outcome…"
                    className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  {selected.status === 'submitted' && (
                    <Button variant="secondary" size="md" className="flex-1" onClick={() => markUnderReview(selected.id)}>
                      Mark Under Review
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={!resolution.trim()}
                    trailingIcon={<CheckCircle2 size={14} />}
                    onClick={() => resolveDispute(selected.id, resolution)}
                  >
                    Resolve Dispute
                  </Button>
                </div>
              </>
            )}
            {selected.status === 'resolved' && selected.resolution && (
              <div className="rounded-[12px] bg-success-light border border-success/20 px-4 py-3">
                <p className="text-[12px] font-semibold text-success mb-1">Resolution</p>
                <p className="text-[13px] text-ink">{selected.resolution}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-[20px] font-bold text-ink mb-6">Disputes</h2>
          {disputes.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center">
              <CheckCircle2 size={28} className="text-success mx-auto mb-3" />
              <h3 className="text-[18px] font-bold text-ink mb-1.5">No disputes</h3>
              <p className="text-[14px] text-ink-secondary">All disputes have been resolved.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {disputes.map(d => (
                <div key={d.id} className="rounded-[14px] bg-white border border-border p-4 flex items-center gap-4 hover:shadow-[var(--shadow-e1)] transition-all">
                  <div className="w-10 h-10 rounded-[10px] bg-warning-light flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-ink">{d.id}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[d.status]}`}>{d.status}</span>
                    </div>
                    <p className="text-[12px] text-ink-muted">Order #{d.orderId} · {d.issueType} · {d.senderName}</p>
                  </div>
                  <Button variant="secondary" size="md" onClick={() => setSelected(d)}>Review</Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RestrictedItemsView() {
  const [items, setItems] = useState<RestrictedItem[]>(INITIAL_RESTRICTED)
  const { toast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState({ name: '', category: '', reason: '' })

  function toggleItem(id: string) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, enabled: !it.enabled } : it))
    const it = items.find(i => i.id === id)
    toast({ tone: 'info', title: it?.enabled ? 'Item disabled' : 'Item enabled', message: `"${it?.name}" rule updated.` })
  }

  function addItem() {
    if (!draft.name || !draft.category) return
    setItems(prev => [...prev, { id: `r${Date.now()}`, ...draft, enabled: true }])
    setDraft({ name: '', category: '', reason: '' })
    setShowAdd(false)
    toast({ tone: 'success', title: 'Item added', message: `"${draft.name}" added to restricted list.` })
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-ink">Restricted Items</h2>
        <Button variant="primary" size="md" leadingIcon={<Plus size={14} />} onClick={() => setShowAdd(s => !s)}>
          Add Item
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-[16px] bg-white border border-border p-5 mb-5 animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
          <p className="text-[13px] font-bold text-ink mb-4">New Restricted Item</p>
          <div className="flex flex-col gap-3">
            <input
              value={draft.name}
              onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
              placeholder="Item name"
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              value={draft.category}
              onChange={e => setDraft(p => ({ ...p, category: e.target.value }))}
              placeholder="Category"
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              value={draft.reason}
              onChange={e => setDraft(p => ({ ...p, reason: e.target.value }))}
              placeholder="Reason (optional)"
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={addItem}>Add to List</Button>
          </div>
        </div>
      )}

      <div className="rounded-[16px] border border-border bg-white overflow-hidden">
        <div className="divide-y divide-border">
          {items.map(it => (
            <div key={it.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors ${!it.enabled ? 'opacity-50' : ''}`}>
              <div className="w-9 h-9 rounded-[9px] bg-danger-light flex items-center justify-center shrink-0">
                <XCircle size={14} className="text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink">{it.name}</p>
                <p className="text-[12px] text-ink-muted">{it.category} · {it.reason}</p>
              </div>
              <button
                onClick={() => toggleItem(it.id)}
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${it.enabled ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${it.enabled ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── main component ─────────────────────────────────────────────────────────────

export function AdminCenter() {
  const { navigate, setIsAdmin, adminUsers, setAdminUsers, disputes, setDisputes } = useRouter()
  const { toast } = useToast()
  const [view, setView] = useState<AdminView>('overview')
  const [trips, setTrips] = useState<MockTrip[]>(MOCK_TRIPS)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleExit() {
    setIsAdmin(false)
    navigate('home')
    toast({ tone: 'info', title: 'Exited admin mode', message: 'Returning to the public site.' })
  }

  const pendingVerif = adminUsers.filter(u => u.verificationStatus === 'pending').length
  const openDisputes = disputes.filter(d => d.status === 'submitted' || d.status === 'under-review').length

  const BADGE: Partial<Record<AdminView, number>> = {
    verification: pendingVerif,
    disputes: openDisputes,
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#1a1d23] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[7px] bg-primary flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white leading-none">BringBuddy</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setSidebarOpen(false) }}
                className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition-all text-left w-full relative ${
                  view === item.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
                {BADGE[item.key] ? (
                  <span className="ml-auto bg-coral text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                    {BADGE[item.key]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </nav>

        {/* Exit */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleExit}
            className="flex items-center gap-3 w-full rounded-[9px] px-3 py-2.5 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={15} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="lg:hidden w-8 h-8 rounded-[7px] flex items-center justify-center text-ink-muted hover:bg-divider"
            >
              <LayoutDashboard size={16} />
            </button>
            <div>
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Admin</p>
              <p className="text-[15px] font-bold text-ink">{NAV_ITEMS.find(n => n.key === view)?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-white bg-danger rounded-full px-2.5 py-1">PROTOTYPE ONLY</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-[960px] w-full mx-auto">
          {view === 'overview' && <Overview adminUsers={adminUsers} disputes={disputes} />}
          {view === 'verification' && <VerificationQueue adminUsers={adminUsers} setAdminUsers={setAdminUsers} />}
          {view === 'users' && <UsersView adminUsers={adminUsers} setAdminUsers={setAdminUsers} />}
          {view === 'trips' && <TripsView trips={trips} setTrips={setTrips} />}
          {view === 'orders' && <OrdersView />}
          {view === 'disputes' && <DisputesView disputes={disputes} setDisputes={setDisputes} />}
          {view === 'restricted' && <RestrictedItemsView />}
        </main>
      </div>
    </div>
  )
}
