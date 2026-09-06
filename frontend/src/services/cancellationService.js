import api from './api'

export async function getMyCancellationOrders() {
  const response = await api.get('/cancellations/my')
  return response.data
}

export async function cancelOrder(orderId, reason) {
  const response = await api.post(
    `/cancellations/${orderId}`,
    { reason }
  )

  return response.data
}

export async function recoverOrder(orderId, action) {
  const response = await api.post(
    `/cancellations/${orderId}/recover`,
    { action }
  )

  return response.data
}
