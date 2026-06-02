/**
 * roomStepCopy — all copy/constants for RoomJourneyRenderer.
 *
 * Pure TypeScript (no RN imports). Mirror to apps/web/src/lib/roomStepCopy.ts.
 *
 * Sources used:
 *   - CARRY_MEMORY_MODAL — copy of the same constant in RoomGuidedSection.tsx.
 *     TODO: when the old fallback is retired, extract to a shared package and
 *     remove the duplicate here.
 *   - BETWEEN_STEP_MATRIX — new contextual transition table (replaces cycling array).
 *   - ROOM_ARRIVAL_DEFAULTS / ROOM_WISDOM_DEFAULTS — fallback copy per room.
 */

import {
  ROOM_COMPLETION_HEADER,
  ROOM_COMPLETION_HEADER_HI,
  ROOM_NEXT_STEP_LINE,
  ROOM_NEXT_STEP_LINE_HI,
} from '@kalpx/contracts';
import type { JourneyActionFamily, ArrivalCopy, CompletionCopy } from './roomJourneyTypes';
import type { ActionEnvelope, RoomContext, InquiryCategory } from './types';

// ─── CARRY_MEMORY_MODAL ─────────────────────────────────────────────────────
// Frontend-side carry copy keyed by writes_event.
// Backend step_payload.memory_modal is null in live responses (confirmed 2026-05-17).
// TODO: extract to @kalpx/contracts when RoomGuidedSection fallback is retired.

export interface CarryModalCopy {
  title?: string;
  sanatan_context?: string;
  why_we_ask?: string;
  prompt: string;
  placeholder?: string;
  primary_label: string;
  confirmation?: string;
  add_another_label?: string;
}

export const CARRY_MEMORY_MODAL_HI: Record<string, CarryModalCopy> = {
  connection_named: {
    title: 'उस व्यक्ति का नाम लें जो मायने रखता है',
    sanatan_context: 'संबंध हमें याद दिलाता है कि एक सच्चा बंधन हमें थाम सकता है।',
    why_we_ask: 'किसी का नाम लेने से अकेलेपन से उस एक धागे की ओर लौटना होता है।',
    prompt: 'अभी कौन आपके हृदय के करीब है?',
    placeholder: 'एक नाम, रिश्ता, या कुछ शब्द लिखें…',
    primary_label: 'यह जुड़ाव सहेजें',
  },
  joy_named: {
    title: 'अभी जो अच्छा है वो लिखें',
    sanatan_context: 'संतोष वहीं से शुरू होता है जहाँ हम देखते हैं कि क्या पहले से पर्याप्त है।',
    why_we_ask: 'एक अच्छी बात लिखने से मन उसके साथ रुकता है बजाय आगे भागने के।',
    prompt: 'अभी क्या अच्छा, स्थिर, या बस पर्याप्त लग रहा है?',
    placeholder: 'एक अच्छी बात लिखें…',
    primary_label: 'यह आनंद सहेजें',
  },
  growth_journal: {
    title: 'जो आपने देखा वो लिखें',
    sanatan_context: 'विकास एक सही कार्य से पकता है, गति से नहीं।',
    why_we_ask: 'जो आपने देखा उसे नाम देने से वह कुछ वास्तविक बन जाता है।',
    prompt: 'क्या उभरा, या क्या स्पष्ट हो रहा है?',
    placeholder: 'जो उभरा वो लिखें…',
    primary_label: 'यह सहेजें',
  },
  connection_reach_out: {
    title: 'एक व्यक्ति से संपर्क करें',
    sanatan_context: 'पहुँचने का एक छोटा कार्य ही संबंध का अभ्यास है।',
    why_we_ask: 'संदेश लिखने से, भेजे बिना भी, जुड़ाव करीब आता है।',
    prompt: 'किसी महत्वपूर्ण व्यक्ति को एक छोटा संदेश लिखें।',
    placeholder: 'आपका संदेश…',
    primary_label: 'संदेश सहेजें और कॉपी करें',
  },
  release_named: {
    title: 'जो रख रहे हैं उसे नाम दें',
    sanatan_context: 'छोड़ना हार नहीं है। यह पकड़ ढीली करना है ताकि जीवन फिर बह सके।',
    why_we_ask: 'बोझ को नाम देना उसे रखने का पहला कदम है।',
    prompt: 'अभी क्या रखा जा सकता है?',
    placeholder: 'एक शब्द या कुछ पंक्तियाँ लिखें…',
    primary_label: 'यह त्याग सहेजें',
  },
  stillness_named: {
    title: 'जो शांत हुआ उसे लिखें',
    sanatan_context: 'शांति तब आती है जब ध्यान एक स्थिर आधार पर लौट आता है।',
    why_we_ask: 'जो स्थिर हुआ उसे नाम देने से शोर के नीचे की ज़मीन पहचान में आती है।',
    prompt: 'अब क्या शांत लग रहा है?',
    placeholder: 'एक शब्द या कुछ पंक्तियाँ लिखें…',
    primary_label: 'यह शांति सहेजें',
  },
  clarity_journal: {
    title: 'एक ईमानदार प्रश्न लिखें',
    sanatan_context: 'स्पष्टता तब आती है जब हम भ्रम का पालन करना बंद करते हैं और देखते हैं कि वास्तव में क्या है।',
    why_we_ask: 'प्रश्न लिखने से असली निर्णय उसके आसपास के शोर से अलग हो जाता है।',
    prompt: 'वो प्रश्न क्या है जिसके साथ आप वास्तव में बैठे हैं?',
    placeholder: 'अपना ईमानदार प्रश्न लिखें…',
    primary_label: 'यह प्रश्न सहेजें',
  },
  joy_carry: {
    title: 'एक छोटी खुशी ले चलें',
    sanatan_context: 'आनंद को कारण की ज़रूरत नहीं। देखना ही अभ्यास है।',
    why_we_ask: 'एक छोटी खुशी को नाम देने से वह अनदेखी नहीं रहती।',
    prompt: 'आप किस बात के देखने पर खुश हैं?',
    placeholder: 'कुछ एक बात लिखें, चाहे कितनी भी छोटी हो…',
    primary_label: 'यह खुशी ले चलें',
  },
};

