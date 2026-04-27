/**
 * Test persona references for Playwright e2e tests.
 * Actual credentials are in .env.test.local (never committed).
 *
 * .env.test.local format:
 *   PW_DAY3_EMAIL=test+day3@kalpx.com
 *   PW_DAY3_PASSWORD=testpassword123
 */

export const PERSONAS = {
  /** Active journey, day 3, has mantra/sankalp/practice triad */
  day3: {
    email: process.env.PW_DAY3_EMAIL ?? '',
    password: process.env.PW_DAY3_PASSWORD ?? '',
  },
} as const;
