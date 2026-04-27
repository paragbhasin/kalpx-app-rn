export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface RouterAdapter {
  navigateToLogin(): void;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  storage: StorageAdapter;
  router: RouterAdapter;
  /** Pass true in dev/preview builds to enable request/response logging and X-Test-Now header support. */
  isDev?: boolean;
}

// Extend axios InternalAxiosRequestConfig to track retry state
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
