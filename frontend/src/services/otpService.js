import api from './api'

export async function getDeliveryOtpStatus(orderId) {
  const response = await api.get(`/delivery-otp/${orderId}`)
  return response.data
}

export async function generateDeliveryOtp(orderId) {
  const response = await api.post(`/delivery-otp/${orderId}/generate`)
  return response.data
}

export async function verifyDeliveryOtp(orderId, code) {
  const response = await api.post('/delivery-otp/verify', { orderId, code })
  return response.data
}
