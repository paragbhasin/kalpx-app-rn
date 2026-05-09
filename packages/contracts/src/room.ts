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
