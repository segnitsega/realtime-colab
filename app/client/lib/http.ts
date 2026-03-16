import axios from "axios";
import { getApiUrl } from "./api";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: false,
});

// Attach access token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = window.localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = window.localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  if (!refreshPromise) {
    isRefreshing = true;
    refreshPromise = api
      .get("/auth/refresh", {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((res) => {
        const newToken = res.data?.token as string | undefined;
        if (newToken) {
          window.localStorage.setItem("token", newToken);
          return newToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized, try refresh once then retry the original request
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      }

      // Refresh failed – clear tokens and optionally redirect later
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("refreshToken");
    }

    return Promise.reject(error);
  },
);

export { api };

