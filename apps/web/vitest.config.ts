import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/**/__tests__/**/*.test.tsx', 'jsdom'],
    ],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
});
