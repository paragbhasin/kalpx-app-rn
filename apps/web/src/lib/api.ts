import { createApiClient } from '@kalpx/api-client';
import { WEB_ENV } from './env';
import { webStorage } from './webStorage';
import { webRouter } from './webRouter';
import { getActiveLocale } from './locale';

export const api = createApiClient({
  baseURL: WEB_ENV.apiBaseUrl,
  timeout: 30000,
  storage: webStorage,
  router: webRouter,
  isDev: WEB_ENV.isDev,
});

// Inject current locale into every request so the backend returns
// content in the language the user has selected.
api.interceptors.request.use((cfg) => {
  const locale = getActiveLocale();
  cfg.params = { locale, ...cfg.params };
  return cfg;
});
