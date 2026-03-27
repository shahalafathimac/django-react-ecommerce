import axiosInstance from "./axiosInstance";

export const getMyOrders = () => axiosInstance.get("/orders/");

export const createOrder = (data) => axiosInstance.post("/orders/", data);

export const getAllOrders = () => axiosInstance.get("/orders/admin/");

export const updateOrderStatus = (orderId, status) =>
  axiosInstance.patch(`/orders/${orderId}/status/`, { status });
