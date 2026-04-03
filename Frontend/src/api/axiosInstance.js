import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "./authStorage";

const baseURL = "/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !!refreshToken &&
      !originalRequest?.url?.includes("/users/token/refresh/") &&
      !originalRequest?.url?.includes("/users/login/") &&
      !originalRequest?.url?.includes("/users/register/") &&
      !originalRequest?.url?.includes("/users/logout/")
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          axios.post(
            `${baseURL}/users/token/refresh/`,
            { refresh: refreshToken },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

        const refreshResponse = await refreshPromise;
        refreshPromise = null;
        storeTokens(refreshResponse.data);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
