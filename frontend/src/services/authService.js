import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const completeOnboarding = async (mode) => {
  const response = await api.post("/auth/onboarding", { mode });
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};