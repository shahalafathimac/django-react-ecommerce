import axiosInstance from "./axiosInstance";
import { clearTokens, getRefreshToken, storeTokens } from "./authStorage";

export const storeAuthData = (data) => {
  storeTokens(data || {});
};

export const clearAuthData = () => {
  clearTokens();
};

export const ensureCsrfCookie = () => axiosInstance.get("/users/csrf/");

export const loginUser = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/login/", data);
};

export const registerUser = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/register/", data);
};

export const forgotPassword = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/forgot-password/", data);
};

export const resetPassword = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/reset-password/", data);
};

export const logoutUser = async () => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/logout/", {
    refresh: getRefreshToken(),
  });
};

export const getProfile = () => axiosInstance.get("/users/profile/");

export const updateProfile = (data) => axiosInstance.put("/users/profile/", data);

export const getUsers = () => axiosInstance.get("/users/");

export const deleteUserApi = (id) => axiosInstance.delete(`/users/${id}/`);

export const updateUserStatus = (id, active) => axiosInstance.patch(`/users/${id}/`, { active });

export const updateUserRole = (id, role) => axiosInstance.patch(`/users/${id}/`, { role });

export const getUserById = (id) => axiosInstance.get(`/users/${id}/`);

export const updateUser = (id, data) => axiosInstance.patch(`/users/${id}/`, data);

export const createUser = (data) => axiosInstance.post("/users/", data);
