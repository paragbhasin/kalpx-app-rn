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

export const ROOM_REFLECTION_OPTIONS_HI: Record<VerifiedRoomId, RoomReflectionOption[]> = {
  room_stillness: [
    { code: "more_steady",        label: "ज़्यादा स्थिर" },
    { code: "still_restless",     label: "अभी भी बेचैन" },
    { code: "a_little_clearer",   label: "थोड़ा स्पष्ट" },
    { code: "want_to_share_more", label: "मित्र को और बताना है", is_tell_mitra_bridge: true },
  ],
  room_clarity: [
    { code: "one_thing_clearer",  label: "एक बात स्पष्ट हुई" },
    { code: "know_next_step",     label: "अगला कदम पता है" },
    { code: "still_unclear",      label: "अभी भी अस्पष्ट" },
    { code: "want_to_share_more", label: "मित्र को और बताना है", is_tell_mitra_bridge: true },
  ],
  room_release: [
    { code: "lighter",            label: "हल्का" },
    { code: "still_heavy",        label: "अभी भी भारी" },
    { code: "released_a_little",  label: "थोड़ा छोड़ा" },
    { code: "want_to_share_more", label: "मित्र को और बताना है", is_tell_mitra_bridge: true },
  ],
  room_connection: [
    { code: "less_alone",         label: "कम अकेला" },
    { code: "still_disconnected", label: "अभी भी दूर" },
    { code: "remembered_someone", label: "किसी को याद किया" },
    { code: "want_to_share_more", label: "मित्र को और बताना है", is_tell_mitra_bridge: true },
  ],
  room_growth: [
    { code: "i_know_one_step",    label: "एक कदम पता है" },
    { code: "feel_ready",         label: "तैयार हूँ" },
    { code: "still_stuck",        label: "अभी भी अटका हूँ" },
    { code: "want_help_choosing", label: "चुनने में मदद चाहिए" },
  ],
  room_joy: [
    { code: "noticed_something_good", label: "कुछ अच्छा देखा" },
    { code: "more_steady",            label: "ज़्यादा स्थिर" },
    { code: "still_restless",         label: "अभी भी बेचैन" },
    { code: "want_to_share_more",     label: "मित्र को और बताना है", is_tell_mitra_bridge: true },
  ],
};

// D-C Surface A: per-room completion acknowledgement header shown in RoomReflectionSheet.
// COPY STATUS: FROZEN — approved by founder 2026-05-11.
// PARTIAL OVERRIDE 2026-05-17: room_release + room_clarity headers updated per founder approval.
export const ROOM_COMPLETION_HEADER: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "Pratyahara. The turning inward was the practice.",
  room_connection: "Bhakti. The heart turned.",
  room_release:    "Sharanagati. You let one thing go.",
  room_clarity:    "Viveka. You made space to see.",
  room_growth:     "Tapasya. You stayed.",
  room_joy:        "Ananda. You noticed.",
};

export const ROOM_COMPLETION_HEADER_HI: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "प्रत्याहार। भीतर मुड़ना ही अभ्यास था।",
  room_connection: "भक्ति। हृदय मुड़ा।",
  room_release:    "शरणागति। आपने एक चीज़ छोड़ी।",
  room_clarity:    "विवेक। आपने देखने की जगह बनाई।",
  room_growth:     "तपस्या। आप रहे।",
  room_joy:        "आनंद। आपने देखा।",
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

export const ROOM_NEXT_STEP_LINE_HI: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "जब शोर लौटे, यह कमरा यहाँ है।",
  room_connection: "एक नरम भावना साथ ले चलें।",
  room_release:    "जो छोड़ सकते हैं छोड़ें। धीरे से लौटें।",
  room_clarity:    "अभी के लिए एक स्पष्ट बात काफी है।",
  room_growth:     "शुरू करने के लिए एक छोटा कदम काफी है।",
  room_joy:        "हल्केपन को सरल रहने दें।",
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

export const ROOM_GUIDED_COPY_HI = {
  begin:            "शुरू करें",
  whyThisLabel:     "यह क्यों चुना गया",
  viewAllSteps:     "सभी कदम देखें",
  exitLabel:        "अभी जाता हूँ",
  reflectionPrompt: "क्या थोड़ा बदला?",
  nextStep: {
    finishHere:    "यहाँ रुकें",
    tellMitraMore: "मित्र को और बताएं",
    continueStep:  "एक और कदम लें",
    returnHome:    "घर जाएँ",
  },
} as const;

