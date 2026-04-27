/**
 * KalpX Font Constants — matches web design language (design_language.md)
 *
 * Headlines: Cormorant Garamond (serif)
 * Body/UI: Inter (sans-serif)
 *
 * Font loading happens in App.jsx via useFonts + @expo-google-fonts
 */

export const Fonts = {
  // Serif — headings, titles, quotes
  serif: {
    regular: 'CormorantGaramond_400Regular',
    bold: 'CormorantGaramond_700Bold',
  },

  // Sans — body, buttons, labels, UI
  sans: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },

  // Decorative — Cinzel for special headings
  cinzel: {
    regular: 'Cinzel_400Regular',
    bold: 'Cinzel_700Bold',
  },

  // Devanagari — Sanskrit sources in Why-This L3 (Week 7).
  // Fallback chain: NotoSansDevanagari → system serif (iOS/Android render Devanagari
  // glyphs via system fallback when a codepoint is missing). Worst-case is a
  // platform Devanagari font — never tofu — because RN text rendering uses
  // platform fallback for unsupported glyphs.
  devanagari: {
    regular: 'NotoSansDevanagari_400Regular',
    bold: 'NotoSansDevanagari_700Bold',
  },

  // Legacy aliases — use during migration, replace later
  legacy: {
    GelicaBold: 'CormorantGaramond_700Bold',
    GelicaRegular: 'Inter_400Regular',
    GelicaMedium: 'Inter_500Medium',
    GelicaLight: 'Inter_400Regular',
  },
} as const;

/**
 * Usage in StyleSheet:
 *
 * import { Fonts } from '../theme/fonts';
 *
 * headline: { fontFamily: Fonts.serif.bold }
 * body: { fontFamily: Fonts.sans.regular }
 * button: { fontFamily: Fonts.sans.semiBold }
 * label: { fontFamily: Fonts.sans.regular, textTransform: 'uppercase', letterSpacing: 1.5 }
 */
