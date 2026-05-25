/**
 * roomStepCopy — web mirror of apps/mobile/src/blocks/room/roomStepCopy.ts
 *
 * Pure TypeScript (no RN imports). Keep in sync with mobile version.
 * TODO: when the old fallback is retired, extract to @kalpx/contracts
 * and remove both copies.
 */

import {
  ROOM_COMPLETION_HEADER,
  ROOM_NEXT_STEP_LINE,
} from '@kalpx/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JourneyActionFamily =
  | 'mantra'
  | 'sankalp'
  | 'practice'
  | 'breathe'
  | 'sit'
  | 'walk'
  | 'heart'
  | 'grounding'
  | 'text_input'
  | 'voice_note'
  | 'reach_out'
  | 'inquiry'
  | 'teaching'
  | 'carry'
  | 'unknown';

export interface ArrivalCopy {
  companionLine: string;
  wisdomLine: string;
}

export interface CompletionCopy {
  sanatanHeader: string;
  message: string;
  subtext: string;
  nextStepLine: string;
}

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

// ─── CARRY_MEMORY_MODAL ───────────────────────────────────────────────────────

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
    title: "Write what's good right now",
    sanatan_context: 'Santosha begins by noticing what is already enough.',
    why_we_ask: 'Writing one good thing helps the mind stay with it instead of rushing past it.',
    prompt: 'What feels good, steady, or simply enough right now?',
    placeholder: 'Write one good thing…',
    primary_label: 'Save this joy',
  },
  joy_carry: {
    title: 'Carry a small gladness',
    sanatan_context: 'Ananda does not need reasons. Noticing is the practice.',
    why_we_ask: 'Naming a small gladness keeps it from passing unnoticed.',
    prompt: 'What are you glad you noticed?',
    placeholder: 'Write one thing, however small…',
    primary_label: 'Carry this gladness',
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
    title: "Name what you're setting down",
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
};

// ─── classifyActionFamily ─────────────────────────────────────────────────────

// Minimal ActionEnvelope subset needed for classification (avoids importing mobile types)
interface ActionLike {
  action_type: string;
  step_payload?: { template_id?: string } | null;
}

export function classifyActionFamily(action: ActionLike): JourneyActionFamily {
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
      if (tid.startsWith('step_text_input_') || tid.startsWith('step_journal_')) return 'text_input';
      if (tid.startsWith('step_voice_note'))       return 'voice_note';
      if (tid.startsWith('step_reach_out'))        return 'reach_out';
      return 'text_input';
    }
    default: return 'unknown';
  }
}

// ─── Copy defaults ────────────────────────────────────────────────────────────

export const ACTION_FAMILY_COMPANION_DEFAULTS: Record<JourneyActionFamily, string> = {
  mantra:     'This sound is here to steady you before the next step.',
  sankalp:    'This offering asks something clear of you. Take it gently.',
  practice:   'A moment of practice — simple and direct.',
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

export const ROOM_ARRIVAL_DEFAULTS: Record<string, string> = {
  room_stillness:  "Something has you unsettled. You're here. That is enough.",
  room_release:    "Something heavy brought you here. You don't have to carry it through this.",
  room_clarity:    'The mind is circling something it cannot resolve. Clarity is already there.',
  room_growth:     'You want to move, but something is holding you. One honest step is all that is needed.',
  room_connection: 'The heart feels far from others. You came. That is the first step.',
  room_joy:        'Something good is present today. Let it be named. Let it stay.',
};

export const ROOM_WISDOM_DEFAULTS: Record<string, string> = {
  room_stillness:  'Pratyahara — the turning inward — is the first step toward peace.',
  room_release:    'Sharanagati — the act of offering what you cannot hold — is not weakness.',
  room_clarity:    'Viveka — the capacity to discern — is not acquired. It is uncovered.',
  room_growth:     'Tapasya — sustained effort without attachment to the fruit — is how growth ripens.',
  room_connection: 'Sambandha — the thread of genuine connection — begins in the heart, not in words.',
  room_joy:        'Santosha — contentment — is the recognition of what is already enough.',
};

export const ROOM_COMPLETION_LINES: Record<string, { message: string; subtext: string }> = {
  room_stillness:  { message: 'You made space.',                subtext: 'Let this quiet stay with you for a little while.' },
  room_release:    { message: 'You set something down.',        subtext: 'You do not have to carry it in the same way now.' },
  room_clarity:    { message: 'You sat with the question.',     subtext: 'One honest look is enough for now.' },
  room_growth:     { message: 'You moved toward what matters.', subtext: 'Small sincere action is still action.' },
  room_connection: { message: 'You softened toward connection.', subtext: 'Let the heart stay open, gently.' },
  room_joy:        { message: 'You noticed what is good.',      subtext: 'Let this become part of your day.' },
};

// ─── BETWEEN_STEP_MATRIX ──────────────────────────────────────────────────────

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
    carry:      "The breath held you. Now, name what you're carrying.",
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
    mantra:     'Good. Now, gently, the next.',
    '*':        'Good. Now, gently, the next.',
  },
  text_input: {
    carry:      'You wrote what was there. Now carry one thing forward.',
    breathe:    'You wrote what was there. One breath now.',
    mantra:     "Let the sound carry what the words couldn't.",
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
    '*':        'What matters is held. Now, gently, forward.',
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
    '*':        'Good. One step held. The next is ready.',
  },
};

