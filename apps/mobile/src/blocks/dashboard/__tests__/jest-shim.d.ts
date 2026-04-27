/**
 * Dashboard __tests__ jest shim — mirror of src/blocks/room/__tests__/jest-shim.d.ts.
 * Ambient declarations so QuickSupportBlock tests typecheck cleanly in the
 * current repo (no @types/jest, no @testing-library/react-native installed
 * yet). Delete in favor of real types once Agent A wires jest-expo in
 * Phase 5 tooling (see docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md Phase 5 notes).
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
  toHaveBeenCalledTimes: (n: number) => void;
  toHaveBeenCalledWith: (...args: any[]) => void;
  not: {
    toHaveBeenCalled: () => void;
  };
  toEqual: (other: any) => void;
  toBe: (other: any) => void;
};

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
