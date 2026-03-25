import axiosInstance from "./axiosInstance";

// Get all users
export const getUsers = () => {
  return axiosInstance.get("/users");
};

// Delete user
export const deleteUserApi = (id) => {
  return axiosInstance.delete(`/users/${id}`);
};

// Toggle status
export const updateUserStatus = (id, active) => {
  return axiosInstance.patch(`/users/${id}`, { active });
};

// Change role
export const updateUserRole = (id, role) => {
  return axiosInstance.patch(`/users/${id}`, { role });
};

// 🔹 Get single user
export const getUserById = (id) => {
  return axiosInstance.get(`/users/${id}`);
};

// 🔹 Update user (generic)
export const updateUser = (id, data) => {
  return axiosInstance.patch(`/users/${id}`, data);
};

// CREATE USER (Signup)
export const createUser = (data) => {
  return axiosInstance.post("/users", data);
};