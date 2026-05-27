import { useWindowDimensions } from "react-native";

// iPad Pro 11" = 834pt wide, iPad Pro 13" = 1024pt wide (landscape)
export const TABLET_BREAKPOINT = 768;

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
 * Scale a font size for tablets.
 * Tablet fonts are ~15% larger than mobile but capped to avoid oversizing.
 */
export function rfs(mobileFontSize: number, width: number): number {
  if (width < TABLET_BREAKPOINT) return mobileFontSize;
  return Math.round(mobileFontSize * 1.15);
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
