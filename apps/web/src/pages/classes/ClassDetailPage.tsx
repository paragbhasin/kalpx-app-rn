import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClassDetailSkeleton } from '../../components/classes/ClassLoadingSkeleton';
import { ClassPrice } from '../../components/classes/ClassPrice';
import { getClassDetail } from '../../engine/classApi';
import { WEB_ENV } from '../../lib/env';
import type { ClassDetail } from '@kalpx/types';

export function ClassDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClassDetail(slug);
        if (!data) {
          setError('Class not found.');
        } else {
          setCls(data);
        }
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassDetailPage] load error:', err);
        setError('Could not load class.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <ClassDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px' }}>
          <button
            onClick={() => navigate('/en/classes')}
            style={{ background: 'none', border: 'none', color: '#b06840', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 16 }}
          >
            ← Back to Classes
          </button>
          <p style={{ color: '#b91c1c', fontSize: 14 }}>{error ?? 'Class not found.'}</p>
        </div>
      </div>
    );
  }

  const canBook = cls.status !== 'inactive' && cls.status !== 'draft';

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
        {/* Cover */}
        {cls.cover_media?.url && (
          <div style={{ position: 'relative' }}>
            <img
              src={cls.cover_media.url}
              alt={cls.title}
              style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => navigate('/en/classes')}
              style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 20,
                color: '#fff', fontSize: 13, padding: '6px 14px', cursor: 'pointer',
              }}
            >
              ← Classes
            </button>
          </div>
        )}

        <div style={{ padding: '20px 16px' }}>
          {!cls.cover_media?.url && (
            <button
              onClick={() => navigate('/en/classes')}
              style={{ background: 'none', border: 'none', color: '#b06840', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}
            >
              ← Back to Classes
            </button>
          )}

          {cls.category && (
            <p style={{ fontSize: 11, color: '#b06840', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {cls.category}
            </p>
          )}

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2d1a0e', marginBottom: 8, lineHeight: 1.3 }}>
            {cls.title}
          </h1>

          {cls.tutor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {cls.tutor.avatar_url && (
                <img
                  src={cls.tutor.avatar_url}
                  alt={cls.tutor.name ?? ''}
                  style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover' }}
                />
              )}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2d1a0e' }}>{cls.tutor.name}</p>
                {cls.tutor.timezone && (
                  <p style={{ fontSize: 12, color: '#999' }}>{cls.tutor.timezone}</p>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {cls.duration_minutes && (
              <span style={{ fontSize: 12, color: '#7a5c3a', background: '#f0e8d8', borderRadius: 6, padding: '3px 10px' }}>
                {cls.duration_minutes} min
              </span>
            )}
            {cls.skill_level && (
              <span style={{ fontSize: 12, color: '#7a5c3a', background: '#f0e8d8', borderRadius: 6, padding: '3px 10px' }}>
                {cls.skill_level}
              </span>
            )}
            {cls.language && (
              <span style={{ fontSize: 12, color: '#7a5c3a', background: '#f0e8d8', borderRadius: 6, padding: '3px 10px' }}>
                {cls.language}
              </span>
            )}
          </div>

          {cls.description && (
            <p style={{ fontSize: 15, color: '#3a2010', lineHeight: 1.6, marginBottom: 16 }}>
              {cls.description}
            </p>
          )}

          {cls.long_description && (
            <p style={{ fontSize: 14, color: '#7a5c3a', lineHeight: 1.65, marginBottom: 20 }}>
              {cls.long_description}
            </p>
          )}

          {cls.learning_outcomes && cls.learning_outcomes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2d1a0e', marginBottom: 8 }}>What you'll learn</p>
              {cls.learning_outcomes.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#b06840', flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: 13, color: '#3a2010', lineHeight: 1.5 }}>{o}</p>
                </div>
              ))}
            </div>
          )}

          {cls.tutor?.bio && (
            <div style={{ background: '#fdf8ef', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2d1a0e', marginBottom: 6 }}>About the teacher</p>
              <p style={{ fontSize: 13, color: '#7a5c3a', lineHeight: 1.6 }}>{cls.tutor.bio}</p>
            </div>
          )}
        </div>

        {/* Sticky booking bar */}
        <div
          style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: '#fff', borderTop: '1px solid #f0e8d8',
            padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 100,
          }}
        >
          <ClassPrice pricing={cls.pricing} showTrial />
          {canBook && (
            <button
              onClick={() => navigate(`/en/classes/${cls.slug}/book`)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: '#b06840',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Book now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
