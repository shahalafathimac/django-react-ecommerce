import axios from "axios";

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
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
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
