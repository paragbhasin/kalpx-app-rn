// S17-D4A — Room guided experience contracts.
// Reflection options and shared UI copy for MITRA_ROOM_GUIDED=1.

import type { VerifiedRoomId, RoomReflectionOption } from '@kalpx/types';

export const ROOM_REFLECTION_OPTIONS: Record<VerifiedRoomId, RoomReflectionOption[]> = {
  room_stillness: [
    { code: "more_steady",        label: "More steady" },
    { code: "still_restless",     label: "Still restless" },
    { code: "a_little_clearer",   label: "A little clearer" },
    { code: "want_to_share_more", label: "I want to tell Mitra more", is_tell_mitra_bridge: true },
  ],
  room_clarity: [
    { code: "one_thing_clearer",  label: "One thing is clearer" },
    { code: "know_next_step",     label: "I know the next step" },
    { code: "still_unclear",      label: "Still unclear" },
    { code: "want_to_share_more", label: "I want to tell Mitra more", is_tell_mitra_bridge: true },
  ],
  room_release: [
    { code: "lighter",            label: "Lighter" },
    { code: "still_heavy",        label: "Still heavy" },
    { code: "released_a_little",  label: "I released a little" },
    { code: "want_to_share_more", label: "I want to tell Mitra more", is_tell_mitra_bridge: true },
  ],
  room_connection: [
    { code: "less_alone",         label: "Less alone" },
    { code: "still_disconnected", label: "Still disconnected" },
    { code: "remembered_someone", label: "I remembered someone" },
    { code: "want_to_share_more", label: "I want to tell Mitra more", is_tell_mitra_bridge: true },
  ],
  room_growth: [
    { code: "i_know_one_step",    label: "I know one step" },
    { code: "feel_ready",         label: "I feel ready" },
    { code: "still_stuck",        label: "Still stuck" },
    { code: "want_help_choosing", label: "I want help choosing" },
  ],
  room_joy: [
    { code: "noticed_something_good", label: "I noticed something good" },
    { code: "more_steady",            label: "More steady" },
    { code: "still_restless",         label: "Still restless" },
    { code: "want_to_share_more",     label: "I want to tell Mitra more", is_tell_mitra_bridge: true },
  ],
};

// D-C Surface A: per-room completion acknowledgement header shown in RoomReflectionSheet.
// COPY STATUS: FROZEN — approved by founder 2026-05-11.
export const ROOM_COMPLETION_HEADER: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "Pratyahara. The turning inward was the practice.",
  room_connection: "Bhakti. The heart turned.",
  room_release:    "Sharanagati. One offering, however small.",
  room_clarity:    "Viveka — the space was given.",
  room_growth:     "Tapasya. You stayed.",
  room_joy:        "Ananda. You noticed.",
};

// §5.2 post-completion next-step suggestion shown in RoomReflectionSheet next_step phase.
// COPY STATUS: FROZEN — approved by founder 2026-05-11.
export const ROOM_NEXT_STEP_LINE: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "When the noise returns, this room is here.",
  room_connection: "Carry one softened feeling with you.",
  room_release:    "Leave what you can leave. Return gently.",
  room_clarity:    "One clear thing is enough for now.",
  room_growth:     "One small step is enough to begin.",
  room_joy:        "Let the lightness stay simple.",
};

export const ROOM_GUIDED_COPY = {
  begin:            "Begin",
  whyThisLabel:     "Why this was chosen",
  viewAllSteps:     "View all steps",
  exitLabel:        "I'll go now",
  reflectionPrompt: "What shifted a little?",
  nextStep: {
    finishHere:    "Finish here",
    tellMitraMore: "Tell Mitra more",
    continueStep:  "Continue with another step",
    returnHome:    "Return home",
  },
} as const;
