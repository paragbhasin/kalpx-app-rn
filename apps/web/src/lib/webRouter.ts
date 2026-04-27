import type { RouterAdapter } from '@kalpx/api-client';

// Lazily resolved — allows the adapter to be created before BrowserRouter mounts.
let _navigate: ((path: string) => void) | null = null;

export function setWebNavigate(navigate: (path: string) => void) {
  _navigate = navigate;
}

export const webRouter: RouterAdapter = {
  navigateToLogin: () => {
    if (_navigate) {
      _navigate('/login');
    } else {
      window.location.href = '/login';
    }
  },
};
