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
  new: "Where should Mitra meet you today?",
  rhythm_only: "Your rhythm is active.",
  quick_chant_only: "Your quick chant is here when you need to return.",
  tell_mitra_only: "Mitra is here to continue from where you are.",
  inner_path_only: "Your path is active.",
  rhythm_and_path: "Your rhythm and path are both active.",
  mixed_partial: "Mitra is here with you.",
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
export const SEGMENT_RHYTHM_NO_STATE_SUBTITLE: Record<
  MitraHomeSegment,
  string
> = {
  new: "Build a gentle morning, afternoon, and night rhythm.",
  rhythm_only: "", // has rhythm — use dynamic label from API
  quick_chant_only: "Build a gentle daily rhythm.",
  tell_mitra_only: "Build a gentle rhythm for your day.",
  inner_path_only: "Add a gentle morning, afternoon, or night rhythm.",
  rhythm_and_path: "", // has rhythm
  mixed_partial: "Build a gentle daily rhythm.",
};

/**
 * Inner Path card subtitle when no inner path (varies by segment).
 */
export const SEGMENT_INNER_PATH_NO_STATE_SUBTITLE: Record<
  MitraHomeSegment,
  string
> = {
  new: "Begin a 14-day path for what you are moving through.",
  rhythm_only: "Begin a 14-day path for what keeps returning.",
  quick_chant_only: "Begin a 14-day path for what keeps returning.",
  tell_mitra_only: "Turn a recurring pattern into a 14-day path.",
  inner_path_only: "", // has inner path — use day count from API
  rhythm_and_path: "", // has inner path
  mixed_partial: "Begin a 14-day path for what keeps returning.",
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
export const QUICK_CHANT_HISTORY_ONLY_SUBTITLE =
  "Your quick chant is here when you need to return.";
export const QUICK_CHANT_NO_STATE_SUBTITLE =
  "Choose a mantra for quick return.";

export const QUICK_CHANT_HAS_MANTRA_SUBTITLE_HI = "आपका चुना हुआ मंत्र यहाँ है।";
export const QUICK_CHANT_HISTORY_ONLY_SUBTITLE_HI =
  "आपका जप जब ज़रूरत हो यहाँ मिलेगा।";
export const QUICK_CHANT_NO_STATE_SUBTITLE_HI =
  "जल्दी वापस आने के लिए एक मंत्र चुनें।";

/**
 * Tell Mitra card subtitle (conditional on state).
 */
export const TELL_MITRA_HAS_HISTORY_SUBTITLE =
  "Continue telling Mitra what is moving.";
export const TELL_MITRA_ACTIVE_PATH_SUBTITLE =
  "What is on your mind right now?";
export const TELL_MITRA_DEFAULT_SUBTITLE = "Share what is moving today.";

export const TELL_MITRA_HAS_HISTORY_SUBTITLE_HI =
  "मित्र को बताते रहें जो मन में चल रहा है।";
export const TELL_MITRA_ACTIVE_PATH_SUBTITLE_HI =
  "अभी आपके मन में क्या है?";
export const TELL_MITRA_DEFAULT_SUBTITLE_HI = "आज जो मन में चल रहा है वो साझा करें।";

/** Hindi — My Rhythm no-state subtitle by segment */
export const SEGMENT_RHYTHM_NO_STATE_SUBTITLE_HI: Record<MitraHomeSegment, string> = {
  new: "एक हल्की सुबह, दोपहर और रात की लय बनाएं।",
  rhythm_only: "",
  quick_chant_only: "एक हल्की रोज़ की लय बनाएं।",
  tell_mitra_only: "अपने दिन के लिए एक हल्की लय बनाएं।",
  inner_path_only: "एक हल्की सुबह, दोपहर या रात की लय जोड़ें।",
  rhythm_and_path: "",
  mixed_partial: "एक हल्की रोज़ की लय बनाएं।",
};

/** Hindi — Inner Path no-state subtitle by segment */
export const SEGMENT_INNER_PATH_NO_STATE_SUBTITLE_HI: Record<MitraHomeSegment, string> = {
  new: "जो आप अभी से गुज़र रहे हैं उसके लिए 14 दिन का पथ शुरू करें।",
  rhythm_only: "जो बार-बार आता है उसके लिए 14 दिन का पथ शुरू करें।",
  quick_chant_only: "जो बार-बार आता है उसके लिए 14 दिन का पथ शुरू करें।",
  tell_mitra_only: "जो बार-बार आता है उसे 14 दिन के पथ में बदलें।",
  inner_path_only: "",
  rhythm_and_path: "",
  mixed_partial: "जो बार-बार आता है उसके लिए 14 दिन का पथ शुरू करें।",
};

/** Hindi — Greeting subtext by segment (overrides API-returned text for locale purity) */
export const SEGMENT_GREETING_SUBTEXT_HI: Record<MitraHomeSegment, string> = {
  new: "आज मित्र आपसे कहाँ मिले?",
  rhythm_only: "आपकी लय चालू है।",
  quick_chant_only: "आपका मंत्र जाप जब चाहें वापस आने के लिए यहाँ है।",
  tell_mitra_only: "मित्र वहीं से जारी रखने के लिए यहाँ है जहाँ आप हैं।",
  inner_path_only: "आपका पथ चालू है।",
  rhythm_and_path: "आपकी लय और पथ दोनों चालू हैं।",
  mixed_partial: "मित्र आपके साथ है।",
};

/** Hindi — Rhythm time-band labels for greeting (e.g. "Begin with your morning rhythm") */
export const RHYTHM_BAND_LABEL_HI: Record<string, string> = {
  allDone: "आज आपकी लय बनी रही",
  beginMorning: "अपनी सुबह की लय से शुरुआत करें",
  morningHeldAfternoon: "सुबह हो गई · दोपहर में लौटें",
  returnAfternoon: "अपनी दोपहर की लय के साथ लौटें",
  afternoonHeldNight: "दोपहर हो गई · आज रात शांति से बंद करें",
  closeNight: "रात की लय के साथ दिन समाप्त करें",
  noStateFallback: "एक हल्की रोज़ की लय बनाएं",
};

/**
 * Entry intention screen copy (founder-frozen).
 */
export const ENTRY_INTENTION_HEADING = "What feels needed today?";
export const ENTRY_INTENTION_SUBTEXT = "Choose what feels closest right now.";

export const ENTRY_INTENTION_OPTIONS = [
  {
    id: "daily_rhythm",
    title: "Shape my day",
    body: "Begin with remembrance in the morning,return during the day, and release what you cannot carry at night.",
    cta: "Set my rhythm",
  },
  {
    id: "inner_path",
    title: "Walk a deeper path",
    body: "A gentle 14-day journey toward clarity,practice, and inner steadiness.",
    cta: "Begin my path",
  },
  {
    id: "quick_chant",
    title: "Return through mantra",
    body: "A short chanting practice to gather the mind and return to stillness.",
    cta: "Start chanting",
  },
  {
    id: "tell_mitra",
    title: "Share what is moving",
    body: "Speak freely about what is on your mind.Mitra will help you see clearly and take the next step.",
    cta: "Tell Mitra",
  },
] as const;
