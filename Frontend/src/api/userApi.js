import axiosInstance from "./axiosInstance";

export const storeAuthData = () => {};

export const clearAuthData = () => {};

export const ensureCsrfCookie = () => axiosInstance.get("/users/csrf/");

export const loginUser = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/login/", data);
};

export const registerUser = async (data) => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/register/", data);
};

export const logoutUser = async () => {
  await ensureCsrfCookie();
  return axiosInstance.post("/users/logout/", {});
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
