import React from 'react';
import type { CommunityCreator } from '@kalpx/types';

interface CommunityAuthorRowProps {
  author?: CommunityCreator;
  timestamp?: string;
  compact?: boolean;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function getDisplayName(author?: CommunityCreator): string {
  if (!author) return 'Anonymous';
  return author.profile_name ?? author.display_name ?? author.name ?? author.username ?? 'Anonymous';
}

export function CommunityAuthorRow({ author, timestamp, compact = false }: CommunityAuthorRowProps) {
  const name = getDisplayName(author);
  const avatar = author?.avatar_url ?? author?.profile_pic;
  const avatarSize = compact ? 28 : 34;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          style={{
            width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
            objectFit: 'cover', flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
            background: '#f0e8d8', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: compact ? 12 : 14, color: '#b06840', fontWeight: 700, flexShrink: 0,
          }}
        >
          {name[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div>
        <p style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: '#2d1a0e', lineHeight: 1.2 }}>
          {name}
        </p>
        {timestamp && (
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.2 }}>
            {formatRelativeTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
