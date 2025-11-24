// src/lib/api.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

// Ensure headers is an AxiosHeaders instance, then .set()
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    // If headers is not an AxiosHeaders instance, wrap it
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
      if (!location.pathname.startsWith("/login")) {
        location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
