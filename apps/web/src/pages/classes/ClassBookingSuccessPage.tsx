import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function ClassBookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get('slug');
  const bookingId = searchParams.get('booking_id');

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🪔</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2d1a0e', marginBottom: 8 }}>
          Booking confirmed
        </h1>
        {bookingId && (
          <p style={{ fontSize: 14, color: '#7a5c3a', marginBottom: 8 }}>
            Booking #{bookingId}
          </p>
        )}
        <p style={{ fontSize: 15, color: '#7a5c3a', lineHeight: 1.6, marginBottom: 32 }}>
          Your session is confirmed. You'll receive a confirmation by email.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slug && (
            <button
              onClick={() => navigate(`/en/classes/${slug}`)}
              style={{
                padding: '13px 24px', borderRadius: 12,
                background: '#b06840', color: '#fff',
                border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              View class
            </button>
          )}
          <button
            onClick={() => navigate('/en/classes')}
            style={{
              padding: '13px 24px', borderRadius: 12,
              background: '#f0e8d8', color: '#2d1a0e',
              border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Browse more classes
          </button>
        </div>
      </div>
    </div>
  );
}