export const CARRY_MEMORY_MODAL: Record<string, CarryModalCopy> = {
  connection_named: {
    title: 'Name someone who matters',
    sanatan_context: 'Sambandha reminds us that even one true bond can hold us.',
    why_we_ask: 'Naming someone helps you return from feeling alone to one thread of care.',
    prompt: 'Who is close to your heart right now?',
    placeholder: 'Write a name, relationship, or a few words…',
    primary_label: 'Save this connection',
  },
  joy_named: {
    title: 'Write what\'s good right now',
    sanatan_context: 'Santosha begins by noticing what is already enough.',
    why_we_ask: 'Writing one good thing helps the mind stay with it instead of rushing past it.',
    prompt: 'What feels good, steady, or simply enough right now?',
    placeholder: 'Write one good thing…',
    primary_label: 'Save this joy',
  },
  growth_journal: {
    title: 'Write what you noticed',
    sanatan_context: 'Growth ripens through one right action, not speed.',
    why_we_ask: 'Naming what you noticed helps it become something real.',
    prompt: 'What came up, or what is becoming clearer?',
    placeholder: 'Write what came up…',
    primary_label: 'Save this',
  },
  connection_reach_out: {
    title: 'Reach out to one person',
    sanatan_context: 'A short act of reaching is itself the practice of sambandha.',
    why_we_ask: 'Writing the message, even without sending, brings the connection closer.',
    prompt: 'Write a short message to someone who matters.',
    placeholder: 'Your message…',
    primary_label: 'Save and copy message',
  },
  release_named: {
    title: 'Name what you\'re setting down',
    sanatan_context: 'Letting go is not giving up. It is loosening the grip so life can move again.',
    why_we_ask: 'Naming the weight is the first step to setting it down.',
    prompt: 'What is ready to be set down for now?',
    placeholder: 'Write one word or a few lines…',
    primary_label: 'Save this release',
  },
  stillness_named: {
    title: 'Write what became still',
    sanatan_context: 'Stillness begins when attention returns to one steady anchor.',
    why_we_ask: 'Naming what settled helps you recognize the ground beneath the noise.',
    prompt: 'What feels quieter now?',
    placeholder: 'Write one word or a few lines…',
    primary_label: 'Save this stillness',
  },
  clarity_journal: {
    title: 'Write one honest question',
    sanatan_context: 'Clarity comes when we stop obeying confusion and look at what is actually here.',
    why_we_ask: 'Writing the question separates the real decision from the noise around it.',
    prompt: 'What is the question you are actually sitting with?',
    placeholder: 'Write your honest question…',
    primary_label: 'Save this question',
  },
  joy_carry: {
    title: 'Carry a small gladness',
    sanatan_context: 'Ananda does not need reasons. Noticing is the practice.',
    why_we_ask: 'Naming a small gladness keeps it from passing unnoticed.',
    prompt: 'What are you glad you noticed?',
    placeholder: 'Write one thing, however small…',
    primary_label: 'Carry this gladness',
  },
};

