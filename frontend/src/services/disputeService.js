import api from './api';

export async function createDispute(data) {
  const response = await api.post('/disputes', data);
  return response.data;
}

export async function getMyDisputes() {
  const response = await api.get('/disputes/my');
  return response.data;
}

export async function getDisputeById(id) {
  const response = await api.get(`/disputes/${id}`);
  return response.data;
}

export async function getAllDisputes() {
  const response = await api.get('/disputes');
  return response.data;
}

export async function markDisputeUnderReview(id) {
  const response = await api.patch(`/disputes/${id}/review`);
  return response.data;
}

export async function resolveDispute(id, adminNotes) {
  const response = await api.patch(`/disputes/${id}/resolve`, {
    adminNotes,
  });

  return response.data;
}
