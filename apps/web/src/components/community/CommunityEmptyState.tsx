import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';

interface CommunityEmptyStateProps {
  message?: string;
  showCreateCta?: boolean;
}

export function CommunityEmptyState({
  message,
  showCreateCta = false,
}: CommunityEmptyStateProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const displayMessage = message ?? t('communityEmptyState.noPostsYet');

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 36, marginBottom: 12 }}>🌱</p>
      <p style={{ fontSize: 15, color: '#7a5c3a', lineHeight: 1.55, marginBottom: showCreateCta ? 20 : 0 }}>
        {displayMessage}
      </p>
      {showCreateCta && (
        <button
          onClick={() => navigate('/en/community/new')}
          style={{
            padding: '11px 24px', borderRadius: 10,
            background: '#b06840', color: '#fff',
            border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t('communityEmptyState.createPost')}
        </button>
      )}
    </div>
  );
}
