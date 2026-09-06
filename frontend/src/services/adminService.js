import api from "./api";

export const getOverview = async () => {
  const response = await api.get("/admin/overview");
  return response.data;
};

export const getUsers = async (search) => {
  const response = await api.get("/admin/users", { params: search ? { search } : {} });
  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const suspendUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/suspend`);
  return response.data;
};

export const reactivateUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/reactivate`);
  return response.data;
};

export const getAdminTrips = async () => {
  const response = await api.get("/admin/trips");
  return response.data;
};

export const disableTrip = async (id) => {
  const response = await api.patch(`/admin/trips/${id}/disable`);
  return response.data;
};

export const enableTrip = async (id) => {
  const response = await api.patch(`/admin/trips/${id}/enable`);
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await api.get("/admin/orders");
  return response.data;
};