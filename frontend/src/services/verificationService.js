import api from './api'

export const requestPhoneOtp = async () => {
  const response = await api.post('/verifications/phone/request-otp')
  return response.data
}

export const verifyPhoneOtp = async (otp) => {
  const response = await api.post('/verifications/phone/verify-otp', { otp })
  return response.data
}

export const submitTravelerVerification = async (verificationData) => {
  const response = await api.post('/verifications/submit', verificationData)
  return response.data
}

export const getMyVerification = async () => {
  const response = await api.get('/verifications/me')
  return response.data
}

export const getPendingVerifications = async () => {
  const response = await api.get('/verifications/pending')
  return response.data
}

export const approveTravelerVerification = async (userId) => {
  const response = await api.patch(`/verifications/${userId}/approve`)
  return response.data
}

export const rejectTravelerVerification = async (userId, reason) => {
  const response = await api.patch(`/verifications/${userId}/reject`, { reason })
  return response.data
}
