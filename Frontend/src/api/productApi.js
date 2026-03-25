import axiosInstance from "./axiosInstance";

// GET all products
export const getProducts = () => {
  return axiosInstance.get("/ornaments");
};

// DELETE product
export const deleteProductApi = (id) => {
  return axiosInstance.delete(`/ornaments/${id}`);
};

// ADD product
export const addProduct = (data) => {
  return axiosInstance.post("/ornaments", data);
};

// UPDATE product
export const updateProduct = (id, data) => {
  return axiosInstance.put(`/ornaments/${id}`, data);
};