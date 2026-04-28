/**
 * Test persona references for Playwright e2e tests.
 * Actual credentials are in .env.test.local (never committed).
 *
 * .env.test.local format:
 *   PW_DAY3_EMAIL=test+day3@kalpx.com
 *   PW_DAY3_PASSWORD=testpassword123
 *   PW_DAY7_EMAIL=test+day7@kalpx.com
 *   PW_DAY7_PASSWORD=testpassword123
 *   PW_DAY14_EMAIL=test+day14@kalpx.com
 *   PW_DAY14_PASSWORD=testpassword123
 */

export const PERSONAS = {
  /** Active journey, day 3, has mantra/sankalp/practice triad */
  day3: {
    email: process.env.PW_DAY3_EMAIL ?? '',
    password: process.env.PW_DAY3_PASSWORD ?? '',
  },
  /** Active journey, day 7 — checkpoint_day_7 view available */
  day7: {
    email: process.env.PW_DAY7_EMAIL ?? '',
    password: process.env.PW_DAY7_PASSWORD ?? '',
  },
  /** Active journey, day 14 — checkpoint_day_14 view available */
  day14: {
    email: process.env.PW_DAY14_EMAIL ?? '',
    password: process.env.PW_DAY14_PASSWORD ?? '',
  },
} as const;
