/**
 * Mitra v3 canonical palette — mirrors legacy KalpX warm aesthetic.
 *
 * Source screens: Home.tsx hero, MitraPhilosophy, WelcomeBack, the legacy
 * practice screens (see /screenshots/flow_core_mantra/).
 *
 * Use this instead of hardcoding hex values inside v3 blocks. Runner + sound-
 * bridge blocks (MantraRunnerDisplay, SankalpHoldBlock, PracticeTimerBlock,
 * CompletionReturnTransient, SoundBridgeTransient) stay on their dark
 * immersive theme per spec — don't import these tokens there.
 */

export const MitraPalette = {
  // Backgrounds
  BG_CREAM: '#FFF8EF',        // page bg (matches Home.tsx)
  CARD_CREAM: '#fffdf9',      // card surface (WelcomeBack)
  CHIP_BG: '#FFF7E8',         // secondary chip fill
  DIVIDER: '#eadfc4',         // subtle horizontal rule

  // Text
  TEXT_DEEP: '#432104',       // primary headings + body
  TEXT_SUBTLE: '#6b5a45',     // secondary text
  TEXT_MUTED: '#8a7a5a',      // tertiary labels / captions

  // Accents
  BORDER_GOLD: '#eddeb4',     // card borders, left accents, dividers
  ACCENT_GOLD: '#c9a84c',     // icons, small highlights

  // CTA
  CTA_AMBER: '#c89a47',       // primary button fill (matches "Begin Chanting")
  CTA_AMBER_DARK: '#a87a2f',  // pressed / dark variant
  CTA_TEXT: '#ffffff',        // primary button text

  // Secondary button
  SECONDARY_BORDER: '#c9a84c',

  // Dark immersive (runners ONLY — do not use in onboarding/dashboard/sheets)
  DARK_BG: '#1a1a1a',
  DARK_BORDER_GOLD: '#eddeb4',
};

export default MitraPalette;
