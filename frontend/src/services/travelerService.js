import api from "./api";

export const getTravelerProfile = async (id) => {
  const response = await api.get(`/travelers/${id}`);
  return response.data;
};