// ─── classifyActionFamily ────────────────────────────────────────────────────

export function classifyActionFamily(action: ActionEnvelope): JourneyActionFamily {
  switch (action.action_type) {
    case 'runner_mantra':   return 'mantra';
    case 'runner_sankalp':  return 'sankalp';
    case 'runner_practice': return 'practice';
    case 'inquiry':         return 'inquiry';
    case 'teaching':        return 'teaching';
    case 'in_room_carry':   return 'carry';
    case 'in_room_step': {
      const tid = action.step_payload?.template_id ?? '';
      if (tid.startsWith('step_breathe_'))        return 'breathe';
      if (tid.startsWith('step_sit_'))            return 'sit';
      if (tid.startsWith('step_walk_'))           return 'walk';
      if (tid.startsWith('step_hand_on_heart_'))  return 'heart';
      if (tid.startsWith('step_grounding_'))      return 'grounding';
      if (
        tid.startsWith('step_text_input_') ||
        tid.startsWith('step_journal_')
      )                                            return 'text_input';
      if (tid.startsWith('step_voice_note'))       return 'voice_note';
      if (tid.startsWith('step_reach_out'))        return 'reach_out';
      return 'text_input'; // safe fallback for unknown step templates
    }
    default: return 'unknown';
  }
}

// ─── Copy defaults ───────────────────────────────────────────────────────────

export const ACTION_FAMILY_COMPANION_DEFAULTS: Record<JourneyActionFamily, string> = {
  mantra:     'This sound is here to steady you before the next step.',
  sankalp:    'A clear offering steadies the mind for what comes next.',
  practice:   'The practice is the step. Let it be simple.',
  breathe:    'One steady rhythm before the next step.',
  sit:        'A moment of stillness before the next step.',
  walk:       'Moving the body helps the mind release what it is holding.',
  heart:      'Your hand on your heart is a return to what is steady.',
  grounding:  'We are returning from thoughts to what is actually here.',
  text_input: 'Putting it into words helps the mind stop carrying it alone.',
  voice_note: 'Sometimes the heart softens when it is heard aloud.',
  reach_out:  'Connection does not require perfect words. One honest line is enough.',
  inquiry:    'Let\'s find the question underneath all of this.',
  teaching:   'One understanding before the next step.',
  carry:      'Naming what matters helps you hold it with intention.',
  unknown:    'Mitra is with you for this step.',
};

export const ACTION_FAMILY_COMPANION_DEFAULTS_HI: Record<JourneyActionFamily, string> = {
  mantra:     'यह ध्वनि अगले कदम से पहले आपको स्थिर करने के लिए है।',
  sankalp:    'एक स्पष्ट अर्पण मन को जो आगे है उसके लिए स्थिर करता है।',
  practice:   'अभ्यास ही कदम है। इसे सरल रहने दें।',
  breathe:    'अगले कदम से पहले एक स्थिर लय।',
  sit:        'अगले कदम से पहले एक पल की शांति।',
  walk:       'शरीर को हिलाने से मन वो छोड़ देता है जो वो पकड़े हुए है।',
  heart:      'हृदय पर हाथ रखना उस ओर लौटना है जो स्थिर है।',
  grounding:  'हम विचारों से उस ओर लौट रहे हैं जो वास्तव में यहाँ है।',
  text_input: 'शब्दों में डालने से मन उसे अकेले उठाना बंद करता है।',
  voice_note: 'कभी-कभी हृदय तब नरम होता है जब उसे सुना जाता है।',
  reach_out:  'जुड़ाव के लिए सही शब्दों की ज़रूरत नहीं। एक ईमानदार पंक्ति काफी है।',
  inquiry:    'इन सबके नीचे का प्रश्न खोजते हैं।',
  teaching:   'अगले कदम से पहले एक समझ।',
  carry:      'जो मायने रखता है उसे नाम देना आपको उसे इरादे के साथ थामने में मदद करता है।',
  unknown:    'मित्र इस कदम के लिए आपके साथ है।',
};

export const STEP_INTRO_LINES: Record<JourneyActionFamily, string> = {
  mantra:     'A sound to settle the mind',
  sankalp:    'An offering',
  practice:   'A practice',
  breathe:    'A breath, together',
  sit:        'A moment of stillness',
  walk:       'A walk to clear the way',
  heart:      'A hand on the heart',
  grounding:  'A return to the room',
  text_input: 'A reflection',
  voice_note: 'A moment to speak',
  reach_out:  'A reach toward connection',
  inquiry:    'A question to sit with',
  teaching:   'One understanding',
  carry:      'Something to carry forward',
  unknown:    'A step',
};

