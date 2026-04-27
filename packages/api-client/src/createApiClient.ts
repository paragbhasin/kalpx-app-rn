import axios, { type AxiosInstance } from 'axios';
import { AUTH_KEYS } from './authKeys';
import type { ApiClientConfig } from './types';

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, timeout = 30000, storage, router, isDev = false } = config;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  });

  // --- token refresh state (per-instance, not module-level) ---
  let isRefreshing = false;
  let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshToken = await storage.getItem(AUTH_KEYS.refreshToken);
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post<{ access?: string; refresh?: string }>(
        `${baseURL}/token/refresh/`,
        { refresh: refreshToken },
      );

      const { access, refresh } = response.data;
      if (access) await storage.setItem(AUTH_KEYS.accessToken, access);
      if (refresh) await storage.setItem(AUTH_KEYS.refreshToken, refresh);
      return access ?? null;
    } catch {
      await storage.removeItem(AUTH_KEYS.accessToken);
      await storage.removeItem(AUTH_KEYS.refreshToken);
      return null;
    }
  };

  // --- request interceptor ---
  instance.interceptors.request.use(async (cfg) => {
    const token = await storage.getItem(AUTH_KEYS.accessToken);
    const guestUUID = await storage.getItem(AUTH_KEYS.guestUUID);

    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
      delete cfg.headers['X-Guest-UUID'];
    } else {
      cfg.headers['X-Guest-UUID'] = guestUUID;
      delete cfg.headers.Authorization;
    }

    if (isDev) {
      const testNow = await storage.getItem(AUTH_KEYS.testNow);
      if (testNow) cfg.headers['X-Test-Now'] = testNow;
    }

    return cfg;
  });

  // --- response interceptor — 401 refresh + retry ---
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'));
          router.navigateToLogin();
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}
