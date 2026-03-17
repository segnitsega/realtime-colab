import axios from "axios";
import { getApiUrl } from "./api";

const RETURN_PATH = "";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = api
      .get("/auth/refresh")
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api(originalRequest);
      }

      sessionStorage.setItem(
        RETURN_PATH,
        window.location.pathname + window.location.search,
      );

      window.location.href = "/auth/signin";
    }

    return Promise.reject(error);
  },
);

export default api;
