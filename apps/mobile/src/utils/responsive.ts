import { Dimensions, useWindowDimensions } from "react-native";

// iPad Pro 11" = 834pt wide, iPad Pro 13" = 1024pt wide (landscape)
export const TABLET_BREAKPOINT = 768;

// Multiplier applied to all font sizes on tablet. 40% larger than mobile.
export const TABLET_FONT_SCALE = 1.4;

export function useTablet() {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}

/**
 * Returns a value scaled for the current screen.
 * rs(mobile, tablet) — pick the right value based on tablet detection.
 */
export function rs<T>(mobileVal: T, tabletVal: T, width: number): T {
  return width >= TABLET_BREAKPOINT ? tabletVal : mobileVal;
}

/**
 * Reactive font scale for use inside JSX (requires width from useWindowDimensions).
 * Applies TABLET_FONT_SCALE on tablets.
 */
export function rfs(mobileFontSize: number, width: number): number {
  if (width < TABLET_BREAKPOINT) return mobileFontSize;
  return Math.round(mobileFontSize * TABLET_FONT_SCALE);
}

/**
 * Static font scale for use inside StyleSheet.create().
 * Uses Dimensions (non-reactive — reads initial window width at module load).
 * Applies TABLET_FONT_SCALE on tablets.
 */
const { width: INITIAL_WIDTH } = Dimensions.get("window");
export function sfs(mobileFontSize: number): number {
  if (INITIAL_WIDTH < TABLET_BREAKPOINT) return mobileFontSize;
  return Math.round(mobileFontSize * TABLET_FONT_SCALE);
}

/**
 * Responsive horizontal padding — wider on tablets, capped at 2× mobile value.
 * Sections that need real centering should pair this with maxWidth + alignSelf:'center'.
 */
export function rhPad(mobilePad: number, width: number): number {
  if (width < TABLET_BREAKPOINT) return mobilePad;
  return Math.min(Math.round(mobilePad * 2), 48);
}

/**
 * Max content width for centred tablet layouts.
 * Keeps content from stretching across the full 1024pt iPad width.
 */
export const TABLET_MAX_CONTENT_WIDTH = 600;
export const TABLET_MAX_CARD_WIDTH = 540;
