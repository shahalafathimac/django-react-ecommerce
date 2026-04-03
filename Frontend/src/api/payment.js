import axiosInstance from "./axiosInstance";

export const createPaymentOrder = (payload) =>
  axiosInstance.post("/payments/create-order/", payload);

export const verifyPayment = (data) =>
  axiosInstance.post("/payments/verify-payment/", data);
