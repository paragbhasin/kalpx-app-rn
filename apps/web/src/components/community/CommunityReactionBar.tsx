import React from 'react';

interface CommunityReactionBarProps {
  upvoteCount?: number;
  commentCount?: number;
  isUpvoting?: boolean;
  onUpvote?: () => void;
  onComment?: () => void;
  compact?: boolean;
}

export function CommunityReactionBar({
  upvoteCount = 0,
  commentCount = 0,
  isUpvoting = false,
  onUpvote,
  onComment,
  compact = false,
}: CommunityReactionBarProps) {
  const iconSize = compact ? 14 : 16;
  const fontSize = compact ? 12 : 13;

  return (
    <div style={{ display: 'flex', gap: compact ? 12 : 16, alignItems: 'center', marginTop: compact ? 6 : 10 }}>
      <button
        onClick={onUpvote}
        disabled={isUpvoting}
        style={{
          background: 'none', border: 'none', cursor: onUpvote ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          color: '#7a5c3a', fontSize, opacity: isUpvoting ? 0.6 : 1,
        }}
        aria-label={`Upvote (${upvoteCount})`}
      >
        <span style={{ fontSize: iconSize }}>▲</span>
        <span>{upvoteCount}</span>
      </button>

      <button
        onClick={onComment}
        style={{
          background: 'none', border: 'none', cursor: onComment ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          color: '#7a5c3a', fontSize,
        }}
        aria-label={`Comments (${commentCount})`}
      >
        <span style={{ fontSize: iconSize }}>💬</span>
        <span>{commentCount}</span>
      </button>
    </div>
  );
}
