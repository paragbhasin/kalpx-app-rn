import type { RouterAdapter } from '@kalpx/api-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNavigate = (...args: any[]) => void;

// Lazily resolved — allows the adapter to be created before BrowserRouter mounts.
let _navigate: AnyNavigate | null = null;

export function setWebNavigate(navigate: AnyNavigate) {
  _navigate = navigate;
}

/** Imperative navigation for use outside React components (e.g. actionExecutor). */
export function webNavigate(path: string | number, opts?: any) {
  if (_navigate) {
    _navigate(path, opts);
  } else {
    if (typeof path === 'string') {
      window.location.href = path;
    }
  }
}

export const webRouter: RouterAdapter = {
  navigateToLogin: () => webNavigate('/login'),
};
