import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CommunityPost } from '@kalpx/types';
import { getPostText, getPostAuthor } from '@kalpx/types';
import { CommunityAuthorRow } from './CommunityAuthorRow';
import { CommunityMediaGrid } from './CommunityMediaGrid';
import { CommunityReactionBar } from './CommunityReactionBar';

interface CommunityPostCardProps {
  post: CommunityPost;
  onUpvote?: (postId: number | string) => void;
  isUpvoting?: boolean;
}

export function CommunityPostCard({ post, onUpvote, isUpvoting = false }: CommunityPostCardProps) {
  const navigate = useNavigate();
  const text = getPostText(post);
  const author = getPostAuthor(post);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f0e8d8',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 12,
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/en/community/${post.id}`)}
    >
      <CommunityAuthorRow author={author} timestamp={post.created_at} />

      {post.community_name && (
        <p style={{ fontSize: 11, color: '#b06840', fontWeight: 600, marginTop: 6, marginBottom: 0 }}>
          {post.community_name}
        </p>
      )}

      {post.title && (
        <p style={{ fontSize: 16, fontWeight: 700, color: '#2d1a0e', marginTop: 6, marginBottom: 0, lineHeight: 1.35 }}>
          {post.title}
        </p>
      )}

      {text && (
        <p
          style={{
            fontSize: 14, color: '#3a2010', marginTop: 6, lineHeight: 1.55,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical' as any,
            WebkitLineClamp: 4,
          }}
        >
          {text}
        </p>
      )}

      <CommunityMediaGrid mediaUrl={post.media_url} images={post.images} title={post.title} />

      <CommunityReactionBar
        upvoteCount={post.upvote_count ?? post.likes_count}
        commentCount={post.comment_count}
        isUpvoting={isUpvoting}
        onUpvote={(e?: any) => {
          e?.stopPropagation?.();
          onUpvote?.(post.id);
        }}
        compact
      />
    </div>
  );
}
