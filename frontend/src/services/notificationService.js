import api from './api';

function announceNotificationChange() {
  window.dispatchEvent(
    new Event('bringbuddy:notifications-changed')
  );
}

export async function getNotifications({ unreadOnly = false } = {}) {
  const response = await api.get('/notifications', {
    params: unreadOnly ? { unread: true } : {},
  });

  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  announceNotificationChange();
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all');
  announceNotificationChange();
  return response.data;
}

export async function deleteNotification(notificationId) {
  const response = await api.delete(
    `/notifications/${notificationId}`
  );

  announceNotificationChange();
  return response.data;
}
