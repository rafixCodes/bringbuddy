import api from './api'

export const getRestrictedItems = async () => {
  const response = await api.get('/restricted-items')
  return response.data
}

export const checkRestrictedItems = async (descriptions) => {
  const response = await api.post('/restricted-items/check', { descriptions })
  return response.data
}

export const addRestrictedItem = async (itemData) => {
  const response = await api.post('/restricted-items', itemData)
  return response.data
}

export const deleteRestrictedItem = async (id) => {
  const response = await api.delete(`/restricted-items/${id}`)
  return response.data
}
