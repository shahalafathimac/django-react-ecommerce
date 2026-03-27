import axios from "axios";

const baseURL = "/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        refreshPromise =
          refreshPromise ||
          axios.post(`${baseURL}/users/token/refresh/`, {
            refresh: refreshToken,
          });

        const refreshResponse = await refreshPromise;
        refreshPromise = null;

        localStorage.setItem("accessToken", refreshResponse.data.access);
        localStorage.setItem("refreshToken", refreshResponse.data.refresh);

        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
