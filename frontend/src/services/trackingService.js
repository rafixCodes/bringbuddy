import api from './api'

export async function getOrderTracking(orderId) {
  const response = await api.get(`/tracking/${orderId}`)
  return response.data
}

export async function updateOrderTrackingStatus(orderId, status, note = '') {
  const response = await api.patch(`/tracking/${orderId}/status`, { status, note })
  return response.data
}
