export type KalpxEnv = 'dev' | 'prod';

export const API_ENV: KalpxEnv =
  (process.env.EXPO_PUBLIC_API_ENV as KalpxEnv) ||
  (process.env.VITE_API_ENV as KalpxEnv) ||
  'dev';

export const API_BASE_URL =
  API_ENV === 'prod' ? 'https://kalpx.com/api' : 'https://dev.kalpx.com/api';

export const IMAGE_BASE_URL =
  API_ENV === 'prod' ? 'https://kalpx.com' : 'https://dev.kalpx.com';

export const IS_PROD = API_ENV === 'prod';

export const PHONE_AUTH_ENABLED =
  (process.env.EXPO_PUBLIC_PHONE_AUTH_ENABLED as string | undefined) === '1' ||
  (process.env.VITE_PHONE_AUTH_ENABLED as string | undefined) === '1';
