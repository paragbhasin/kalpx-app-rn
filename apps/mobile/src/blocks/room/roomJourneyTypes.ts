/**
 * RoomJourneyRenderer — shared types.
 *
 * These types are pure data shapes; no RN imports. Safe to mirror
 * into apps/web/src/lib/ verbatim.
 */

export type JourneyPhaseId =
  | 'arrival'           // Room title + companion + wisdom; tap-only
  | 'action_intro'      // "Mitra begins with" + label + companion; Begin CTA
  | 'inline_action'     // Active practice body (timer, grounding, text, inquiry, carry…)
  | 'runner_wait'       // Holding beat while mantra/sankalp/practice runner is active
  | 'next_gentle_step'  // Between-action contextual bridge; tap-to-advance, no timer
  | 'completion_return' // Sanatan header + message + chips + return CTA

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

export interface JourneyPhase {
  id: JourneyPhaseId;
  actionIndex: number;
  /** Only set when id === 'inline_action' and action is inquiry. */
  subPhase?: 'inquiry_list' | 'inquiry_detail';
  /** id of the selected inquiry category (when subPhase === 'inquiry_detail'). */
  selectedCategoryId?: string;
  /** Set on next_gentle_step to compute the between-step line. */
  completedFamily?: JourneyActionFamily;
  nextFamily?: JourneyActionFamily;
}

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
