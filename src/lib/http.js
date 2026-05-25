import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const publicClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = publicClient
      .post("/auth/refresh-token")
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokenResponse = await refreshSession();
        useAuthStore.getState().setSession({
          user: useAuthStore.getState().user,
          accessToken: tokenResponse?.data?.accessToken ?? null,
        });
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export { refreshSession };