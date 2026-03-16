import axios, { type AxiosRequestHeaders } from "axios";
import { getApiUrl } from "./api";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = window.localStorage.getItem("token");
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = window.localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  if (!refreshPromise) {
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

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers =
          (originalRequest.headers as AxiosRequestHeaders | undefined) ??
          ({} as AxiosRequestHeaders);
        (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      window.localStorage.removeItem("token");
      window.localStorage.removeItem("refreshToken");
    }

    return Promise.reject(error);
  },
);

export { api };

