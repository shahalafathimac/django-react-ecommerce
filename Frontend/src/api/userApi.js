import axiosInstance from "./axiosInstance";

export const storeAuthData = (data) => {
  if (data?.access) {
    localStorage.setItem("accessToken", data.access);
  }

  if (data?.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const loginUser = (data) => axiosInstance.post("/users/login/", data);

export const registerUser = (data) => axiosInstance.post("/users/register/", data);

export const logoutUser = () =>
  axiosInstance.post("/users/logout/", {
    refresh: localStorage.getItem("refreshToken"),
  });

export const getProfile = () => axiosInstance.get("/users/profile/");

export const updateProfile = (data) => axiosInstance.put("/users/profile/", data);

export const getUsers = () => axiosInstance.get("/users/");

export const deleteUserApi = (id) => axiosInstance.delete(`/users/${id}/`);

export const updateUserStatus = (id, active) => axiosInstance.patch(`/users/${id}/`, { active });

export const updateUserRole = (id, role) => axiosInstance.patch(`/users/${id}/`, { role });

export const getUserById = (id) => axiosInstance.get(`/users/${id}/`);

export const updateUser = (id, data) => axiosInstance.patch(`/users/${id}/`, data);

export const createUser = (data) => axiosInstance.post("/users/", data);
