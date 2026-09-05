import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';

import { AuthNavbar } from '../components/AuthNavbar';
import { Button, Card } from '../components/ui';
import { useToast } from '../lib/toast';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService';

const iconByType = {
  booking: PackageCheck,
  payment: CircleDollarSign,
  status: PackageCheck,
  review: Star,
  cancellation: XCircle,
  refund: CircleDollarSign,
  message: MessageSquareText,
};

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setError('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not load notifications.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const visibleNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.isRead);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (requestError) {
      toast({
        tone: 'error',
        title: 'Action failed',
        message:
          requestError.response?.data?.message ||
          'Could not mark notification as read.',
      });
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );

      toast({
        tone: 'success',
        title: 'Notifications updated',
        message: 'All notifications are marked as read.',
      });
    } catch (requestError) {
      toast({
        tone: 'error',
        title: 'Action failed',
        message:
          requestError.response?.data?.message ||
          'Could not mark notifications as read.',
      });
    }
  }

  async function handleDelete(notificationId) {
    try {
      await deleteNotification(notificationId);
      setNotifications((current) =>
        current.filter((item) => item._id !== notificationId)
      );
    } catch (requestError) {
      toast({
        tone: 'error',
        title: 'Delete failed',
        message:
          requestError.response?.data?.message ||
          'Could not delete notification.',
      });
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <AuthNavbar />

      <main className="mx-auto max-w-[960px] px-6 pb-16 pt-28 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              Activity Center
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-tight text-ink">
              Notifications
            </h1>
            <p className="mt-2 text-[15px] text-ink-secondary">
              Follow booking, order, payment, and account activity.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={loadNotifications}
              leadingIcon={<RefreshCw size={15} />}
            >
              Refresh
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              leadingIcon={<CheckCheck size={15} />}
            >
              Mark all read
            </Button>
          </div>
        </div>

        <Card className="mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'unread', label: `Unread (${unreadCount})` },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-[8px] px-3 py-2 text-[12px] font-semibold transition-colors ${
                    filter === option.value
                      ? 'bg-primary-light text-primary'
                      : 'text-ink-muted hover:bg-divider hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="text-[12px] text-ink-muted">
              {notifications.length} total
            </p>
          </div>

          {loading && (
            <div className="px-6 py-20 text-center text-[14px] text-ink-muted">
              Loading notifications...
            </div>
          )}

          {!loading && error && (
            <div className="m-5 rounded-[10px] border border-danger/20 bg-danger-light px-4 py-3 text-[13px] text-danger">
              {error}
            </div>
          )}

          {!loading && !error && visibleNotifications.length === 0 && (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-divider text-ink-muted">
                <Bell size={24} />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold text-ink">
                {filter === 'unread'
                  ? 'No unread notifications'
                  : 'No activity yet'}
              </h2>
              <p className="mt-1 max-w-sm text-[13px] text-ink-muted">
                Booking and delivery updates will appear here automatically.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            visibleNotifications.map((notification) => {
              const Icon = iconByType[notification.type] || Bell;

              return (
                <article
                  key={notification._id}
                  className={`flex items-start gap-4 border-b border-border px-5 py-5 last:border-b-0 ${
                    notification.isRead
                      ? 'bg-white'
                      : 'bg-primary-light/35'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[var(--shadow-e1)]">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h2 className="flex-1 text-[14px] font-semibold text-ink">
                        {notification.title || 'BringBuddy update'}
                      </h2>

                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] text-ink-muted">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification._id)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        className="flex h-8 w-8 items-center justify-center rounded-[7px] text-primary transition-colors hover:bg-primary-light"
                      >
                        <Check size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete notification"
                      aria-label="Delete notification"
                      className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-muted transition-colors hover:bg-danger-light hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
        </Card>
      </main>
    </div>
  );
}
