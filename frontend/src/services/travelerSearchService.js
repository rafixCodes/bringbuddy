import api from './api'

export async function searchTravelerTrips(filters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => (
      value !== '' && value !== null && value !== undefined
    ))
  )

  const response = await api.get('/traveler-search', { params })
  return response.data
}
