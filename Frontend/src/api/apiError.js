export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }
    if (typeof firstValue === "string" && firstValue.trim()) {
      return firstValue;
    }
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to contact server. Make sure the backend is running on http://127.0.0.1:8000.";
  }

  return fallback;
};
