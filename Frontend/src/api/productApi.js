import axiosInstance from "./axiosInstance";

export const getProducts = (params = {}) => axiosInstance.get("/products/", { params });

export const getProductById = (id) => axiosInstance.get(`/products/${id}/`);

export const deleteProductApi = (id) => axiosInstance.delete(`/products/delete/${id}/`);

export const addProduct = (data) => axiosInstance.post("/products/create/", data);

export const updateProduct = (id, data) => axiosInstance.put(`/products/update/${id}/`, data);
