/**
 * Ambient declarations so the RoomRenderer Jest test typechecks cleanly in
 * the current repo, which does NOT yet have `@types/jest` or
 * `@testing-library/react-native` installed. These shims are intentionally
 * minimal and scoped to the __tests__ folder.
 *
 * When Phase 5 adds Jest + RTL, delete this file.
 */

declare const jest: {
  fn: <T extends (...args: any[]) => any>(impl?: T) => any;
  mock: (moduleName: string, factory?: () => any) => void;
  resetModules: () => void;
  useFakeTimers: () => void;
  useRealTimers: () => void;
  advanceTimersByTime: (ms: number) => void;
  requireMock: (moduleName: string) => any;
};

declare function describe(name: string, fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function afterEach(fn: () => void): void;
declare function test(
  name: string,
  fn: () => void | Promise<void>,
): void;
declare function expect(value: any): {
  toBeTruthy: () => void;
  toBeNull: () => void;
  toMatch: (re: RegExp) => void;
};
