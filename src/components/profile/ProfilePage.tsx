import { useState } from 'react'
import {
  User, Shield, CheckCircle2, Star, Package, Plane, Bell,
  ChevronRight, ArrowRight, ChevronLeft,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter } from '../../lib/router'
import { useToast } from '../../lib/toast'

const TRUST_BG: Record<string, string> = {
  'High Trust': 'bg-success-light text-success border-success/25',
  'Trusted': 'bg-primary-light text-primary border-primary/25',
  'New': 'bg-divider text-ink-muted border-border',
}

type ProfileTab = 'overview' | 'settings' | 'security'

export function ProfilePage() {
  const { navigate, user } = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState<ProfileTab>('overview')
  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    tripRequests: true,
    payments: true,
    marketing: false,
  })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    toast({ tone: 'success', title: 'Settings saved', message: 'Your preferences have been updated.' })
    setTimeout(() => setSaved(false), 2000)
  }

  const verificationStatus = user?.verificationStatus ?? 'none'
  const isVerified = verificationStatus === 'approved'
  const isTraveler = user?.mode === 'traveler'

  const TRUST_LEVEL = 'High Trust'
  const REPUTATION = {
    rating: 4.9,
    completed: 38,
    cancellationRate: '2%',
    responseTime: '~15 min',
    memberSince: 'March 2025',
  }

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'security', label: 'Security' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate(isTraveler ? 'traveler-dashboard' : 'sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Dashboard
        </button>

        {/* Hero */}
        <div className="rounded-[20px] bg-white border border-border shadow-[var(--shadow-e1)] overflow-hidden mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="h-20" style={{ background: 'linear-gradient(135deg, #3157D5 0%, #4466e0 60%, #F9735B 100%)' }} />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-[var(--shadow-e2)] flex items-center justify-center shrink-0">
                <User size={26} className="text-primary" />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-bold text-ink">{user?.name ?? 'Your Name'}</h2>
                  {isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light rounded-full px-2 py-0.5">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 border ${TRUST_BG[TRUST_LEVEL]}`}>
                    {TRUST_LEVEL}
                  </span>
                </div>
                <p className="text-[12px] text-ink-muted mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Quick stats */}
            {isTraveler && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Rating', value: `${REPUTATION.rating} ★` },
                  { label: 'Deliveries', value: REPUTATION.completed },
                  { label: 'Response', value: REPUTATION.responseTime },
                  { label: 'Cancel Rate', value: REPUTATION.cancellationRate },
                ].map(s => (
                  <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2 text-center">
                    <p className="text-[14px] font-bold text-ink">{s.value}</p>
                    <p className="text-[10px] text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-[12px] bg-divider p-1 w-fit animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {TABS.map(t => (
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

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
            {/* Personal info */}
            <div className="rounded-[18px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-4">Personal Information</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Full name', value: user?.name ?? '—' },
                  { label: 'Email', value: user?.email ?? '—' },
                  { label: 'Member since', value: REPUTATION.memberSince },
                  { label: 'Current mode', value: isTraveler ? 'Traveler' : 'Sender' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-[13px] border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="text-ink-muted">{r.label}</span>
                    <span className="font-semibold text-ink">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="rounded-[18px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-4">Verification & Trust</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Identity Verified', done: isVerified },
                  { label: 'Phone Verified', done: true },
                  { label: 'Completed Deliveries', done: REPUTATION.completed > 0 },
                  { label: 'Good Response Rate', done: true },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2.5 text-[13px]">
                    <CheckCircle2 size={14} className={r.done ? 'text-success' : 'text-border'} />
                    <span className={r.done ? 'text-ink' : 'text-ink-muted'}>{r.label}</span>
                  </div>
                ))}
              </div>
              {!isVerified && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4"
                  trailingIcon={<ArrowRight size={14} />}
                  onClick={() => navigate('verification-intro')}
                >
                  Complete Verification
                </Button>
              )}
            </div>

            {/* Quick links */}
            <div className="rounded-[18px] bg-white border border-border overflow-hidden lg:col-span-2">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-bold text-ink">Quick Access</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {[
                  { icon: <Package size={15} className="text-primary" />, label: 'Order History', action: () => navigate('order-history') },
                  ...(isTraveler ? [
                    { icon: <Plane size={15} className="text-coral" />, label: 'My Trips', action: () => navigate('my-trips') },
                    { icon: <Star size={15} className="text-warning" />, label: 'Earnings', action: () => navigate('earnings') },
                  ] : []),
                  { icon: <Bell size={15} className="text-primary" />, label: 'Notifications', action: () => navigate('notifications') },
                  { icon: <Shield size={15} className="text-success" />, label: 'Verification Status', action: () => navigate('verification-intro') },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors border-b border-border last:border-0 sm:odd:border-r"
                  >
                    <div className="w-7 h-7 rounded-[7px] bg-divider flex items-center justify-center shrink-0">{item.icon}</div>
                    {item.label}
                    <ChevronRight size={13} className="ml-auto text-ink-muted" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="flex flex-col gap-5 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="rounded-[18px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-4">Notification Preferences</p>
              <div className="flex flex-col gap-4">
                {(Object.entries(notifSettings) as [keyof typeof notifSettings, boolean][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-ink capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-[11px] text-ink-muted">
                        {key === 'orderUpdates' ? 'Status changes, pickups, deliveries' :
                         key === 'tripRequests' ? 'New requests for your trips' :
                         key === 'payments' ? 'Escrow, earnings, and payout updates' :
                         'Product news and offers'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifSettings(p => ({ ...p, [key]: !p[key] }))}
                      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${val ? 'bg-primary' : 'bg-border'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${val ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-4">Preferences</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Language', value: 'English' },
                  { label: 'Currency', value: 'BDT (৳)' },
                  { label: 'Timezone', value: 'Asia/Dhaka (BST)' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center text-[13px] border-b border-border pb-2.5 last:border-0 last:pb-0">
                    <span className="text-ink-muted">{r.label}</span>
                    <button className="font-semibold text-primary hover:underline">{r.value}</button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              trailingIcon={saved ? <CheckCircle2 size={15} /> : undefined}
            >
              {saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        )}

        {tab === 'security' && (
          <div className="flex flex-col gap-5 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="rounded-[18px] bg-white border border-border p-5">
              <p className="text-[13px] font-bold text-ink mb-4">Account Security</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Password', value: '••••••••', action: 'Change' },
                  { label: 'Two-factor authentication', value: 'Enabled', action: 'Manage' },
                  { label: 'Active sessions', value: '1 device', action: 'View' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[13px] font-medium text-ink">{r.label}</p>
                      <p className="text-[11px] text-ink-muted">{r.value}</p>
                    </div>
                    <button className="text-[12px] text-primary font-medium hover:underline">{r.action}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] bg-danger-light border border-danger/20 px-5 py-4">
              <p className="text-[13px] font-semibold text-ink mb-1">Danger Zone</p>
              <p className="text-[12px] text-ink-secondary mb-3">Deleting your account is permanent. All data will be removed.</p>
              <Button variant="ghost" size="md" className="text-danger border-danger/40 hover:bg-danger-light">
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
