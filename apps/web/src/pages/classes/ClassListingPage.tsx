import React, { useEffect, useState } from 'react';
import { ClassCard } from '../../components/classes/ClassCard';
import { ClassCardSkeleton } from '../../components/classes/ClassLoadingSkeleton';
import { getClasses } from '../../engine/classApi';
import type { ClassListing } from '@kalpx/types';
import { WEB_ENV } from '../../lib/env';
import { AppShell, PageContainer, EmptyState } from '../../components/ui';

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
    <AppShell>
      <PageContainer mode="wide" pt={28} pb={40} px={16}>
        {/* Header */}
        <div style={{ paddingBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--kalpx-cta)', fontWeight: 600, marginBottom: 4 }}>KalpX</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 4 }}>Classes</h1>
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>Learn with experienced teachers</p>
        </div>

        {/* Content */}
        <div>
          {loading && (
            <>
              <ClassCardSkeleton />
              <ClassCardSkeleton />
              <ClassCardSkeleton />
            </>
          )}

          {!loading && error && (
            <EmptyState icon="⚠️" message={error} />
          )}

          {!loading && !error && classes.length === 0 && (
            <EmptyState icon="🪔" message="No classes available right now." />
          )}

          {!loading && !error && classes.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
