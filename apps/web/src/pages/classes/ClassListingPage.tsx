import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../../components/classes/ClassCard';
import { ClassCardSkeleton } from '../../components/classes/ClassLoadingSkeleton';
import { getClasses, getMyBookings } from '../../engine/classApi';
import type { ClassListing, BookingListItem } from '@kalpx/types';
import { WEB_ENV } from '../../lib/env';
import { AppShell, PageContainer, EmptyState } from '../../components/ui';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';

type Tab = 'explore' | 'bookings';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:   { label: 'Confirmed',   color: '#166534', bg: '#dcfce7' },
  pending:     { label: 'Pending',     color: '#92400e', bg: '#fef3c7' },
  cancelled:   { label: 'Cancelled',   color: '#991b1b', bg: '#fee2e2' },
  completed:   { label: 'Completed',   color: '#1e40af', bg: '#dbeafe' },
  rescheduled: { label: 'Rescheduled', color: '#6b21a8', bg: '#f3e8ff' },
};

function formatDateTime(utc: string): string {
  try {
    return new Date(utc).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return utc;
  }
}

function BookingCard({ booking, onNavigate }: { booking: BookingListItem; onNavigate: (slug: string) => void }) {
  const offering = booking.offering;
  const time = booking.start_utc || booking.scheduled_at;
  const badge = STATUS_LABEL[booking.status] ?? { label: booking.status, color: 'var(--kalpx-text-muted)', bg: 'var(--kalpx-chip-bg)' };

  return (
    <div
      onClick={() => offering?.slug && onNavigate(offering.slug)}
      style={{
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 12,
        cursor: offering?.slug ? 'pointer' : 'default',
        boxShadow: 'var(--kalpx-shadow-card)',
        touchAction: 'manipulation',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)', lineHeight: 1.3, flex: 1, marginRight: 10 }}>
          {offering?.title ?? 'Session'}
        </p>
        <span style={{ fontSize: 11, fontWeight: 600, color: badge.color, background: badge.bg, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
          {badge.label}
        </span>
      </div>
      {offering?.tutor?.name && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginBottom: 4 }}>
          with {offering.tutor.name}
        </p>
      )}
      {time && (
        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)' }}>
          {formatDateTime(time)}
        </p>
      )}
      {booking.trial_selected && (
        <p style={{ fontSize: 11, color: 'var(--kalpx-cta)', marginTop: 4 }}>Trial session</p>
      )}
    </div>
  );
}

export function ClassListingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('explore');
  const [authed, setAuthed] = useState(false);

  const [classes, setClasses] = useState<ClassListing[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    void isAuthenticated(webStorage).then(setAuthed);
  }, []);

  useEffect(() => {
    void (async () => {
      setClassesLoading(true);
      setClassesError(null);
      try {
        const data = await getClasses();
        setClasses(data?.results ?? []);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassListingPage] load error:', err);
        setClassesError('Could not load classes. Please try again.');
      } finally {
        setClassesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (tab !== 'bookings') return;
    void (async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const data = await getMyBookings();
        setBookings(data?.results ?? []);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassListingPage] bookings error:', err);
        setBookingsError('Could not load bookings.');
      } finally {
        setBookingsLoading(false);
      }
    })();
  }, [tab]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    fontSize: 14,
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--kalpx-cta)' : 'var(--kalpx-text-muted)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--kalpx-cta)' : '2px solid transparent',
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: 'color 0.15s',
  });

  return (
    <AppShell>
      <PageContainer mode="wide" pt={28} pb={40} px={16}>
        {/* Header */}
        <div style={{ paddingBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--kalpx-cta)', fontWeight: 600, marginBottom: 4 }}>KalpX</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 4 }}>Classes</h1>
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>Learn with experienced teachers</p>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--kalpx-border-gold)', marginBottom: 20 }}>
          <button style={tabStyle(tab === 'explore')} onClick={() => setTab('explore')}>
            Explore
          </button>
          <button style={tabStyle(tab === 'bookings')} onClick={() => setTab('bookings')}>
            My Bookings
          </button>
        </div>

        {/* Explore tab */}
        {tab === 'explore' && (
          <div>
            {classesLoading && (
              <>
                <ClassCardSkeleton />
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </>
            )}
            {!classesLoading && classesError && (
              <EmptyState icon="⚠️" message={classesError} />
            )}
            {!classesLoading && !classesError && classes.length === 0 && (
              <EmptyState icon="🪔" message="No classes available right now." />
            )}
            {!classesLoading && !classesError && classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}

        {/* My Bookings tab */}
        {tab === 'bookings' && (
          <div>
            {!authed && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: 'var(--kalpx-text-soft)', marginBottom: 16 }}>Sign in to view your bookings.</p>
                <button
                  onClick={() => navigate('/login?returnTo=/en/classes')}
                  style={{
                    padding: '12px 24px', borderRadius: 12, background: 'var(--kalpx-cta)',
                    color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Sign in
                </button>
              </div>
            )}
            {authed && bookingsLoading && (
              <>
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </>
            )}
            {authed && !bookingsLoading && bookingsError && (
              <EmptyState icon="⚠️" message={bookingsError} />
            )}
            {authed && !bookingsLoading && !bookingsError && bookings.length === 0 && (
              <EmptyState icon="🗓️" message="No bookings yet. Explore classes to get started." />
            )}
            {authed && !bookingsLoading && !bookingsError && bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onNavigate={(slug) => navigate(`/en/classes/${slug}`)}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
