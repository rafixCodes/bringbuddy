import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../lib/toast';
import { completeOnboarding } from '../services/authService';

import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ClipboardCheck,
  LogOut,
  Package,
  Plane,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';

function ModeToggle({ mode, onSwitch }) {
  const other = mode === 'sender' ? 'traveler' : 'sender';
  const otherLabel =
    mode === 'sender' ? 'Traveler' : 'Sender';

  return (
    <div className="flex items-center gap-1.5 rounded-[8px] border border-border bg-divider p-1">
      <div
        className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-all ${
          mode === 'sender'
            ? 'bg-white text-primary shadow-[var(--shadow-e1)]'
            : 'text-ink-muted'
        }`}
      >
        <Package size={12} />
        <span className="hidden sm:inline">Sender</span>
      </div>

      <button
        type="button"
        onClick={() => onSwitch(other)}
        title={`Switch to ${otherLabel} mode`}
        aria-label={`Switch to ${otherLabel} mode`}
        className="flex h-5 w-5 items-center justify-center rounded-[4px] text-ink-muted transition-colors hover:bg-white/60 hover:text-ink"
      >
        <ArrowLeftRight size={10} />
      </button>

      <div
        className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-all ${
          mode === 'traveler'
            ? 'bg-white text-coral shadow-[var(--shadow-e1)]'
            : 'text-ink-muted'
        }`}
      >
        <Plane size={12} />
        <span className="hidden sm:inline">Traveler</span>
      </div>
    </div>
  );
}

function ProfileDropdown({ onClose, onSwitchMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleLogout() {
    logout();
    navigate('/');

    toast({
      tone: 'info',
      title: 'Logged out',
      message: 'You have been signed out.',
    });

    onClose();
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-[14px] border border-border bg-white shadow-[var(--shadow-e3)] animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <User size={16} className="text-primary" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">
              {user?.name}
            </p>

            <p className="truncate text-[11px] text-ink-muted">
              {user?.email}
            </p>
          </div>
        </div>

        {user?.travelerInfo?.verificationStatus ===
          'approved' && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-success">
            <ShieldCheck size={12} />
            Verified Traveler
          </div>
        )}

        {user?.travelerInfo?.verificationStatus ===
          'pending' && (
          <div className="mt-2.5 text-[11px] font-medium text-warning">
            Verification under review
          </div>
        )}
      </div>

      <div className="border-b border-border px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
          Current Mode
        </p>

        <div className="flex flex-col gap-1">
          {['sender', 'traveler'].map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => {
                onSwitchMode(mode);
                onClose();
              }}
              className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all ${
                user?.currentMode === mode
                  ? mode === 'sender'
                    ? 'bg-primary-light text-primary'
                    : 'bg-coral-light text-coral'
                  : 'text-ink-secondary hover:bg-divider'
              }`}
            >
              {mode === 'sender' ? (
                <Package size={14} />
              ) : (
                <Plane size={14} />
              )}

              {mode === 'sender' ? 'Sender' : 'Traveler'}

              {user?.currentMode === mode && (
                <span className="ml-auto text-[10px] font-bold opacity-60">
                  ACTIVE
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-2 text-center text-[10px] text-ink-muted">
          Switching modes does not create a new account.
        </p>
      </div>

      <div className="py-1.5">
        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink-secondary transition-colors hover:bg-divider hover:text-ink"
        >
          <User size={14} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink-secondary transition-colors hover:bg-divider hover:text-ink"
        >
          <Settings size={14} />
          Settings
        </button>

        {user?.currentMode === 'traveler' && (
          <button
            type="button"
            onClick={() => {
              navigate('/earnings');
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink-secondary transition-colors hover:bg-divider hover:text-ink"
          >
            <ShoppingBag size={14} />
            Earnings
          </button>
        )}
      </div>

      <div className="border-t border-border py-1.5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-danger transition-colors hover:bg-danger-light"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </div>
  );
}

function NotificationPanel() {
  const events = [
    {
      time: '2:31 PM',
      text: 'Sample notification — feature not yet built',
      icon: '🔔',
    },
  ];

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[14px] border border-border bg-white shadow-[var(--shadow-e3)] animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-[13px] font-bold text-ink">
          Notifications
        </p>

        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Today
        </span>
      </div>

      <div className="max-h-[280px] divide-y divide-border overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.text}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-divider"
          >
            <span className="mt-0.5 text-base">
              {event.icon}
            </span>

            <div className="min-w-0">
              <p className="text-[12px] leading-snug text-ink">
                {event.text}
              </p>

              <p className="mt-0.5 text-[11px] text-ink-muted">
                {event.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-center">
        <span className="text-[12px] text-ink-muted">
          Full activity center coming soon
        </span>
      </div>
    </div>
  );
}

export function AuthNavbar() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropRef.current &&
        !dropRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  async function handleModeSwitch(mode) {
    if (mode === user?.currentMode) {
      return;
    }

    try {
      await completeOnboarding(mode);
      await refreshUser();

      toast({
        tone: 'info',
        title: `Switched to ${
          mode === 'sender' ? 'Sender' : 'Traveler'
        } mode`,
        message: 'One account, two ways to participate.',
      });

      navigate(
        mode === 'sender'
          ? '/sender-dashboard'
          : '/traveler-dashboard'
      );
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Something went wrong',
        message:
          error.response?.data?.message ||
          'Could not switch modes. Please try again.',
      });
    }
  }

  const senderLinks = [
    {
      label: 'Dashboard',
      path: '/sender-dashboard',
    },
    {
      label: 'Find a Trip',
      path: '/trip-search',
    },
    {
      label: 'Booking Center',
      path: '/booking-center',
    },
    {
      label: 'My Orders',
      path: '/order-history',
    },
  ];

  const travelerLinks = [
    {
      label: 'Dashboard',
      path: '/traveler-dashboard',
    },
    {
      label: 'My Trips',
      path: '/trips/my',
    },
    {
      label: 'Marketplace',
      path: '/marketplace',
    },
    {
      label: 'Booking Requests',
      path: '/booking-center',
    },
  ];

  const navigationLinks =
    user?.currentMode === 'traveler'
      ? travelerLinks
      : senderLinks;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-white/90 backdrop-blur-md'
          : 'border-b border-transparent bg-white'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate(
              user?.currentMode === 'traveler'
                ? '/traveler-dashboard'
                : '/sender-dashboard'
            )
          }
          className="rounded-lg transition-opacity hover:opacity-80"
        >
          <Logo />
        </button>

        <div className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {navigationLinks.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => navigate(item.path)}
              className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-ink-secondary transition-colors hover:bg-primary-light hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <ModeToggle
              mode={user.currentMode}
              onSwitch={handleModeSwitch}
            />
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setNotifOpen((current) => !current)
              }
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-[8px] text-ink-muted transition-colors hover:bg-divider hover:text-ink"
            >
              <Bell size={17} />

              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-coral"
                aria-label="Unread notifications"
              />
            </button>

            {notifOpen && <NotificationPanel />}
          </div>

          <div ref={dropRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setDropdownOpen((current) => !current)
              }
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-2.5 py-1.5 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-e1)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light">
                <User size={14} className="text-primary" />
              </div>

              <span className="hidden max-w-[100px] truncate text-[13px] font-medium text-ink sm:block">
                {user?.name?.split(' ')[0]}
              </span>

              <ChevronDown
                size={13}
                className={`text-ink-muted transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <ProfileDropdown
                onClose={() => setDropdownOpen(false)}
                onSwitchMode={handleModeSwitch}
              />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}