export const ROOM_REFLECTION_OPTIONS_TE: Record<VerifiedRoomId, RoomReflectionOption[]> = {
  room_stillness: [
    { code: "more_steady",        label: "మరింత స్థిరంగా" },
    { code: "still_restless",     label: "ఇంకా అశాంతిగా" },
    { code: "a_little_clearer",   label: "కొద్దిగా స్పష్టంగా" },
    { code: "want_to_share_more", label: "మిత్రకు మరింత చెప్పాలి", is_tell_mitra_bridge: true },
  ],
  room_clarity: [
    { code: "one_thing_clearer",  label: "ఒక విషయం స్పష్టమైంది" },
    { code: "know_next_step",     label: "తదుపరి అడుగు తెలుసు" },
    { code: "still_unclear",      label: "ఇంకా అస్పష్టంగా" },
    { code: "want_to_share_more", label: "మిత్రకు మరింత చెప్పాలి", is_tell_mitra_bridge: true },
  ],
  room_release: [
    { code: "lighter",            label: "తేలికగా" },
    { code: "still_heavy",        label: "ఇంకా భారంగా" },
    { code: "released_a_little",  label: "కొద్దిగా వదిలిపెట్టాను" },
    { code: "want_to_share_more", label: "మిత్రకు మరింత చెప్పాలి", is_tell_mitra_bridge: true },
  ],
  room_connection: [
    { code: "less_alone",         label: "తక్కువ ఒంటరిగా" },
    { code: "still_disconnected", label: "ఇంకా దూరంగా" },
    { code: "remembered_someone", label: "ఒకరిని గుర్తుచేసుకున్నాను" },
    { code: "want_to_share_more", label: "మిత్రకు మరింత చెప్పాలి", is_tell_mitra_bridge: true },
  ],
  room_growth: [
    { code: "i_know_one_step",    label: "ఒక అడుగు తెలుసు" },
    { code: "feel_ready",         label: "సిద్ధంగా అనిపిస్తోంది" },
    { code: "still_stuck",        label: "ఇంకా నిలబడ్డాను" },
    { code: "want_help_choosing", label: "ఎంచుకోవడంలో సహాయం కావాలి" },
  ],
  room_joy: [
    { code: "noticed_something_good", label: "మంచిది గమనించాను" },
    { code: "more_steady",            label: "మరింత స్థిరంగా" },
    { code: "still_restless",         label: "ఇంకా అశాంతిగా" },
    { code: "want_to_share_more",     label: "మిత్రకు మరింత చెప్పాలి", is_tell_mitra_bridge: true },
  ],
};

export const ROOM_COMPLETION_HEADER_TE: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "ప్రత్యాహారం. లోపలికి తిరగడమే అభ్యాసం.",
  room_connection: "భక్తి. హృదయం తిరిగింది.",
  room_release:    "శరణాగతి. మీరు ఒక విషయం వదిలిపెట్టారు.",
  room_clarity:    "వివేకం. మీరు చూసే స్థలం తయారు చేశారు.",
  room_growth:     "తపస్య. మీరు నిలిచారు.",
  room_joy:        "ఆనందం. మీరు గమనించారు.",
};

export const ROOM_NEXT_STEP_LINE_TE: Partial<Record<VerifiedRoomId, string>> = {
  room_stillness:  "శబ్దం తిరిగొచ్చినప్పుడు, ఈ గది ఇక్కడే ఉంది.",
  room_connection: "ఒక మృదువైన అనుభూతిని వెంట తీసుకెళ్ళండి.",
  room_release:    "వదిలించుకోగలిగేది వదిలించుకోండి. నెమ్మదిగా తిరిగి రండి.",
  room_clarity:    "ఇప్పటికి ఒక స్పష్టమైన విషయం చాలు.",
  room_growth:     "ప్రారంభించడానికి ఒక చిన్న అడుగు చాలు.",
  room_joy:        "తేలికదనాన్ని సరళంగా ఉండనివ్వండి.",
};

export const ROOM_GUIDED_COPY_TE = {
  begin:            "ప్రారంభించండి",
  whyThisLabel:     "ఇది ఎందుకు ఎంచుకోబడింది",
  viewAllSteps:     "అన్ని దశలు చూడండి",
  exitLabel:        "నేను ఇప్పుడు వెళ్తాను",
  reflectionPrompt: "కొద్దిగా ఏమి మారింది?",
  nextStep: {
    finishHere:    "ఇక్కడ ముగించండి",
    tellMitraMore: "మిత్రకు మరింత చెప్పండి",
    continueStep:  "మరొక దశ కొనసాగించండి",
    returnHome:    "హోమ్‌కు తిరిగి వెళ్ళండి",
  },
} as const;
