/**
 * Stream O — Mitra Home Segment-Aware Copy Constants
 *
 * Shared between web and mobile. Single source of truth for:
 * - Segment type definitions
 * - Greeting subtexts
 * - Card subtitles (conditional on surface state)
 * - Entry intention copy (founder-frozen)
 */

export type MitraHomeSegment =
  | "new"
  | "rhythm_only"
  | "quick_chant_only"
  | "tell_mitra_only"
  | "inner_path_only"
  | "rhythm_and_path"
  | "mixed_partial";

/**
 * Greeting subtext by segment.
 * Note: quick_chant_only uses generic copy — refine in components with has_quick_chant_mantra check.
 */
export const SEGMENT_GREETING_SUBTEXT: Record<MitraHomeSegment, string> = {
  new:              "Where should Mitra meet you today?",
  rhythm_only:      "Your rhythm is active.",
  quick_chant_only: "Your quick chant is here when you need to return.",
  tell_mitra_only:  "Mitra is here to continue from where you are.",
  inner_path_only:  "Your path is active.",
  rhythm_and_path:  "Your rhythm and path are both active.",
  mixed_partial:    "Mitra is here with you.",
};

/**
 * Quick Chant greeting refinement (use in component logic, not as static map):
 *
 * if (segment === "quick_chant_only" && has_quick_chant_mantra)
 *   → "Your chosen mantra is here when you need to return."
 * if (segment === "quick_chant_only" && !has_quick_chant_mantra)
 *   → "Your quick chant is here when you need to return."
 */

/**
 * My Rhythm card subtitle when no rhythm exists (varies by segment).
 */
export const SEGMENT_RHYTHM_NO_STATE_SUBTITLE: Record<MitraHomeSegment, string> = {
  new:             "Build a gentle morning, afternoon, and night rhythm.",
  rhythm_only:     "",  // has rhythm — use dynamic label from API
  quick_chant_only:"Build a gentle daily rhythm.",
  tell_mitra_only: "Build a gentle rhythm for your day.",
  inner_path_only: "Add a gentle morning, afternoon, or night rhythm.",
  rhythm_and_path: "",  // has rhythm
  mixed_partial:   "Build a gentle daily rhythm.",
};

/**
 * Inner Path card subtitle when no inner path (varies by segment).
 */
export const SEGMENT_INNER_PATH_NO_STATE_SUBTITLE: Record<MitraHomeSegment, string> = {
  new:             "Begin a 14-day path for what you are moving through.",
  rhythm_only:     "Begin a 14-day path for what keeps returning.",
  quick_chant_only:"Begin a 14-day path for what keeps returning.",
  tell_mitra_only: "Turn a recurring pattern into a 14-day path.",
  inner_path_only: "",  // has inner path — use day count from API
  rhythm_and_path: "",  // has inner path
  mixed_partial:   "Begin a 14-day path for what keeps returning.",
};

/**
 * Quick Chant card subtitle — 3-way conditional based on state.
 *
 * CRITICAL: Only show "chosen mantra" if has_quick_chant_mantra === true.
 *
 * Component logic:
 *   if (has_quick_chant_mantra) → QUICK_CHANT_HAS_MANTRA_SUBTITLE
 *   else if (has_quick_chant_history) → QUICK_CHANT_HISTORY_ONLY_SUBTITLE
 *   else → QUICK_CHANT_NO_STATE_SUBTITLE
 */
export const QUICK_CHANT_HAS_MANTRA_SUBTITLE = "Your chosen mantra is here.";
export const QUICK_CHANT_HISTORY_ONLY_SUBTITLE = "Your quick chant is here when you need to return.";
export const QUICK_CHANT_NO_STATE_SUBTITLE = "Choose a mantra for quick return.";

/**
 * Tell Mitra card subtitle (conditional on state).
 */
export const TELL_MITRA_HAS_HISTORY_SUBTITLE = "Continue telling Mitra what is moving.";
export const TELL_MITRA_ACTIVE_PATH_SUBTITLE = "What is on your mind right now?";
export const TELL_MITRA_DEFAULT_SUBTITLE = "Share what is moving today.";

/**
 * Entry intention screen copy (founder-frozen).
 */
export const ENTRY_INTENTION_HEADING = "Where should Mitra meet you today?";
export const ENTRY_INTENTION_SUBTEXT =
  "Begin with a gentle daily rhythm, walk an Inner Path toward deeper alignment, share what is moving within you, or return through mantra when you need steadiness.\n\nChoose what feels closest right now.";

export const ENTRY_INTENTION_OPTIONS = [
  {
    id: "daily_rhythm",
    title: "Build my Daily Rhythm",
    body:  "Begin with remembrance, return during the day, and release what you cannot carry at night.",
    cta:   "Set my rhythm",
  },
  {
    id: "inner_path",
    title: "Begin an Inner Path",
    body:  "A 14-day journey to understand what is moving within you and align your life with clarity, practice, and Sanatan wisdom.",
    cta:   "Begin my path",
  },
  {
    id: "quick_chant",
    title: "Start a Quick Chant",
    body:  "A short mantra practice to gather the mind, return to steadiness, and reconnect with what is sacred within.",
    cta:   "Start chanting",
  },
  {
    id: "tell_mitra",
    title: "Tell Mitra what's on my mind",
    body:  "Share what is moving in your life. Mitra will help you pause, see clearly, and choose the next right step.",
    cta:   "Tell Mitra",
  },
] as const;
