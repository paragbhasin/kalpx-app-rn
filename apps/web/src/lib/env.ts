export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  apiImageBaseUrl: import.meta.env.VITE_API_IMAGE_BASE_URL as string,
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID as string | undefined,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,
  isDev: import.meta.env.DEV,
} as const;
