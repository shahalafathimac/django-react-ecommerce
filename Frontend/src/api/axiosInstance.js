import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.port === "5173"
    ? "http://127.0.0.1:8000/api"
    : "/api");

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/users/token/refresh/") &&
      !originalRequest?.url?.includes("/users/login/") &&
      !originalRequest?.url?.includes("/users/register/")
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          axios.post(
            `${baseURL}/users/token/refresh/`,
            {},
            { withCredentials: true }
          );

        await refreshPromise;
        refreshPromise = null;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
