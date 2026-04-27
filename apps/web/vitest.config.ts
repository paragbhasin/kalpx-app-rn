import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Prevent duplicate React instances when testing hooks from packages/feature-flows
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/**/__tests__/**/*.test.tsx', 'jsdom'],
      ['src/**/__tests__/useClassBookingController.test.ts', 'jsdom'],
      ['src/**/__tests__/useCommunityFeedController.test.ts', 'jsdom'],
    ],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
});
