import { createApiClient } from '@kalpx/api-client';
import { WEB_ENV } from './env';
import { webStorage } from './webStorage';
import { webRouter } from './webRouter';

export const api = createApiClient({
  baseURL: WEB_ENV.apiBaseUrl,
  timeout: 30000,
  storage: webStorage,
  router: webRouter,
  isDev: WEB_ENV.isDev,
});
