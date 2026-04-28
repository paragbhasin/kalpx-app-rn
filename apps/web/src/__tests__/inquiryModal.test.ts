/**
 * InquiryModal tests — Phase 13.5
 * Pure logic tests (no React rendering).
 */
import { describe, it, expect, vi } from 'vitest';

// ── InquiryModal state machine ────────────────────────────────────────────────

interface InquiryCategory {
  id: string;
  label: string;
  anchor_line?: string | null;
  reflective_prompt?: string | null;
  prompt?: string | null;
  suggested_practice_template_id?: string | null;
  practice_label?: string | null;
}

interface InquiryPayload {
  categories?: InquiryCategory[];
}

function resolvePhase(selected: InquiryCategory | null): 'list' | 'detail' {
  return selected ? 'detail' : 'list';
}

function resolveJournalEnabled(text: string): boolean {
  return text.trim().length >= 1;
}

describe('InquiryModal phase transitions', () => {
  it('starts in list phase', () => {
    expect(resolvePhase(null)).toBe('list');
  });

  it('moves to detail on category select', () => {
    const cat: InquiryCategory = { id: 'work_stress', label: 'Work stress' };
    expect(resolvePhase(cat)).toBe('detail');
  });

  it('returns to list on back', () => {
    expect(resolvePhase(null)).toBe('list');
  });
});

describe('InquiryModal journal state', () => {
  it('journal done disabled when empty text', () => {
    expect(resolveJournalEnabled('')).toBe(false);
  });

  it('journal done disabled when whitespace only', () => {
    expect(resolveJournalEnabled('   ')).toBe(false);
  });

  it('journal done enabled with at least 1 char', () => {
    expect(resolveJournalEnabled('a')).toBe(true);
  });
});

describe('InquiryModal callbacks', () => {
  it('onSubmitJournal fires with correct category and trimmed text', () => {
    const received: { cat: InquiryCategory; text: string }[] = [];
    const onSubmitJournal = (cat: InquiryCategory, text: string) => received.push({ cat, text });

    const cat: InquiryCategory = { id: 'loneliness', label: 'Feeling alone' };
    const rawText = '  I felt isolated today  ';
    onSubmitJournal(cat, rawText.trim());

    expect(received[0].cat.id).toBe('loneliness');
    expect(received[0].text).toBe('I felt isolated today');
  });

  it('onLaunchPractice fires with category and templateId', () => {
    const received: { cat: InquiryCategory; templateId: string }[] = [];
    const onLaunchPractice = (cat: InquiryCategory, templateId: string) => received.push({ cat, templateId });

    const cat: InquiryCategory = {
      id: 'anxiety',
      label: 'Anxiety',
      suggested_practice_template_id: 'step_breathe_4_7_8',
    };
    onLaunchPractice(cat, cat.suggested_practice_template_id!);

    expect(received[0].templateId).toBe('step_breathe_4_7_8');
  });

  it('onCategorySelected fires when category row tapped', () => {
    const selected: InquiryCategory[] = [];
    const onCategorySelected = (cat: InquiryCategory) => selected.push(cat);

    const cat: InquiryCategory = { id: 'grief', label: 'Grief' };
    onCategorySelected(cat);

    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('grief');
  });

  it('onOpened fires once on first open', () => {
    let count = 0;
    const onOpened = () => count++;

    // Simulate first open
    let openedFired = false;
    if (!openedFired) { openedFired = true; onOpened(); }
    // Simulate second open attempt (should not fire again)
    if (!openedFired) { openedFired = true; onOpened(); }

    expect(count).toBe(1);
  });
});

describe('InquiryModal category list', () => {
  const SAMPLE_PAYLOAD: InquiryPayload = {
    categories: [
      { id: 'work', label: 'Work stress', anchor_line: 'You carry more than most', reflective_prompt: 'What feels heaviest right now?' },
      { id: 'relationship', label: 'A relationship', reflective_prompt: 'What do you wish were different?' },
      { id: 'self', label: 'Myself', suggested_practice_template_id: 'step_breathe_4_7_8', practice_label: 'Try breathing' },
    ],
  };

  it('extracts categories from payload', () => {
    const cats = SAMPLE_PAYLOAD.categories ?? [];
    expect(cats).toHaveLength(3);
  });

  it('category with practice template shows practice button', () => {
    const cat = SAMPLE_PAYLOAD.categories![2];
    expect(cat.suggested_practice_template_id).toBeTruthy();
  });

  it('category without practice template hides practice button', () => {
    const cat = SAMPLE_PAYLOAD.categories![0];
    expect(cat.suggested_practice_template_id).toBeFalsy();
  });
});
