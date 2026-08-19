import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import { completeOnboarding } from '../services/authService'
import {
  ChevronDown, User, LogOut, Settings, Bell,
  Package, Plane, ShoppingBag, ArrowLeftRight, ShieldCheck,
} from 'lucide-react'

function ModeToggle({ mode, onSwitch }) {
  const other = mode === 'sender' ? 'traveler' : 'sender'
  const otherLabel = mode === 'sender' ? 'Traveler' : 'Sender'

  return (
    <div className="flex items-center gap-1.5 rounded-[8px] border border-border bg-divider p-1">
      <div className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-all ${
        mode === 'sender' ? 'bg-white shadow-[var(--shadow-e1)] text-primary' : 'text-ink-muted'
      }`}>
        <Package size={12} />
        <span className="hidden sm:inline">Sender</span>
      </div>
      <button
        onClick={() => onSwitch(other)}
        title={`Switch to ${otherLabel} mode`}
        aria-label={`Switch to ${otherLabel} mode — switching modes does not create a new account`}
        className="flex items-center justify-center w-5 h-5 rounded-[4px] hover:bg-white/60 transition-colors text-ink-muted hover:text-ink"
      >
        <ArrowLeftRight size={10} />
      </button>
      <div className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-all ${
        mode === 'traveler' ? 'bg-white shadow-[var(--shadow-e1)] text-coral' : 'text-ink-muted'
      }`}>
        <Plane size={12} />
        <span className="hidden sm:inline">Traveler</span>
      </div>
    </div>
  )
}

function ProfileDropdown({ onClose, onSwitchMode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  function handleLogout() {
    logout()
    navigate('/')
    toast({ tone: 'info', title: 'Logged out', message: 'You have been signed out.' })
    onClose()
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-64 rounded-[14px] bg-white shadow-[var(--shadow-e3)] border border-border overflow-hidden z-50 animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
          </div>
        </div>
        {user?.travelerInfo?.verificationStatus === 'approved' && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-success">
            <ShieldCheck size={12} /> Verified Traveler
          </div>
        )}
        {user?.travelerInfo?.verificationStatus === 'pending' && (
          <div className="mt-2.5 text-[11px] text-warning font-medium">⏳ Verification under review</div>
        )}
      </div>

      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-2">Current Mode</p>
        <div className="flex flex-col gap-1">
          {['sender', 'traveler'].map(m => (
            <button
              key={m}
              onClick={() => { onSwitchMode(m); onClose() }}
              className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all ${
                user?.currentMode === m ? (m === 'sender' ? 'bg-primary-light text-primary' : 'bg-coral-light text-coral') : 'text-ink-secondary hover:bg-divider'
              }`}
            >
              {m === 'sender' ? <Package size={14} /> : <Plane size={14} />}
              {m === 'sender' ? 'Sender' : 'Traveler'}
              {user?.currentMode === m && <span className="ml-auto text-[10px] font-bold opacity-60">ACTIVE</span>}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-muted mt-2 text-center">Switching modes does not create a new account.</p>
      </div>

      <div className="py-1.5">
        {[
          { icon: <User size={14} />, label: 'Profile', action: () => { navigate('/profile'); onClose() } },
          { icon: <Settings size={14} />, label: 'Settings', action: () => { navigate('/profile'); onClose() } },
          ...(user?.currentMode === 'traveler' ? [{ icon: <ShoppingBag size={14} />, label: 'Earnings', action: () => { navigate('/earnings'); onClose() } }] : []),
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors"
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="border-t border-border py-1.5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-danger hover:bg-danger-light transition-colors"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  )
}

function NotificationPanel() {
  // Placeholder events — Notifications feature (15) not built on backend yet.
  const events = [
    { time: '2:31 PM', text: 'Sample notification — feature not yet built', icon: '🔔' },
  ]
  return (
    <div className="absolute right-0 top-full mt-2 w-72 rounded-[14px] bg-white shadow-[var(--shadow-e3)] border border-border overflow-hidden z-50 animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">Notifications</p>
        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Today</span>
      </div>
      <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
        {events.map(e => (
          <div key={e.text} className="flex items-start gap-3 px-4 py-3 hover:bg-divider transition-colors">
            <span className="text-base mt-0.5">{e.icon}</span>
            <div className="min-w-0">
              <p className="text-[12px] text-ink leading-snug">{e.text}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-border text-center">
        <span className="text-[12px] text-ink-muted">Full activity center coming soon</span>
      </div>
    </div>
  )
}

export function AuthNavbar() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleModeSwitch(m) {
    try {
      await completeOnboarding(m)
      await refreshUser()
      toast({ tone: 'info', title: `Switched to ${m === 'sender' ? 'Sender' : 'Traveler'} mode`, message: 'One account, two ways to participate.' })
      navigate(m === 'sender' ? '/sender-dashboard' : '/traveler-dashboard')
    } catch (error) {
      const message = error.response?.data?.message || 'Could not switch modes. Please try again.'
      toast({ tone: 'error', title: 'Something went wrong', message })
    }
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled ? 'border-b border-border bg-white/90 backdrop-blur-md' : 'border-b border-transparent bg-white'
    }`}>
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-10 gap-4">
        <button onClick={() => navigate(user?.currentMode === 'traveler' ? '/traveler-dashboard' : '/sender-dashboard')} className="rounded-lg transition-opacity hover:opacity-80">
          <Logo />
        </button>

        <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
          {(user?.currentMode === 'traveler' ? [
            { label: 'Dashboard', path: '/traveler-dashboard' },
            { label: 'My Trips', path: '/my-trips' },
            { label: 'Marketplace', path: '/marketplace' },
            { label: 'Earnings', path: '/earnings' },
          ] : [
            { label: 'Dashboard', path: '/sender-dashboard' },
            { label: 'Find a Trip', path: '/trip-search' },
            { label: 'Marketplace', path: '/marketplace' },
            { label: 'My Orders', path: '/order-history' },
          ]).map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-ink-secondary hover:text-primary hover:bg-primary-light transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && <ModeToggle mode={user.currentMode} onSwitch={handleModeSwitch} />}

          <div className="relative">
            <button
              onClick={() => setNotifOpen(s => !s)}
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-divider transition-colors"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral border-2 border-white" aria-label="Unread notifications" />
            </button>
            {notifOpen && <NotificationPanel />}
          </div>

          <div ref={dropRef} className="relative">
            <button
              onClick={() => setDropdownOpen(s => !s)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-2.5 py-1.5 hover:border-primary/30 hover:shadow-[var(--shadow-e1)] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span className="hidden sm:block text-[13px] font-medium text-ink max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
              <ChevronDown size={13} className={`text-ink-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && <ProfileDropdown onClose={() => setDropdownOpen(false)} onSwitchMode={handleModeSwitch} />}
          </div>
        </div>
      </nav>
    </header>
  )
}