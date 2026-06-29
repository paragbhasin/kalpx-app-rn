/**
 * VoiceConsentSheetBlock — Feature-detected voice consent gate.
 * If voice recording is unavailable, shows text fallback immediately.
 */
import React from 'react';
import { useTranslation } from '../../lib/i18n';

const canRecord =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window !== 'undefined' &&
  'MediaRecorder' in window;

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function VoiceConsentSheetBlock({ onAction }: Props) {
  const { t } = useTranslation();
  if (!canRecord) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }} data-testid="voice-consent-sheet">
        <p style={{ color: '#6B6356', marginBottom: 24, lineHeight: 1.6 }}>
          {t('voiceConsent.voiceNotAvailableBrowser')}<br />
          {t('voiceConsent.continueWithText')}
        </p>
        <button
          onClick={() => onAction?.({ type: 'support_exit' })}
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#C9A84C', color: '#fff', cursor: 'pointer' }}
        >
          {t('voiceConsent.continue')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', textAlign: 'center' }} data-testid="voice-consent-sheet">
      <p style={{ fontSize: 16, color: '#2C2A26', marginBottom: 8, fontWeight: 500 }}>
        {t('voiceConsent.voiceNotes')}
      </p>
      <p style={{ color: '#6B6356', lineHeight: 1.6, marginBottom: 24 }}>
        {t('voiceConsent.mitraListenPrivate')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '0 auto' }}>
        <button
          onClick={() => onAction?.({ type: 'accept_voice_consent' })}
          data-testid="voice-consent-accept"
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#C9A84C', color: '#fff', cursor: 'pointer' }}
        >
          {t('voiceConsent.allowVoiceNote')}
        </button>
        <button
          onClick={() => onAction?.({ type: 'decline_voice_consent' })}
          data-testid="voice-consent-decline"
          style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #E8DCC8', background: 'transparent', color: '#6B6356', cursor: 'pointer' }}
        >
          {t('voiceConsent.notRightNow')}
        </button>
      </div>
    </div>
  );
}
