import { webStorage } from "../lib/webStorage";

/**
 * Remembers which community practices the user has already completed once.
 *
 * Community linked items (from CommunityPostCard) can be done exactly once. The
 * first time, the practice runs normally and is marked "done" on completion.
 * The next time the user taps to start it, CommunityPostCard blocks the re-run
 * and instead offers to add the practice to their Daily Rhythm.
 *
 * Mirrors apps/mobile/src/utils/communityRhythmOffer.ts (localStorage here vs
 * AsyncStorage on mobile). Only knows about completions made after this feature
 * shipped.
 */

const doneKey = (itemId: string) => `community_practice_done:${itemId}`;

/** Mark a community practice as completed (called from the runner on finish). */
export async function markCommunityPracticeDone(itemId: string): Promise<void> {
  try {
    const id = String(itemId || "");
    if (!id) return;
    await webStorage.setItem(doneKey(id), "1");
  } catch (e) {
    console.warn("[communityRhythmOffer] mark-done failed", e);
  }
}

/** Has the user already completed this community practice once? */
export async function hasCompletedCommunityPractice(
  itemId: string,
): Promise<boolean> {
  try {
    const id = String(itemId || "");
    if (!id) return false;
    return (await webStorage.getItem(doneKey(id))) === "1";
  } catch {
    return false;
  }
}
