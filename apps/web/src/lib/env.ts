export const WEB_ENV = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://dev.kalpx.com/api',
  imageBaseUrl: (import.meta.env.VITE_API_IMAGE_BASE_URL as string | undefined) ?? 'https://dev.kalpx.com',
  metaPixelId: (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? '',
  sentryDsn: (import.meta.env.VITE_SENTRY_DSN as string | undefined) ?? '',
  stripePublishableKey: (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ?? '',
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '',
  isDev: import.meta.env.DEV as boolean,
} as const;
