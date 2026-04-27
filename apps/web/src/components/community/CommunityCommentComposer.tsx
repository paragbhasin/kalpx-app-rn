import React, { useState } from 'react';
import { communityCommentSchema } from '@kalpx/validation';

interface CommunityCommentComposerProps {
  postId: number | string;
  isAuthenticated: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (content: string) => void;
  onRequireAuth?: () => void;
}

export function CommunityCommentComposer({
  postId: _postId,
  isAuthenticated,
  submitting = false,
  error = null,
  onSubmit,
  onRequireAuth,
}: CommunityCommentComposerProps) {
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    const result = communityCommentSchema.safeParse({ content });
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message ?? 'Invalid comment');
      return;
    }
    setValidationError(null);
    onSubmit(content.trim());
    setContent('');
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '12px 16px', borderRadius: 10, background: '#fdf8ef',
          border: '1.5px solid #f0e8d8', cursor: 'pointer', textAlign: 'center',
        }}
        onClick={onRequireAuth}
      >
        <p style={{ fontSize: 13, color: '#b06840', margin: 0 }}>
          Sign in to leave a comment
        </p>
      </div>
    );
  }

  const displayError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment…"
        rows={3}
        maxLength={1000}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 14px', borderRadius: 10,
          border: `1.5px solid ${displayError ? '#fca5a5' : '#f0e8d8'}`,
          background: '#fff', fontSize: 14, color: '#2d1a0e',
          resize: 'vertical', outline: 'none', fontFamily: 'inherit',
        }}
      />
      {displayError && (
        <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>{displayError}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          style={{
            padding: '9px 20px', borderRadius: 8,
            background: submitting || !content.trim() ? '#c0a07a' : '#b06840',
            color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
            cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
