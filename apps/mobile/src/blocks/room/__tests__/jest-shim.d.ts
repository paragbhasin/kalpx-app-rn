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

// Minimal fireEvent surface used by the sheet/dashboard tests.
declare module "@testing-library/react-native" {
  export const fireEvent: {
    press: (node: any) => void;
    changeText: (node: any, text: string) => void;
  };
  export function render(element: any): {
    getByTestId: (id: string) => any;
    queryByTestId: (id: string) => any;
    toJSON: () => any;
    unmount: () => void;
  };
}

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
  toHaveBeenCalledTimes: (n: number) => void;
  toHaveBeenCalledWith: (...args: any[]) => void;
  not: {
    toHaveBeenCalled: () => void;
  };
  toEqual: (other: any) => void;
  toBe: (other: any) => void;
};
