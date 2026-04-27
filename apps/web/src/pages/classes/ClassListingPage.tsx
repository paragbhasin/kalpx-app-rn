import React, { useEffect, useState } from 'react';
import { ClassCard } from '../../components/classes/ClassCard';
import { ClassCardSkeleton } from '../../components/classes/ClassLoadingSkeleton';
import { ClassEmptyState } from '../../components/classes/ClassEmptyState';
import { getClasses } from '../../engine/classApi';
import type { ClassListing } from '@kalpx/types';
import { WEB_ENV } from '../../lib/env';

export function ClassListingPage() {
  const [classes, setClasses] = useState<ClassListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClasses();
        setClasses(data?.results ?? []);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassListingPage] load error:', err);
        setError('Could not load classes. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 40px' }}>
        {/* Header */}
        <div style={{ padding: '28px 16px 16px' }}>
          <p style={{ fontSize: 13, color: '#b06840', fontWeight: 600, marginBottom: 4 }}>KalpX</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2d1a0e', marginBottom: 4 }}>Classes</h1>
          <p style={{ fontSize: 14, color: '#7a5c3a' }}>Learn with experienced teachers</p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 16px' }}>
          {loading && (
            <>
              <ClassCardSkeleton />
              <ClassCardSkeleton />
              <ClassCardSkeleton />
            </>
          )}

          {!loading && error && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: '#fff1f0',
                border: '1px solid #fca5a5',
                marginBottom: 12,
              }}
            >
              <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>
            </div>
          )}

          {!loading && !error && classes.length === 0 && (
            <ClassEmptyState />
          )}

          {!loading && !error && classes.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      </div>
    </div>
  );
}
