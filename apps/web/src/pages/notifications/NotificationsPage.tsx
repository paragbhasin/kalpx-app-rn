import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import {
  loadNotifications,
  markRead,
  resetNotificationsInbox,
} from '../../store/notificationsInboxSlice';
import { AppShell, LoadingState, EmptyState } from '../../components/ui';

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = useSelector((s: RootState) => s.notificationsInbox);

  useEffect(() => {
    dispatch(resetNotificationsInbox());
    void dispatch(loadNotifications({ page: 1, reset: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  function handleItemClick(id: number, read: boolean) {
    if (!read) {
      void dispatch(markRead([id]));
    }
  }

  function handleLoadMore() {
    void dispatch(loadNotifications({ page: state.page + 1 }));
  }

  function handleRetry() {
    dispatch(resetNotificationsInbox());
    void dispatch(loadNotifications({ page: 1, reset: true }));
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 14,
              color: 'var(--kalpx-cta)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 12,
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)' }}>Notifications</h1>
        </div>

        {/* Loading skeleton */}
        {state.loading && state.data.length === 0 && (
          <LoadingState rows={3} type="row" height={60} />
        )}

        {/* Error state */}
        {state.error && !state.loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 14, color: '#c0392b', marginBottom: 16 }}>{state.error}</p>
            <button
              onClick={handleRetry}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                background: 'var(--kalpx-cta)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!state.loading && !state.error && state.data.length === 0 && (
          <EmptyState icon="🔔" message="No notifications yet." />
        )}

        {/* Notification items */}
        {state.data.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id, item.read)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: 'var(--kalpx-card-bg)',
              border: '1px solid var(--kalpx-border-gold)',
              borderRadius: 10,
              padding: 14,
              marginBottom: 8,
              cursor: 'pointer',
              boxShadow: 'var(--kalpx-shadow-card)',
              touchAction: 'manipulation',
            }}
          >
            {/* Unread indicator */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.read ? 'transparent' : '#f0a500',
                flexShrink: 0,
                marginTop: 5,
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--kalpx-text)',
                  marginBottom: 2,
                }}
              >
                {item.title}
              </p>
              <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginBottom: 4 }}>{item.message}</p>
              <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)' }}>{formatRelativeTime(item.timestamp)}</p>
            </div>
          </div>
        ))}

        {/* Load more */}
        {state.hasMore && !state.loading && state.data.length > 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <button
              onClick={handleLoadMore}
              style={{
                padding: '10px 28px',
                borderRadius: 10,
                background: 'var(--kalpx-chip-bg)',
                color: 'var(--kalpx-text)',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Load more
            </button>
          </div>
        )}

        {/* Inline loading for pagination */}
        {state.loading && state.data.length > 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
            Loading…
          </div>
        )}
      </div>
    </AppShell>
  );
}
