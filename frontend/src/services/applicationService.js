import api from './api'

// Public marketplace applications
export const applyToOrder = async (orderId, payload) => {
  const response = await api.post(`/applications/${orderId}`, payload)
  return response.data
}

export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications')
  return response.data
}

export const getOrderApplications = async (orderId) => {
  const response = await api.get(`/applications/order/${orderId}`)
  return response.data
}

export const acceptApplication = async (applicationId) => {
  const response = await api.patch(`/applications/${applicationId}/accept`)
  return response.data
}

export const rejectApplication = async (applicationId) => {
  const response = await api.patch(`/applications/${applicationId}/reject`)
  return response.data
}

// Sender approaches travelers for an existing order
export const getDirectBookingOptions = async (orderId) => {
  const response = await api.get(`/applications/direct/options/${orderId}`)
  return response.data
}

export const getOrderDirectBookingRequests = async (orderId) => {
  const response = await api.get(`/applications/direct/order/${orderId}`)
  return response.data
}

export const sendDirectBookingRequest = async (orderId, payload) => {
  const response = await api.post(`/applications/direct/${orderId}`, payload)
  return response.data
}

// Traveler receives direct booking requests
export const getMyDirectBookingRequests = async () => {
  const response = await api.get('/applications/direct/my-requests')
  return response.data
}

export const acceptDirectBookingRequest = async (requestId) => {
  const response = await api.patch(`/applications/direct/${requestId}/accept`)
  return response.data
}

export const rejectDirectBookingRequest = async (requestId) => {
  const response = await api.patch(`/applications/direct/${requestId}/reject`)
  return response.data
}
