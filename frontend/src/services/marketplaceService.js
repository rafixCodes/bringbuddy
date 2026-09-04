import api from './api';

export const getMarketplaceOrders = async (tripId = '') => {
  const response = await api.get('/marketplace/orders', {
    params: tripId ? { tripId } : {},
  });

  return response.data;
};