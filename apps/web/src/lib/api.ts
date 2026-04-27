import { createApiClient } from '@kalpx/api-client';
import { webStorage } from './webStorage';
import { webRouter } from './webRouter';
import { env } from './env';

export const api = createApiClient({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  storage: webStorage,
  router: webRouter,
  isDev: env.isDev,
});
