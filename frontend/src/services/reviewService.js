import api from './api'

export async function getReviewContext(orderId) {
  const response = await api.get(`/reviews/orders/${orderId}`)
  return response.data
}

export async function submitReview(reviewData) {
  const response = await api.post('/reviews', reviewData)
  return response.data
}

export async function getUserReviews(userId) {
  const response = await api.get(`/reviews/users/${userId}`)
  return response.data
}