export const STEP_INTRO_LINES_HI: Record<JourneyActionFamily, string> = {
  mantra:     'मन को स्थिर करने की ध्वनि',
  sankalp:    'एक अर्पण',
  practice:   'एक अभ्यास',
  breathe:    'एक साथ एक सांस',
  sit:        'शांति का एक पल',
  walk:       'रास्ता साफ करने की सैर',
  heart:      'हृदय पर एक हाथ',
  grounding:  'कमरे में लौटना',
  text_input: 'एक विचार',
  voice_note: 'बोलने का एक पल',
  reach_out:  'जुड़ाव की ओर एक हाथ',
  inquiry:    'एक प्रश्न जिसके साथ बैठें',
  teaching:   'एक समझ',
  carry:      'आगे ले जाने के लिए कुछ',
  unknown:    'एक कदम',
};

const ROOM_ARRIVAL_DEFAULTS: Record<string, string> = {
  room_stillness:  'Something has you unsettled. You\'re here. That is enough.',
  room_release:    'Something heavy brought you here. You don\'t have to carry it through this.',
  room_clarity:    'The mind is circling something it cannot resolve. Clarity is already there.',
  room_growth:     'You want to move, but something is holding you. One honest step is all that is needed.',
  room_connection: 'The heart feels far from others. You came. That is the first step.',
  room_joy:        'Something good is present today. Let it be named. Let it stay.',
};

const ROOM_ARRIVAL_DEFAULTS_HI: Record<string, string> = {
  room_stillness:  'कुछ है जो आपको बेचैन कर रहा है। आप यहाँ हैं। यही काफी है।',
  room_release:    'कुछ भारी आपको यहाँ लाया। इसे पूरे रास्ते उठाकर नहीं चलना।',
  room_clarity:    'मन किसी चीज़ के चारों ओर घूम रहा है जिसे वो सुलझा नहीं पा रहा। स्पष्टता पहले से यहाँ है।',
  room_growth:     'आप आगे बढ़ना चाहते हैं, पर कुछ रोक रहा है। बस एक ईमानदार कदम काफी है।',
  room_connection: 'हृदय दूसरों से दूर लग रहा है। आप आए। यही पहला कदम है।',
  room_joy:        'आज कुछ अच्छा मौजूद है। उसे नाम लेने दें। उसे रहने दें।',
};

const ROOM_WISDOM_DEFAULTS: Record<string, string> = {
  room_stillness:  'Pratyahara — the turning inward — is the first step toward peace.',
  room_release:    'Sharanagati — the act of offering what you cannot hold — is not weakness.',
  room_clarity:    'Viveka — the capacity to discern — is not acquired. It is uncovered.',
  room_growth:     'Tapasya — sustained effort without attachment to the fruit — is how growth ripens.',
  room_connection: 'Sambandha — the thread of genuine connection — begins in the heart, not in words.',
  room_joy:        'Santosha — contentment — is the recognition of what is already enough.',
};

const ROOM_WISDOM_DEFAULTS_HI: Record<string, string> = {
  room_stillness:  'प्रत्याहार — भीतर की ओर मुड़ना — शांति की ओर पहला कदम है।',
  room_release:    'शरणागति — जो नहीं संभाला जा सकता उसे अर्पित करना — कमज़ोरी नहीं है।',
  room_clarity:    'विवेक — विभेद करने की शक्ति — अर्जित नहीं की जाती। उघाड़ी जाती है।',
  room_growth:     'तपस्या — फल की आसक्ति के बिना निरंतर प्रयास — ऐसे ही विकास पकता है।',
  room_connection: 'संबंध — सच्चे जुड़ाव का धागा — हृदय में शुरू होता है, शब्दों में नहीं।',
  room_joy:        'संतोष — तृप्ति — उसकी पहचान है जो पहले से पर्याप्त है।',
};

// ─── ROOM_COMPLETION_LINES (match RoomGuidedSection.tsx exactly) ─────────────

