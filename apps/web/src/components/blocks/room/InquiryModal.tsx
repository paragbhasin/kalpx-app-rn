/**
 * InquiryModal — web equivalent of RN InquiryModal (Phase 13.5).
 * Two-screen flow: category list → category detail with journal/practice actions.
 */
import React, { useState, useEffect } from 'react';

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
  body?: string;
  description?: string;
  prompt?: string;
}

const MAX_TEXT = 1000;

interface Props {
  visible: boolean;
  label: string;
  inquiryPayload?: InquiryPayload | null;
  onCancel: () => void;
  onLaunchPractice: (category: InquiryCategory, templateId: string) => void;
  onSubmitJournal: (category: InquiryCategory, text: string) => void;
  onOpened?: () => void;
  onCategorySelected?: (category: InquiryCategory) => void;
}

export function InquiryModal({
  visible,
  label,
  inquiryPayload,
  onCancel,
  onLaunchPractice,
  onSubmitJournal,
  onOpened,
  onCategorySelected,
}: Props) {
  const [selected, setSelected] = useState<InquiryCategory | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [openedFired, setOpenedFired] = useState(false);

  useEffect(() => {
    if (visible && !openedFired) {
      setOpenedFired(true);
      onOpened?.();
    }
    if (!visible) {
      setOpenedFired(false);
      setSelected(null);
      setJournalOpen(false);
      setJournalText('');
    }
  }, [visible, openedFired, onOpened]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onCancel]);

  if (!visible) return null;

  const categories = inquiryPayload?.categories ?? [];

  const handleSelect = (cat: InquiryCategory) => {
    setSelected(cat);
    setJournalOpen(false);
    setJournalText('');
    onCategorySelected?.(cat);
  };

  const handleBack = () => {
    setSelected(null);
    setJournalOpen(false);
    setJournalText('');
  };

  const handleJournalDone = () => {
    if (!selected) return;
    const trimmed = journalText.trim();
    if (trimmed.length < 1) return;
    onSubmitJournal(selected, trimmed);
  };

  const handlePractice = () => {
    if (!selected) return;
    const tid = selected.suggested_practice_template_id;
    if (!tid) return;
    onLaunchPractice(selected, tid);
  };

  const currentTitle = selected ? selected.label : label;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      data-testid="inquiry-modal-backdrop"
    >
      <div
        data-testid="inquiry-modal"
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fdf8ef',
          borderRadius: '24px 24px 0 0',
          padding: '0 0 32px',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0E0E2' }} />
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 8 }}>
          {selected ? (
            <button
              data-testid="inquiry-modal-back"
              onClick={handleBack}
              style={{ background: 'none', border: 'none', fontSize: 15, color: '#6E6E73', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            >
              Back
            </button>
          ) : (
            <button
              data-testid="inquiry-modal-cancel"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', fontSize: 15, color: '#6E6E73', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            >
              Cancel
            </button>
          )}
          <p style={{ flex: 1, fontSize: 16, fontWeight: 600, color: '#432104', textAlign: 'center', margin: 0 }}>
            {currentTitle}
          </p>
          {/* Spacer to balance the left button */}
          <div style={{ width: 50, flexShrink: 0 }} />
        </div>

        {/* Body */}
        <div style={{ padding: '12px 24px 0' }}>
          {!selected ? (
            /* Category list */
            <div data-testid="inquiry-modal-category-list">
              {categories.length === 0 ? (
                <p style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center', padding: '40px 0' }}>No categories.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      data-testid={`inquiry-modal-category-${cat.id}`}
                      onClick={() => handleSelect(cat)}
                      style={{
                        padding: '16px',
                        borderRadius: 28,
                        border: '0.4px solid #c89a47',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#432104' }}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Category detail */
            <div data-testid="inquiry-modal-category-detail">
              {selected.anchor_line && (
                <p style={{ fontSize: 16, color: '#432104', textAlign: 'center', lineHeight: 1.75, marginBottom: 16, fontWeight: 300 }}>
                  {selected.anchor_line}
                </p>
              )}
              <p style={{ fontSize: 15, color: '#432104', textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>
                {selected.reflective_prompt || selected.prompt || ''}
              </p>

              {!journalOpen ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selected.suggested_practice_template_id && (
                    <button
                      data-testid="inquiry-modal-try-practice"
                      onClick={handlePractice}
                      style={{
                        padding: 15,
                        borderRadius: 15,
                        border: '0.3px solid #9f9f9f',
                        background: '#FBF5F5',
                        fontSize: 17,
                        fontWeight: 600,
                        color: '#432104',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      {selected.practice_label || 'Try a practice'}
                    </button>
                  )}
                  <button
                    data-testid="inquiry-modal-open-journal"
                    onClick={() => setJournalOpen(true)}
                    style={{
                      padding: 15,
                      borderRadius: 15,
                      border: '0.3px solid #9f9f9f',
                      background: '#FBF5F5',
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#432104',
                      cursor: 'pointer',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    Journal on this
                  </button>
                </div>
              ) : (
                <div data-testid="inquiry-modal-journal-block">
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value.slice(0, MAX_TEXT))}
                    placeholder="Write what comes..."
                    data-testid="inquiry-modal-journal-input"
                    maxLength={MAX_TEXT}
                    style={{
                      width: '100%',
                      minHeight: 160,
                      border: '1px solid #D8D8D8',
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 15,
                      color: '#432104',
                      background: 'rgba(255,255,255,0.5)',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#8E8E93', textAlign: 'right', margin: '6px 0 8px' }}>
                    {journalText.length} / {MAX_TEXT}
                  </p>
                  <button
                    data-testid="inquiry-modal-journal-done"
                    disabled={journalText.trim().length < 1}
                    onClick={handleJournalDone}
                    style={{
                      width: '100%',
                      padding: 15,
                      borderRadius: 15,
                      border: '0.3px solid #9f9f9f',
                      background: '#FBF5F5',
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#432104',
                      cursor: journalText.trim().length >= 1 ? 'pointer' : 'default',
                      opacity: journalText.trim().length >= 1 ? 1 : 0.35,
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
