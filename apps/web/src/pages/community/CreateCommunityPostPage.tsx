import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';
import { createCommunityPost } from '../../engine/communityApi';
import { communityPostSchema } from '@kalpx/validation';

export function CreateCommunityPostPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Auth-gate: redirect unauthenticated users
  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      if (!ok) {
        const returnTo = encodeURIComponent('/en/community/new');
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
      }
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    const result = communityPostSchema.safeParse({ content, title: title.trim() || undefined });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const post = await createCommunityPost({
        content: content.trim(),
        title: title.trim() || undefined,
      });
      if (post) {
        navigate(`/en/community/${post.id}`);
      } else {
        setGlobalError('Could not create post. Please try again.');
      }
    } catch (err: any) {
      setGlobalError(err?.response?.data?.detail ?? err?.message ?? 'Could not create post.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 60px' }}>
        <button
          onClick={() => navigate('/en/community')}
          style={{ background: 'none', border: 'none', color: 'var(--kalpx-cta)', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 20 }}
        >
          ← Community
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d1a0e', marginBottom: 24 }}>Create post</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title (optional) */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2d1a0e', display: 'block', marginBottom: 6 }}>
              Title <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title…"
              maxLength={120}
              style={inputStyle}
            />
            {errors.title && <p style={errorStyle}>{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2d1a0e', display: 'block', marginBottom: 6 }}>
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with the community…"
              rows={6}
              maxLength={2000}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
            />
            <p style={{ fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 2 }}>
              {content.length}/2000
            </p>
            {errors.content && <p style={errorStyle}>{errors.content}</p>}
          </div>

          {globalError && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fff1f0', border: '1px solid #fca5a5' }}>
              <p style={{ color: '#b91c1c', fontSize: 13 }}>{globalError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              padding: '14px', borderRadius: 12,
              background: submitting || !content.trim() ? 'var(--kalpx-cta-dark)' : 'var(--kalpx-cta)',
              color: '#fff', border: 'none', fontSize: 15, fontWeight: 600,
              cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Posting…' : 'Post to community'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid var(--kalpx-border-gold)', background: 'var(--kalpx-card-bg)',
  fontSize: 14, color: 'var(--kalpx-text)', outline: 'none',
};

const errorStyle: React.CSSProperties = {
  color: '#b91c1c', fontSize: 12, marginTop: 4,
};