export const ROOM_COMPLETION_LINES: Record<string, { message: string; subtext: string }> = {
  room_stillness:  { message: 'You made space.',                subtext: 'Let this quiet stay with you for a little while.' },
  room_release:    { message: 'You set something down.',        subtext: 'You do not have to carry it in the same way now.' },
  room_clarity:    { message: 'You sat with the question.',     subtext: 'One honest look is enough for now.' },
  room_growth:     { message: 'You moved toward what matters.', subtext: 'Small sincere action is still action.' },
  room_connection: { message: 'You softened toward connection.',subtext: 'Let the heart stay open, gently.' },
  room_joy:        { message: 'You noticed what is good.',      subtext: 'Let this become part of your day.' },
};

export const ROOM_COMPLETION_LINES_HI: Record<string, { message: string; subtext: string }> = {
  room_stillness:  { message: 'आपने जगह बनाई।',                  subtext: 'इस शांति को थोड़ी देर साथ रहने दें।' },
  room_release:    { message: 'आपने कुछ रख दिया।',               subtext: 'अब उसे उसी तरह उठाना ज़रूरी नहीं।' },
  room_clarity:    { message: 'आप प्रश्न के साथ बैठे।',          subtext: 'अभी एक ईमानदार नज़र काफी है।' },
  room_growth:     { message: 'आप जो मायने रखता है उसकी ओर बढ़े।', subtext: 'छोटा सच्चा कार्य भी कार्य है।' },
  room_connection: { message: 'आप जुड़ाव की ओर नरम हुए।',        subtext: 'हृदय को धीरे से खुला रहने दें।' },
  room_joy:        { message: 'आपने जो अच्छा है उसे देखा।',     subtext: 'इसे अपने दिन का हिस्सा बनने दें।' },
};

// ─── BETWEEN_STEP_MATRIX ─────────────────────────────────────────────────────
// One entry per (completedFamily, nextFamily) pair. Falls back to '*' then generic.

const BETWEEN_STEP_MATRIX: Partial<Record<JourneyActionFamily, Record<string, string>>> = {
  mantra: {
    breathe:    'Let the sound settle. One breath now.',
    sit:        'Let the sound settle. A moment of stillness.',
    grounding:  'The sound has steadied you. Now, return to the room.',
    inquiry:    'The sound has steadied you. Now, a question.',
    text_input: 'Let the sound settle. Now name what remains.',
    carry:      'Let the sound settle. Now carry one thing forward.',
    heart:      'Let the sound settle. Now, a hand on the heart.',
    walk:       'Let the sound settle. The next step is waiting.',
    '*':        'Let the sound settle. The next step is waiting.',
  },
  breathe: {
    inquiry:    'Your breath has arrived. Now, a closer look.',
    grounding:  'Good. The breath has settled. Now, return to the room.',
    text_input: 'The breath held you. Now name what remains.',
    carry:      'The breath held you. Now, name what you\'re carrying.',
    heart:      'Good. One breath taken. Now, a hand on the heart.',
    walk:       'Good. One breath taken. Now, a walk to clear the way.',
    mantra:     'Good. One breath taken. Now, a sound to hold it.',
    '*':        'Good. Let that land for a moment.',
  },
  sit: {
    inquiry:    'You sat with it. Now we can look more clearly.',
    text_input: 'You sat with it. Now name what rose.',
    carry:      'You sat with it. Now carry one thing forward.',
    '*':        'You stayed with it. Now, gently, the next.',
  },
  walk: {
    text_input: 'You moved through it. Now name what you found.',
    carry:      'You moved through it. Now name what formed.',
    inquiry:    'You moved through it. Now, a question.',
    mantra:     'You moved through it. Now, a sound to close.',
    '*':        'You moved through it. Now, gently, settle.',
  },
  heart: {
    text_input: 'Your heart has steadied. Now name what it holds.',
    carry:      'Your heart has steadied. Now, name someone who matters.',
    inquiry:    'Your heart has steadied. Now, a question.',
    mantra:     'Your heart has steadied. Now, a sound to carry forward.',
    breathe:    'Your heart has steadied. One breath now.',
    '*':        'Your heart has steadied. Now, gently, forward.',
  },
  grounding: {
    inquiry:    'Good. Now that the mind has slowed, we can look more clearly.',
    breathe:    'The senses are awake. One breath before we continue.',
    text_input: 'You are present. Now, name what you notice.',
    carry:      'You are present. Now, carry one thing forward.',
    teaching:   'Good. The body has returned. The mind will follow.',
    '*':        'Good. The body has returned. The mind will follow.',
  },
  inquiry: {
    text_input: 'You found the question. Now hold it in your own words.',
    carry:      'You named it. Now carry it with intention.',
    breathe:    'The question is clear. One breath before you write.',
    walk:       'The question is clear. Now, a walk to let it settle.',
    mantra:     'One step has been seen. Let the sound steady it.',
    '*':        'Something has been seen. Let the next step come gently.',
  },
  text_input: {
    carry:      'You wrote what was there. Now carry one thing forward.',
    breathe:    'You wrote what was there. One breath now.',
    mantra:     'Let the sound carry what the words couldn\'t.',
    '*':        'Good. You stayed with it.',
  },
  teaching: {
    inquiry:    'One understanding before the question.',
    grounding:  'Good. The body has returned. The mind will follow.',
    carry:      'What matters is named. Now carry it forward.',
    '*':        'Good. Now, gently, the next.',
  },
  carry: {
    mantra:     'What matters is named. Now, a sound to close this.',
    sankalp:    'What is named can now be offered. Take it gently.',
    '*':        'What matters is named. Now, gently, forward.',
  },
  sankalp: {
    carry:      'The offering has been made. Now carry one thing forward.',
    '*':        'Good. You stayed with it.',
  },
  voice_note: {
    carry:      'You spoke it. Now hold one word from it.',
    mantra:     'You spoke it. Now, a sound to close.',
    '*':        'You spoke what was there. The next step is ready.',
  },
  reach_out: {
    '*':        'One honest line. That is enough.',
  },
  practice: {
    '*':        'Good. The practice is done. Now, gently, the next.',
  },
  unknown: {
    '*':        'Good. We will move gently from here.',
  },
};

