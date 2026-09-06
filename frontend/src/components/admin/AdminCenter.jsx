import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, ShieldCheck, Users, Plane, Package,
  LogOut, Search, ChevronRight, Ban, RotateCcw, TrendingUp,
  Clock, AlertCircle, ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../lib/toast'
import {
  getOverview,
  getUsers,
  suspendUser,
  reactivateUser,
  getAdminTrips,
  disableTrip,
  enableTrip,
  getAdminOrders,
} from '../../services/adminService'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
  { key: 'verification', label: 'Verification', icon: <ShieldCheck size={15} />, external: '/admin/verifications' },
  { key: 'users', label: 'Users', icon: <Users size={15} /> },
  { key: 'trips', label: 'Trips', icon: <Plane size={15} /> },
  { key: 'orders', label: 'Orders', icon: <Package size={15} /> },
]

function messageFrom(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-[14px] border border-border bg-white p-5 border-l-4 ${color}`}>
      <p className="text-[26px] font-bold text-ink leading-none mb-1">{value}</p>
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      {sub && <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getOverview()
      .then(res => { if (mounted) setData(res) })
      .catch(err => { if (mounted) setError(messageFrom(err)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <p className="text-[13px] text-ink-muted">Loading overview…</p>
  if (error) return <p className="text-[13px] text-danger">{error}</p>
  if (!data) return null

  const { stats, recentSignups } = data

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-6">Platform Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} sub="Across all roles" color="border-l-primary" />
        <StatCard label="Pending Verification" value={stats.pendingVerification} sub="Awaiting review" color="border-l-warning" />
        <StatCard label="Active Orders" value={stats.activeOrders} sub="In progress" color="border-l-success" />
        <StatCard label="Total Trips" value={stats.totalTrips} sub={`${stats.suspendedUsers} users suspended`} color="border-l-coral" />
      </div>

      <div className="rounded-[16px] bg-white border border-border p-5">
        <p className="text-[14px] font-bold text-ink mb-4">Recent Signups</p>
        <div className="flex flex-col gap-2">
          {recentSignups.length === 0 && (
            <p className="text-[13px] text-ink-muted">No users yet.</p>
          )}
          {recentSignups.map(u => (
            <div key={u._id} className="flex items-center gap-3 text-[13px]">
              <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <Users size={12} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{u.name}</p>
                <p className="text-[11px] text-ink-muted">{u.currentMode || 'not set'} · {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                u.travelerInfo?.verificationStatus === 'approved' ? 'bg-success-light text-success' :
                u.travelerInfo?.verificationStatus === 'pending' ? 'bg-warning-light text-warning' :
                'bg-divider text-ink-muted'
              }`}>{u.travelerInfo?.verificationStatus || 'not_submitted'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UsersView() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async (term) => {
    setLoading(true)
    try {
      const res = await getUsers(term)
      setUsers(res.users)
    } catch (err) {
      toast({ tone: 'error', title: 'Failed to load users', message: messageFrom(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300)
    return () => clearTimeout(timeout)
  }, [search, load])

  const STATUS_CLS = {
    approved: 'bg-success-light text-success',
    pending: 'bg-warning-light text-warning',
    rejected: 'bg-danger-light text-danger',
    not_submitted: 'bg-divider text-ink-muted',
  }

  async function toggleSuspend(user) {
    setBusyId(user._id)
    try {
      if (user.isSuspended) {
        await reactivateUser(user._id)
        toast({ tone: 'success', title: 'User reactivated', message: 'Account is now active.' })
      } else {
        await suspendUser(user._id)
        toast({ tone: 'info', title: 'User suspended', message: 'User has been suspended.' })
      }
      const updated = { ...user, isSuspended: !user.isSuspended }
      setUsers(prev => prev.map(u => u._id === user._id ? updated : u))
      if (detail?._id === user._id) setDetail(updated)
    } catch (err) {
      toast({ tone: 'error', title: 'Action failed', message: messageFrom(err) })
    } finally {
      setBusyId('')
    }
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
                  {detail.isSuspended && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger-light text-danger">SUSPENDED</span>}
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLS[detail.travelerInfo?.verificationStatus || 'not_submitted']}`}>
                    {detail.travelerInfo?.verificationStatus || 'not_submitted'}
                  </span>
                </div>
                <p className="text-[12px] text-ink-muted mt-0.5">{detail.email} · Joined {new Date(detail.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Mode', value: detail.currentMode || 'not set' },
                { label: 'Deliveries', value: detail.travelerInfo?.completedDeliveries ?? 0 },
                { label: 'Trust Score', value: detail.travelerInfo?.trustScore ?? 0 },
              ].map(r => (
                <div key={r.label} className="rounded-[12px] bg-divider px-4 py-3 text-center">
                  <p className="text-[16px] font-bold text-ink">{r.value}</p>
                  <p className="text-[11px] text-ink-muted">{r.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant={detail.isSuspended ? 'secondary' : 'ghost'}
                size="lg"
                className={`flex-1 ${detail.isSuspended ? '' : 'border-danger/40 text-danger hover:bg-danger-light'}`}
                leadingIcon={detail.isSuspended ? <RotateCcw size={14} /> : <Ban size={14} />}
                disabled={busyId === detail._id}
                onClick={() => toggleSuspend(detail)}
              >
                {detail.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
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
          {loading ? (
            <p className="text-[13px] text-ink-muted">Loading…</p>
          ) : (
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="divide-y divide-border">
                {users.length === 0 && (
                  <p className="text-[13px] text-ink-muted px-5 py-6">No users found.</p>
                )}
                {users.map(u => (
                  <div key={u._id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                      <Users size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-ink">{u.name}</p>
                        {u.isSuspended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-danger-light text-danger">SUSPENDED</span>}
                      </div>
                      <p className="text-[12px] text-ink-muted">{u.email} · {u.currentMode || 'not set'} · {u.travelerInfo?.completedDeliveries ?? 0} deliveries</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_CLS[u.travelerInfo?.verificationStatus || 'not_submitted']}`}>
                      {u.travelerInfo?.verificationStatus || 'not_submitted'}
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
          )}
        </>
      )}
    </div>
  )
}

