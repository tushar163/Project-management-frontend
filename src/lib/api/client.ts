import axios, { AxiosError } from "axios";
import { getCookie, removeCookie } from "typescript-cookie";

const TOKEN_KEY = "auth_token";

// Single axios instance for the whole app. Every API module imports
// this rather than calling axios directly, so auth headers and error
// handling stay in exactly one place.
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request, read fresh from the
// cookie each time rather than captured once at module load —
// otherwise a login after the app has booted would never take effect.
// Auth routes (login / register) are excluded so we never send a
// stale or irrelevant token on those calls.
apiClient.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isAuthRoute = url.startsWith("/v1/auth/") || url.startsWith("/auth/");

  if (!isAuthRoute && typeof window !== "undefined") {
    const token = getCookie(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// A 401 means the token is invalid or expired. Clear it and bounce to
// login rather than letting every consumer of the API re-implement
// this check.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      removeCookie(TOKEN_KEY, { path: "/" });
      removeCookie("auth_user", { path: "/" });
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Backend error responses are expected to look like { message: string }.
// This pulls a displayable string out of any axios error shape so
// components don't each re-implement the same defensive unwrapping.
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.message === "string") return data.message;
    if (error.message) return error.message;
  }
  return "Something went wrong. Please try again.";
}