const BETWEEN_STEP_MATRIX_HI: Partial<Record<JourneyActionFamily, Record<string, string>>> = {
  mantra: {
    breathe:    'ध्वनि को बैठने दें। अब एक सांस।',
    sit:        'ध्वनि को बैठने दें। शांति का एक पल।',
    grounding:  'ध्वनि ने आपको स्थिर किया। अब कमरे में लौटें।',
    inquiry:    'ध्वनि ने आपको स्थिर किया। अब एक प्रश्न।',
    text_input: 'ध्वनि को बैठने दें। अब जो बचा है उसे नाम दें।',
    carry:      'ध्वनि को बैठने दें। अब एक चीज़ आगे ले चलें।',
    heart:      'ध्वनि को बैठने दें। अब हृदय पर एक हाथ।',
    walk:       'ध्वनि को बैठने दें। अगला कदम इंतज़ार कर रहा है।',
    '*':        'ध्वनि को बैठने दें। अगला कदम इंतज़ार कर रहा है।',
  },
  breathe: {
    inquiry:    'आपकी सांस आ गई है। अब, करीब से देखते हैं।',
    grounding:  'अच्छा। सांस स्थिर हो गई। अब कमरे में लौटें।',
    text_input: 'सांस ने आपको थामा। अब जो बचा है उसे नाम दें।',
    carry:      'सांस ने आपको थामा। अब, जो उठाए हैं उसे नाम दें।',
    heart:      'अच्छा। एक सांस ली। अब हृदय पर एक हाथ।',
    walk:       'अच्छा। एक सांस ली। अब, रास्ता साफ करने की सैर।',
    mantra:     'अच्छा। एक सांस ली। अब, इसे थामे रखने की ध्वनि।',
    '*':        'अच्छा। उसे एक पल के लिए उतरने दें।',
  },
  sit: {
    inquiry:    'आप इसके साथ बैठे। अब हम और स्पष्ट देख सकते हैं।',
    text_input: 'आप इसके साथ बैठे। अब जो उभरा उसे नाम दें।',
    carry:      'आप इसके साथ बैठे। अब एक चीज़ आगे ले चलें।',
    '*':        'आप इसके साथ रहे। अब, धीरे से, आगे।',
  },
  walk: {
    text_input: 'आप इससे होकर गुज़रे। अब जो मिला उसे नाम दें।',
    carry:      'आप इससे होकर गुज़रे। अब जो बना उसे नाम दें।',
    inquiry:    'आप इससे होकर गुज़रे। अब, एक प्रश्न।',
    mantra:     'आप इससे होकर गुज़रे। अब, समाप्त करने की ध्वनि।',
    '*':        'आप इससे होकर गुज़रे। अब, धीरे से, स्थिर हों।',
  },
  heart: {
    text_input: 'आपका हृदय स्थिर हुआ। अब जो वो थामे है उसे नाम दें।',
    carry:      'आपका हृदय स्थिर हुआ। अब, किसी महत्वपूर्ण का नाम लें।',
    inquiry:    'आपका हृदय स्थिर हुआ। अब, एक प्रश्न।',
    mantra:     'आपका हृदय स्थिर हुआ। अब, आगे ले जाने की ध्वनि।',
    breathe:    'आपका हृदय स्थिर हुआ। अब एक सांस।',
    '*':        'आपका हृदय स्थिर हुआ। अब, धीरे से, आगे।',
  },
  grounding: {
    inquiry:    'अच्छा। अब जब मन धीमा हुआ, हम और स्पष्ट देख सकते हैं।',
    breathe:    'इंद्रियाँ जाग गई हैं। जारी रखने से पहले एक सांस।',
    text_input: 'आप उपस्थित हैं। अब, जो आप देखते हैं उसे नाम दें।',
    carry:      'आप उपस्थित हैं। अब, एक चीज़ आगे ले चलें।',
    teaching:   'अच्छा। शरीर लौट आया। मन अनुसरण करेगा।',
    '*':        'अच्छा। शरीर लौट आया। मन अनुसरण करेगा।',
  },
  inquiry: {
    text_input: 'आपने प्रश्न पाया। अब उसे अपने शब्दों में थामें।',
    carry:      'आपने नाम लिया। अब उसे इरादे के साथ ले चलें।',
    breathe:    'प्रश्न स्पष्ट है। लिखने से पहले एक सांस।',
    walk:       'प्रश्न स्पष्ट है। अब, इसे बैठने देने की सैर।',
    mantra:     'एक कदम देखा गया। ध्वनि उसे स्थिर करे।',
    '*':        'कुछ देखा गया। अगला कदम धीरे से आने दें।',
  },
  text_input: {
    carry:      'आपने जो था वो लिखा। अब एक चीज़ आगे ले चलें।',
    breathe:    'आपने जो था वो लिखा। अब एक सांस।',
    mantra:     'ध्वनि वो उठाए जो शब्द नहीं उठा सके।',
    '*':        'अच्छा। आप इसके साथ रहे।',
  },
  teaching: {
    inquiry:    'प्रश्न से पहले एक समझ।',
    grounding:  'अच्छा। शरीर लौट आया। मन अनुसरण करेगा।',
    carry:      'जो मायने रखता है उसे नाम मिला। अब उसे आगे ले चलें।',
    '*':        'अच्छा। अब, धीरे से, आगे।',
  },
  carry: {
    mantra:     'जो मायने रखता है उसे नाम मिला। अब, इसे समाप्त करने की ध्वनि।',
    sankalp:    'जो नाम लिया गया वो अब अर्पित हो सकता है। इसे धीरे से लें।',
    '*':        'जो मायने रखता है उसे नाम मिला। अब, धीरे से, आगे।',
  },
  sankalp: {
    carry:      'अर्पण हो गया। अब एक चीज़ आगे ले चलें।',
    '*':        'अच्छा। आप इसके साथ रहे।',
  },
  voice_note: {
    carry:      'आपने बोला। अब उसका एक शब्द थामें।',
    mantra:     'आपने बोला। अब, समाप्त करने की ध्वनि।',
    '*':        'आपने जो था वो बोला। अगला कदम तैयार है।',
  },
  reach_out: {
    '*':        'एक ईमानदार पंक्ति। यही काफी है।',
  },
  practice: {
    '*':        'अच्छा। अभ्यास हो गया। अब, धीरे से, आगे।',
  },
  unknown: {
    '*':        'अच्छा। हम यहाँ से धीरे से आगे बढ़ेंगे।',
  },
};

