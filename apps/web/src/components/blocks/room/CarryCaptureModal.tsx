/**
 * CarryCaptureModal — web equivalent of RN carry capture flow (Phase 13.5).
 * Handles in_room_carry actions that require text input + sacred POST.
 *
 * Generic fallback CARRY_MEMORY_MODAL entries ported from RN:
 *   joy_carry, release_capture, growth_reflect, clarity_note, stillness_note,
 *   connection_note, generic.
 */
import React, { useState, useEffect } from 'react';
import { postRoomSacred } from '../../../engine/mitraApi';

const MAX_TEXT = 1000;

// Generic fallback copy for carry types (RN source: CARRY_MEMORY_MODAL)
const CARRY_MEMORY_MODAL: Record<string, { prompt: string; placeholder: string; primary_label: string; sanatan_context?: string }> = {
  joy_carry: {
    prompt: 'What do you want to carry with you from this moment?',
    placeholder: 'What you noticed, felt, or want to hold onto...',
    primary_label: 'Carry this',
    sanatan_context: 'Joy held with awareness becomes a source of light.',
  },
  release_capture: {
    prompt: 'What are you setting down right now?',
    placeholder: 'Name what you are releasing...',
    primary_label: 'Release it',
  },
  growth_reflect: {
    prompt: 'What insight or intention do you want to take with you?',
    placeholder: 'Your reflection...',
    primary_label: 'Hold this',
  },
  clarity_note: {
    prompt: 'What has become clearer for you?',
    placeholder: 'Your clarity note...',
    primary_label: 'Remember this',
  },
  stillness_note: {
    prompt: 'What did stillness offer you today?',
    placeholder: 'What arose in the quiet...',
    primary_label: 'Keep this',
  },
  connection_note: {
    prompt: 'What do you want to carry from this sense of connection?',
    placeholder: 'Your note...',
    primary_label: 'Save this',
  },
  generic: {
    prompt: 'What do you want to remember from this?',
    placeholder: 'Your reflection...',
    primary_label: 'Save',
  },
};

function getCarryCopy(writesEvent?: string | null, carryPayload?: any) {
  const mm = carryPayload?.memory_modal;
  if (mm) return { prompt: mm.prompt, placeholder: mm.placeholder || 'Type what you feel..', primary_label: mm.primary_label || 'Save', sanatan_context: mm.sanatan_context };
  const key = writesEvent || 'generic';
  return CARRY_MEMORY_MODAL[key] ?? CARRY_MEMORY_MODAL.generic;
}

interface ConfirmationState {
  visible: boolean;
}

interface Props {
  visible: boolean;
  label: string;
  roomId: string;
  actionId: string;
  analyticsKey?: string | null;
  writesEvent?: string | null;
  carryPayload?: any;
  lifeContext?: string | null;
  journeyId?: string | null;
  dayNumber?: number | null;
  onSave: (text: string) => void;
  onCancel: () => void;
  onAddAnother?: () => void;
  onReturnHome?: () => void;
  isJoyCarry?: boolean;
}

export function CarryCaptureModal({
  visible,
  label,
  roomId,
  actionId,
  analyticsKey,
  writesEvent,
  carryPayload,
  lifeContext,
  journeyId,
  dayNumber,
  onSave,
  onCancel,
  onAddAnother,
  onReturnHome,
  isJoyCarry = false,
}: Props) {
  const [text, setText] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ visible: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = getCarryCopy(writesEvent, carryPayload);
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1 && !isSubmitting;

  useEffect(() => {
    if (!visible) {
      setText('');
      setConfirmation({ visible: false });
      setIsSubmitting(false);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !confirmation.visible) onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onCancel, confirmation.visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!enabled) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Call sacred API
      await postRoomSacred(roomId, {
        writes_event: writesEvent,
        label,
        action_id: actionId,
        analytics_key: analyticsKey,
        captured_at: Date.now(),
        text: trimmed,
        life_context: lifeContext ?? null,
        journey_id: journeyId ?? null,
        day_number: dayNumber ?? null,
        source_surface: 'carry_pill',
      });
      onSave(trimmed);
      setConfirmation({ visible: true });
    } catch {
      setError('Could not save — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      onClick={(e) => e.target === e.currentTarget && !confirmation.visible && onCancel()}
      data-testid="carry-capture-modal-backdrop"
    >
      <div
        data-testid="carry-capture-modal"
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

        {confirmation.visible ? (
          /* Confirmation state */
          <div style={{ padding: '20px 24px', textAlign: 'center' }} data-testid="carry-capture-confirmation">
            <p style={{ fontSize: 20, color: '#C9A84C', marginBottom: 8 }}>✓</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2C2A26', marginBottom: 8 }}>Saved.</p>
            <p style={{ fontSize: 13, color: '#6B6356', marginBottom: 24 }}>
              This has been held for you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {onReturnHome && (
                <button
                  data-testid="carry-confirm-return-home"
                  onClick={() => { setConfirmation({ visible: false }); onReturnHome(); }}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 28,
                    border: 'none',
                    background: 'rgba(201,168,76,0.12)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#2C2A26',
                    cursor: 'pointer',
                  }}
                >
                  Return home
                </button>
              )}
              {onAddAnother && !isJoyCarry && (
                <button
                  data-testid="carry-confirm-add-another"
                  onClick={() => {
                    setText('');
                    setConfirmation({ visible: false });
                    onAddAnother?.();
                  }}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 28,
                    border: '1px solid rgba(201,168,76,0.4)',
                    background: 'transparent',
                    fontSize: 15,
                    color: '#2C2A26',
                    cursor: 'pointer',
                  }}
                >
                  Add another
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Input state */
          <div style={{ padding: '0 24px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px' }}>
              <button
                data-testid="carry-capture-cancel"
                onClick={onCancel}
                style={{ background: 'none', border: 'none', fontSize: 15, color: '#6E6E73', cursor: 'pointer', padding: 0 }}
              >
                Cancel
              </button>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', margin: 0 }}>
                {label}
              </p>
              <div style={{ width: 50 }} />
            </div>

            {copy.sanatan_context && (
              <p style={{ fontSize: 13, color: '#8B6914', fontStyle: 'italic', textAlign: 'center', marginBottom: 8, lineHeight: 1.5, marginTop: 8 }}>
                {copy.sanatan_context}
              </p>
            )}
            <p style={{ fontSize: 16, color: '#3C3C43', marginBottom: 16, lineHeight: 1.4 }}>
              {copy.prompt}
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder={copy.placeholder}
              data-testid="carry-capture-input"
              maxLength={MAX_TEXT}
              style={{
                width: '100%',
                minHeight: 140,
                border: '1px solid #D8D8D8',
                borderRadius: 12,
                padding: 12,
                fontSize: 15,
                color: '#1C1C1E',
                background: 'rgba(255,255,255,0.5)',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 12, color: '#8E8E93', textAlign: 'right', margin: '6px 0 16px' }}>
              {text.length} / {MAX_TEXT}
            </p>

            {error && (
              <p data-testid="carry-capture-error" style={{ color: '#C0392B', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
                {error}
              </p>
            )}

            <button
              data-testid="carry-capture-save"
              disabled={!enabled}
              onClick={handleSave}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 28,
                border: '0.3px solid #9f9f9f',
                background: '#FBF5F5',
                fontSize: 17,
                fontWeight: 600,
                color: '#432104',
                cursor: enabled ? 'pointer' : 'default',
                opacity: enabled ? 1 : 0.35,
              }}
            >
              {isSubmitting ? 'Saving…' : copy.primary_label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
