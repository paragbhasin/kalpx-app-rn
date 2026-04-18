/**
 * Mitra v3 — unified design tokens.
 *
 * Single source of truth for color values across the app. All
 * components (blocks, containers, scaffolds) should import from here
 * instead of inlining hex codes. CI enforces this via grep audit.
 *
 * Spec: kalpx-app-rn/docs/NEW_DASHBOARD_V1_SPEC.md §5
 *
 * Palette rationale:
 *   - Current CompanionDashboard and new-dashboard scaffold are
 *     already ~95% aligned (both use #C9A84C gold, #432104 deep
 *     brown, Cormorant + Inter). These tokens lock that alignment
 *     and make further drift detectable.
 *   - Border / hairline convention: gold-tint (`goldHairline`) is
 *     the v3 standard; cream hairline from the Apr-14 scaffold is
 *     deprecated in favor of this.
 */

export const Colors = {
  // Primary gold accents
  gold: "#C9A84C",
  goldBright: "#D4A017",
  goldHairline: "rgba(212, 160, 23, 0.25)",
  goldPale: "#F7EED1",
  goldPaleEnd: "#E8D9A8",

  // Browns — headlines and body text
  brownDeep: "#432104",
  brownMuted: "#8A7D6B",
  textSoft: "#6B6155",
  textFaint: "#999999",

  // Backgrounds
  parchment: "#FAF7F2",
  cream: "#FFFDF7",
  creamWarm: "#FFFDF5",

  // Semantic
  successGreen: "#10B981",
  ringTan: "#BFA58A",

  // Soft supports
  lotusPeach: "#F5EDEA",
  lotusPeachEdge: "#E5D4CA",

  // Misc retained for migration; prefer semantic names above
  borderCream: "#EDE1D3",
} as const;

export type ColorToken = keyof typeof Colors;

/**
 * Helper — looks up a color token by name. Prefer direct member
 * access when possible (`Colors.gold`); this helper exists for
 * places that need to choose a token at runtime.
 */
export const color = (token: ColorToken): string => Colors[token];