export function getBetweenStepLine(params: {
  completedFamily: JourneyActionFamily;
  nextFamily: JourneyActionFamily;
  locale?: string;
}): string {
  const matrix = params.locale === 'hi' ? BETWEEN_STEP_MATRIX_HI : BETWEEN_STEP_MATRIX;
  const row = matrix[params.completedFamily];
  return (
    row?.[params.nextFamily] ??
    row?.['*'] ??
    (params.locale === 'hi' ? 'अच्छा। हम यहाँ से धीरे से आगे बढ़ेंगे।' : 'Good. We will move gently from here.')
  );
}

// ─── Public copy helpers ──────────────────────────────────────────────────────

export function getRoomArrivalCopy(
  roomId: string,
  roomContext?: RoomContext | null,
  locale?: string,
): ArrivalCopy {
  const isHi = locale === 'hi';
  return {
    companionLine:
      roomContext?.situation_acknowledgement_line ??
      roomContext?.room_purpose_line ??
      (isHi ? ROOM_ARRIVAL_DEFAULTS_HI[roomId] : ROOM_ARRIVAL_DEFAULTS[roomId]) ??
      (isHi ? 'आप यहाँ हैं। यही काफी है।' : 'You\'re here. That is enough.'),
    wisdomLine:
      roomContext?.sanatan_insight_line ??
      (isHi ? ROOM_WISDOM_DEFAULTS_HI[roomId] : ROOM_WISDOM_DEFAULTS[roomId]) ??
      '',
  };
}

