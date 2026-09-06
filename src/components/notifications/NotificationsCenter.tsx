import React, { useState } from 'react'
import { Bell, CheckCircle2, Package, Plane, DollarSign, Settings, ArrowRight, ChevronLeft } from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type AppNotification } from '../../lib/router'
import { useToast } from '../../lib/toast'

type Category = 'all' | 'order' | 'trip' | 'payment' | 'system'

const CAT_ICONS: Record<string, React.ReactNode> = {
  order: <Package size={14} className="text-primary" />,
  trip: <Plane size={14} className="text-coral" />,
  payment: <DollarSign size={14} className="text-success" />,
  system: <Settings size={14} className="text-ink-muted" />,
}

function NotifCard({ notif, onRead, onNavigate }: {
  notif: AppNotification
  onRead: () => void
  onNavigate: () => void
}) {
  return (
    <div
      className={`group flex items-start gap-4 rounded-[14px] border p-4 cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-e1)] hover:-translate-y-0.5 ${
        notif.read ? 'border-border bg-white' : 'border-primary/25 bg-primary-light/40'
      }`}
      onClick={() => { onRead(); onNavigate() }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
        notif.read ? 'bg-divider' : 'bg-white shadow-[var(--shadow-e1)]'
      }`}>
        {notif.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[14px] ${notif.read ? 'font-medium text-ink' : 'font-bold text-ink'}`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
            <span className="text-[11px] text-ink-muted whitespace-nowrap">{notif.time}</span>
          </div>
        </div>
        <p className="text-[12px] text-ink-secondary mt-0.5 leading-snug">{notif.body}</p>
        {notif.action && (
          <p className="text-[11px] text-primary font-medium mt-1.5 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            View details <ArrowRight size={10} />
          </p>
        )}
      </div>
    </div>
  )
}

export function NotificationsCenter() {
  const { navigate, notifications, setNotifications, user } = useRouter()
  const { toast } = useToast()
  const [cat, setCat] = useState<Category>('all')

  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = cat === 'all' ? notifications : notifications.filter(n => n.type === cat)

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast({ tone: 'success', title: 'All caught up', message: 'All notifications marked as read.' })
  }

  function handleNavigate(notif: AppNotification) {
    if (notif.action) navigate(notif.action as any)
  }

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'order', label: 'Orders' },
    { key: 'trip', label: 'Trips' },
    { key: 'payment', label: 'Payments' },
    { key: 'system', label: 'System' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="max-w-[720px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate(user?.mode === 'traveler' ? 'traveler-dashboard' : 'sender-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-bold text-ink">Notifications</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-coral text-white text-[12px] font-bold px-2.5 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[14px] text-ink-secondary">Order, trip, payment, and platform updates.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="md" onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-1 mb-6 rounded-[12px] bg-divider p-1 w-fit animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`rounded-[9px] px-4 py-2 text-[13px] font-medium transition-all ${
                cat === c.key ? 'bg-white shadow-[var(--shadow-e1)] text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {filtered.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-white p-12 text-center animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
            <Bell size={28} className="text-ink-muted mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-ink mb-1.5">You're all caught up</h3>
            <p className="text-[14px] text-ink-secondary">You'll see order, trip, payment, and platform updates here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
            {/* Group by day */}
            {(['Today', 'Yesterday', 'Earlier'] as const).map(group => {
              const inGroup = filtered.filter(n => {
                if (group === 'Today') return ['2:31 PM', '2:40 PM', '10:42 AM'].includes(n.time)
                if (group === 'Yesterday') return n.time === 'Yesterday'
                return n.time === '2 days ago'
              })
              if (!inGroup.length) return null
              return (
                <div key={group} className="mb-4">
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-3 px-1">{group}</p>
                  <div className="flex flex-col gap-2">
                    {inGroup.map(n => (
                      <NotifCard
                        key={n.id}
                        notif={n}
                        onRead={() => markRead(n.id)}
                        onNavigate={() => handleNavigate(n)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
