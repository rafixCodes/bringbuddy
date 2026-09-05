import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CircleDollarSign,
  MessageSquareText,
  PackageCheck,
  Star,
  XCircle,
} from 'lucide-react';

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';

const iconByType = {
  booking: PackageCheck,
  payment: CircleDollarSign,
  status: PackageCheck,
  review: Star,
  cancellation: XCircle,
  refund: CircleDollarSign,
  message: MessageSquareText,
};

function formatNotificationTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

export function NotificationPanel({ onClose, onUnreadChange }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const data = await getNotifications();

        if (!active) return;

        setNotifications(data.notifications || []);
        onUnreadChange?.(data.unreadCount || 0);
        setError('');
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError.response?.data?.message ||
            'Could not load notifications.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [onUnreadChange]);

  async function handleNotificationClick(notification) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );

        onUnreadChange?.((current) => Math.max(0, current - 1));
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Could not mark notification as read.'
        );
        return;
      }
    }

    onClose?.();
    navigate(notification.actionUrl || '/notifications');
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );

      onUnreadChange?.(0);
      setError('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not mark notifications as read.'
      );
    }
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-[14px] border border-border bg-white shadow-[var(--shadow-e3)] animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[13px] font-bold text-ink">Notifications</p>
          <p className="mt-0.5 text-[10px] text-ink-muted">
            Your latest BringBuddy activity
          </p>
        </div>

        {notifications.some((item) => !item.isRead) && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {loading && (
          <div className="px-4 py-10 text-center text-[12px] text-ink-muted">
            Loading notifications...
          </div>
        )}

        {!loading && error && (
          <div className="m-3 rounded-[8px] bg-danger-light px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-divider text-ink-muted">
              <Bell size={18} />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-ink">
              No notifications yet
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Booking and order updates will appear here.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.slice(0, 6).map((notification) => {
            const Icon = iconByType[notification.type] || Bell;

            return (
              <button
                type="button"
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-divider ${
                  notification.isRead ? 'bg-white' : 'bg-primary-light/45'
                }`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[var(--shadow-e1)]">
                  <Icon size={15} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2">
                    <span className="flex-1 text-[12px] font-semibold leading-snug text-ink">
                      {notification.title || 'BringBuddy update'}
                    </span>

                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </span>

                  <span className="mt-1 block text-[11px] leading-relaxed text-ink-secondary">
                    {notification.message}
                  </span>

                  <span className="mt-1 block text-[10px] text-ink-muted">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </span>
              </button>
            );
          })}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-center">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate('/notifications');
          }}
          className="text-[12px] font-semibold text-primary hover:text-primary-hover"
        >
          View activity center
        </button>
      </div>
    </div>
  );
}
