import React from 'react';
import type { CommunityComment } from '@kalpx/types';
import { getPostAuthor } from '@kalpx/types';
import { CommunityAuthorRow } from './CommunityAuthorRow';

interface CommunityCommentListProps {
  comments: CommunityComment[];
  loading?: boolean;
}

function getCommentText(comment: CommunityComment): string {
  return comment.content ?? comment.body ?? comment.text ?? '';
}

function CommentItem({ comment, depth = 0 }: { comment: CommunityComment; depth?: number }) {
  const text = getCommentText(comment);
  const author = getPostAuthor({ creator: comment.creator, author: comment.author });

  return (
    <div
      style={{
        paddingLeft: depth > 0 ? 16 : 0,
        borderLeft: depth > 0 ? '2px solid #f0e8d8' : 'none',
        marginBottom: depth > 0 ? 8 : 12,
      }}
    >
      <CommunityAuthorRow author={author} timestamp={comment.created_at} compact />
      {text && (
        <p style={{ fontSize: 13, color: '#3a2010', lineHeight: 1.55, marginTop: 4, marginBottom: 0 }}>
          {text}
        </p>
      )}
      {comment.upvote_count != null && comment.upvote_count > 0 && (
        <p style={{ fontSize: 11, color: '#7a5c3a', marginTop: 4 }}>▲ {comment.upvote_count}</p>
      )}
      {/* Nested replies — max one level deep in UI */}
      {depth === 0 && comment.children && comment.children.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunityCommentList({ comments, loading = false }: CommunityCommentListProps) {
  if (loading) {
    return (
      <div style={{ padding: '16px 0' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: '#f0e8d8', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ width: 80, height: 13, borderRadius: 4, background: '#f0e8d8', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <div style={{ width: '85%', height: 13, borderRadius: 4, background: '#f0e8d8', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 4 }} />
            <div style={{ width: '60%', height: 13, borderRadius: 4, background: '#f0e8d8', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return <p style={{ fontSize: 13, color: '#bbb', padding: '16px 0' }}>No comments yet. Be the first.</p>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
