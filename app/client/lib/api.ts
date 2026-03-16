export function getApiUrl(): string {
  if (
    typeof process.env.NEXT_PUBLIC_API_URL === "string" &&
    process.env.NEXT_PUBLIC_API_URL.length > 0
  ) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const authApi = {
  login: () => `${getApiUrl()}/auth/login`,
  signup: () => `${getApiUrl()}/auth/signup`,
  google: () => `${getApiUrl()}/auth/google`,
  discord: () => `${getApiUrl()}/auth/discord`,
};