export function getBetweenStepLine(params: {
  completedFamily: JourneyActionFamily;
  nextFamily: JourneyActionFamily;
}): string {
  const row = BETWEEN_STEP_MATRIX[params.completedFamily];
  return (
    row?.[params.nextFamily] ??
    row?.['*'] ??
    'Good. One step held. The next is ready.'
  );
}

// ─── Public copy helpers ──────────────────────────────────────────────────────

interface RoomContextLike {
  situation_acknowledgement_line?: string | null;
  room_purpose_line?: string | null;
  sanatan_insight_line?: string | null;
}

export function getRoomArrivalCopy(roomId: string, roomContext?: RoomContextLike | null): ArrivalCopy {
  return {
    companionLine:
      roomContext?.situation_acknowledgement_line ??
      roomContext?.room_purpose_line ??
      ROOM_ARRIVAL_DEFAULTS[roomId] ??
      "You're here. That is enough.",
    wisdomLine:
      roomContext?.sanatan_insight_line ??
      ROOM_WISDOM_DEFAULTS[roomId] ??
      '',
  };
}

export function getCompletionCopy(roomId: string): CompletionCopy {
  return {
    sanatanHeader: ROOM_COMPLETION_HEADER[roomId as keyof typeof ROOM_COMPLETION_HEADER] ?? '',
    message:       ROOM_COMPLETION_LINES[roomId]?.message ?? 'You stayed with it.',
    subtext:       ROOM_COMPLETION_LINES[roomId]?.subtext ?? 'You can return to this room anytime.',
    nextStepLine:  ROOM_NEXT_STEP_LINE[roomId as keyof typeof ROOM_NEXT_STEP_LINE] ?? '',
  };
}

export function getCarryPrompt(writesEvent: string | null | undefined): string {
  if (!writesEvent) return 'What is present right now?';
  return CARRY_MEMORY_MODAL[writesEvent]?.prompt ?? 'What is present right now?';
}

export function getCarryCTA(writesEvent: string | null | undefined): string {
  if (!writesEvent) return 'Let this land';
  return CARRY_MEMORY_MODAL[writesEvent]?.primary_label ?? 'Let this land';
}

export function getCarryCompanion(writesEvent: string | null | undefined): string {
  if (!writesEvent) return ACTION_FAMILY_COMPANION_DEFAULTS['carry'];
  return (
    CARRY_MEMORY_MODAL[writesEvent]?.why_we_ask ??
    CARRY_MEMORY_MODAL[writesEvent]?.sanatan_context ??
    ACTION_FAMILY_COMPANION_DEFAULTS['carry']
  );
}

export function getCarryPlaceholder(writesEvent: string | null | undefined): string {
  if (!writesEvent) return 'Write one word or a few lines…';
  return CARRY_MEMORY_MODAL[writesEvent]?.placeholder ?? 'Write one word or a few lines…';
}

export function getStepIntroLine(family: JourneyActionFamily): string {
  return STEP_INTRO_LINES[family];
}

interface InquiryCategoryLike {
  reflective_prompt?: string | null;
  prompt?: string | null;
}

export function getInquiryCategoryPrompt(category: InquiryCategoryLike): string {
  return (
    category.reflective_prompt ??
    category.prompt ??
    'What does this bring up?'
  );
}
