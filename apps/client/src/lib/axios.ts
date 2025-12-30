import axios from "axios";
import { redirect, RedirectType } from "next/navigation";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    const { headers } = await import("next/headers");
    const cookie = (await headers()).get("cookie");
    if (cookie) {
      config.headers.Cookie = cookie;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default api;