export function getRoomStepCompanionLine(params: {
  action: ActionEnvelope;
  roomContext?: RoomContext | null;
  locale?: string;
}): string {
  const defaults = params.locale === 'hi' ? ACTION_FAMILY_COMPANION_DEFAULTS_HI : ACTION_FAMILY_COMPANION_DEFAULTS;
  return (
    params.action.helper_line ??
    params.action.step_payload?.memory_modal?.sanatan_context ??
    params.action.step_payload?.memory_modal?.why_we_ask ??
    params.roomContext?.sanatan_insight_line ??
    defaults[classifyActionFamily(params.action)]
  );
}

export function getStepIntroLine(family: JourneyActionFamily, locale?: string): string {
  return (locale === 'hi' ? STEP_INTRO_LINES_HI : STEP_INTRO_LINES)[family];
}

export function getCompletionCopy(roomId: string, locale?: string): CompletionCopy {
  const isHi = locale === 'hi';
  const completionLines = isHi ? ROOM_COMPLETION_LINES_HI : ROOM_COMPLETION_LINES;
  const completionHeader = isHi ? ROOM_COMPLETION_HEADER_HI : ROOM_COMPLETION_HEADER;
  const nextStepLine = isHi ? ROOM_NEXT_STEP_LINE_HI : ROOM_NEXT_STEP_LINE;
  return {
    sanatanHeader: completionHeader[roomId as keyof typeof ROOM_COMPLETION_HEADER] ?? '',
    message:       completionLines[roomId]?.message ?? (isHi ? 'आप इसके साथ रहे।' : 'You stayed with it.'),
    subtext:       completionLines[roomId]?.subtext ?? (isHi ? 'आप इस कमरे में कभी भी लौट सकते हैं।' : 'You can return to this room anytime.'),
    nextStepLine:  nextStepLine[roomId as keyof typeof ROOM_NEXT_STEP_LINE] ?? '',
  };
}

export function getCarryPrompt(writesEvent: string | null | undefined, locale?: string): string {
  const modal = locale === 'hi' ? CARRY_MEMORY_MODAL_HI : CARRY_MEMORY_MODAL;
  const fallback = locale === 'hi' ? 'अभी क्या मौजूद है?' : 'What is present right now?';
  if (!writesEvent) return fallback;
  return modal[writesEvent]?.prompt ?? fallback;
}

export function getCarryCTA(writesEvent: string | null | undefined, locale?: string): string {
  const modal = locale === 'hi' ? CARRY_MEMORY_MODAL_HI : CARRY_MEMORY_MODAL;
  const fallback = locale === 'hi' ? 'इसे उतरने दें' : 'Let this land';
  if (!writesEvent) return fallback;
  return modal[writesEvent]?.primary_label ?? fallback;
}

export function getCarryCompanion(writesEvent: string | null | undefined, locale?: string): string {
  const modal = locale === 'hi' ? CARRY_MEMORY_MODAL_HI : CARRY_MEMORY_MODAL;
  const defaults = locale === 'hi' ? ACTION_FAMILY_COMPANION_DEFAULTS_HI : ACTION_FAMILY_COMPANION_DEFAULTS;
  if (!writesEvent) return defaults['carry'];
  return (
    modal[writesEvent]?.why_we_ask ??
    modal[writesEvent]?.sanatan_context ??
    defaults['carry']
  );
}

export function getCarryPlaceholder(writesEvent: string | null | undefined, locale?: string): string {
  const modal = locale === 'hi' ? CARRY_MEMORY_MODAL_HI : CARRY_MEMORY_MODAL;
  const fallback = locale === 'hi' ? 'एक शब्द या कुछ पंक्तियाँ लिखें…' : 'Write one word or a few lines…';
  if (!writesEvent) return fallback;
  return modal[writesEvent]?.placeholder ?? fallback;
}

/** Returns the reflective_prompt → prompt → fallback for an inquiry category. */
export function getInquiryCategoryPrompt(category: InquiryCategory, locale?: string): string {
  return (
    category.reflective_prompt ??
    category.prompt ??
    (locale === 'hi' ? 'यह क्या उठाता है?' : 'What does this bring up?')
  );
}