function TripsView() {
  const { toast } = useToast()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  const STATUS_CLS = {
    published: 'bg-success-light text-success',
    draft: 'bg-divider text-ink-muted',
    full: 'bg-primary-light text-primary',
    completed: 'bg-divider text-ink-muted',
    cancelled: 'bg-danger-light text-danger',
  }

  const load = useCallback(async (mountedRef) => {
    setLoading(true)
    try {
      const res = await getAdminTrips()
      if (!mountedRef || mountedRef.current) setTrips(res.trips)
    } catch (err) {
      if (!mountedRef || mountedRef.current) {
        toast({ tone: 'error', title: 'Failed to load trips', message: messageFrom(err) })
      }
    } finally {
      if (!mountedRef || mountedRef.current) setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const mountedRef = { current: true }
    load(mountedRef)
    return () => { mountedRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggle(trip) {
    setBusyId(trip._id)
    try {
      if (trip.status === 'cancelled') {
        await enableTrip(trip._id)
        toast({ tone: 'success', title: 'Trip re-enabled', message: 'The trip is now active again.' })
        setTrips(prev => prev.map(t => t._id === trip._id ? { ...t, status: 'published' } : t))
      } else {
        await disableTrip(trip._id)
        toast({ tone: 'info', title: 'Trip disabled', message: 'The trip has been taken offline.' })
        setTrips(prev => prev.map(t => t._id === trip._id ? { ...t, status: 'cancelled' } : t))
      }
    } catch (err) {
      toast({ tone: 'error', title: 'Action failed', message: messageFrom(err) })
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-6">Trips</h2>
      {loading ? (
        <p className="text-[13px] text-ink-muted">Loading…</p>
      ) : (
        <div className="rounded-[16px] border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border">
            {trips.length === 0 && (
              <p className="text-[13px] text-ink-muted px-5 py-6">No trips yet.</p>
            )}
            {trips.map(t => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
                <div className="w-9 h-9 rounded-[9px] bg-primary-light flex items-center justify-center shrink-0">
                  <Plane size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink">{t.departureCity} → {t.destinationCity}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[t.status] || STATUS_CLS.draft}`}>{t.status}</span>
                  </div>
                  <p className="text-[12px] text-ink-muted">
                    {t.traveler?.name || 'Unknown traveler'} · {new Date(t.travelDate).toLocaleDateString()} · {t.luggageCapacityKg} kg capacity
                  </p>
                </div>
                <button
                  onClick={() => toggle(t)}
                  disabled={busyId === t._id}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-[8px] transition-colors disabled:opacity-50 ${
                    t.status === 'cancelled'
                      ? 'text-success hover:bg-success-light'
                      : 'text-danger hover:bg-danger-light'
                  }`}
                >
                  {t.status === 'cancelled' ? 'Re-enable' : 'Disable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrdersView() {
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const STATUS_CLS = {
    delivered: 'bg-success-light text-success',
    completed: 'bg-success-light text-success',
    in_transit: 'bg-primary-light text-primary',
    payment_held: 'bg-primary-light text-primary',
    cancelled: 'bg-danger-light text-danger',
  }

  useEffect(() => {
    let mounted = true
    getAdminOrders()
      .then(res => { if (mounted) setOrders(res.orders) })
      .catch(err => { if (mounted) toast({ tone: 'error', title: 'Failed to load orders', message: messageFrom(err) }) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <h2 className="text-[20px] font-bold text-ink mb-2">Orders</h2>
      <p className="text-[13px] text-ink-secondary mb-6">Read-only monitoring view.</p>
      {loading ? (
        <p className="text-[13px] text-ink-muted">Loading…</p>
      ) : (
        <div className="rounded-[16px] border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border">
            {orders.length === 0 && (
              <p className="text-[13px] text-ink-muted px-5 py-6">No orders yet.</p>
            )}
            {orders.map(o => (
              <div key={o._id} className="flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors">
                <div className="w-9 h-9 rounded-[9px] bg-primary-light flex items-center justify-center shrink-0">
                  <Package size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{o.orderType === 'shopping' ? 'Shopping' : 'Parcel'} order</p>
                  <p className="text-[12px] text-ink-muted">
                    {o.sender?.name || 'Unknown sender'} → {o.traveler?.name || 'Unassigned'} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_CLS[o.status] || 'bg-divider text-ink-muted'}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminCenter() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { toast } = useToast()
  const [view, setView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleExit() {
    logout()
    navigate('/')
    toast({ tone: 'info', title: 'Logged out', message: 'Exited admin mode.' })
  }

  function handleNavClick(item) {
    if (item.external) {
      navigate(item.external)
      return
    }
    setView(item.key)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#1a1d23] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition-all text-left w-full relative ${
                  view === item.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleExit}
            className="flex items-center gap-3 w-full rounded-[9px] px-3 py-2.5 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">
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
        </header>

        <main className="flex-1 p-6 max-w-[960px] w-full mx-auto">
          {view === 'overview' && <Overview />}
          {view === 'users' && <UsersView />}
          {view === 'trips' && <TripsView />}
          {view === 'orders' && <OrdersView />}
        </main>
      </div>
    </div>
  )
}