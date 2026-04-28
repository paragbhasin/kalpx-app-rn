import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';
import { getClassDetail, getClassSlots, createBooking } from '../../engine/classApi';
import { WEB_ENV } from '../../lib/env';
import { ClassPrice } from '../../components/classes/ClassPrice';
import type { ClassDetail, ClassSlot } from '@kalpx/types';

function getTz(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

function formatSlotTime(utc: string): string {
  try {
    return new Date(utc).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return utc;
  }
}

export function ClassBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);
  const [trialSelected, setTrialSelected] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth-gate — redirect to login with returnTo
  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      if (!ok) {
        const returnTo = encodeURIComponent(`/en/classes/${slug}/book`);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
      }
    });
  }, [slug, navigate]);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, slotsRes] = await Promise.all([
          getClassDetail(slug),
          null, // slots fetched after we have offering_id
        ]);
        if (!detail) {
          setError('Class not found.');
          return;
        }
        setCls(detail);
        const slotData = await getClassSlots({ offering_id: detail.id, timezone: getTz() });
        setSlots(slotData?.slots ?? []);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassBookingPage] load error:', err);
        setError('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  async function handleBook() {
    if (!cls || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBooking({
        offering_id: cls.id,
        scheduled_at: selectedSlot.start_utc,
        user_timezone: getTz(),
        tutor_timezone: cls.tutor?.timezone ?? getTz(),
        note: note.trim() || undefined,
        trial_selected: trialSelected,
      });
      if (!result) {
        setError('Booking failed. Please try again.');
        return;
      }
      const bookingId = result.data?.booking_id ?? result.booking_id;
      if (bookingId) {
        navigate(`/en/classes/${slug}/pay?booking_id=${bookingId}`);
      } else {
        // Booking created but no payment required
        navigate(`/en/classes/success?slug=${slug}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Booking failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--kalpx-text-soft)' }}>Loading…</p>
      </div>
    );
  }

  if (error && !cls) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px' }}>
          <button onClick={() => navigate(`/en/classes/${slug}`)} style={backBtn}>← Back</button>
          <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  const hasTrial = cls?.pricing?.trial?.enabled && cls.pricing.trial.amount != null;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 100px' }}>
        <button onClick={() => navigate(`/en/classes/${slug}`)} style={backBtn}>← {cls?.title}</button>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 4, marginTop: 16 }}>
          Book a session
        </h2>
        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginBottom: 24 }}>
          with {cls?.tutor?.name ?? 'teacher'}
        </p>

        {/* Trial toggle */}
        {hasTrial && (
          <div
            onClick={() => setTrialSelected(!trialSelected)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: trialSelected ? '#fdf1e3' : '#fff',
              border: `1.5px solid ${trialSelected ? 'var(--kalpx-cta)' : 'var(--kalpx-border-gold)'}`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 20, cursor: 'pointer',
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text)' }}>Trial session</p>
              <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)' }}>
                {cls!.pricing!.currency ?? 'INR'} {cls!.pricing!.trial!.amount}
                {cls!.pricing!.trial!.session_length_min ? ` · ${cls!.pricing!.trial!.session_length_min} min` : ''}
              </p>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              background: trialSelected ? 'var(--kalpx-cta)' : 'var(--kalpx-border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {trialSelected && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
            </div>
          </div>
        )}

        {/* Slot picker */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 10 }}>Choose a time</p>
          {slots.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)' }}>No available slots right now.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slots.map((slot, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${selectedSlot?.start_utc === slot.start_utc ? 'var(--kalpx-cta)' : 'var(--kalpx-border-gold)'}`,
                    background: selectedSlot?.start_utc === slot.start_utc ? '#fdf1e3' : '#fff',
                    fontSize: 14, color: 'var(--kalpx-text)', fontWeight: selectedSlot?.start_utc === slot.start_utc ? 600 : 400,
                  }}
                >
                  {formatSlotTime(slot.start_utc)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            Note to teacher <span style={{ fontWeight: 400, color: 'var(--kalpx-text-muted)' }}>(optional)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything you'd like the teacher to know…"
            maxLength={500}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid var(--kalpx-border-gold)', background: 'var(--kalpx-card-bg)',
              fontSize: 14, color: 'var(--kalpx-text)', resize: 'vertical', outline: 'none',
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fff1f0', border: '1px solid #fca5a5', marginBottom: 16 }}>
            <p style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--kalpx-card-bg)', borderTop: '1px solid var(--kalpx-border-gold)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <ClassPrice pricing={cls?.pricing} showTrial={trialSelected} />
        <button
          onClick={handleBook}
          disabled={!selectedSlot || submitting}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: !selectedSlot || submitting ? 'var(--kalpx-cta-dark)' : 'var(--kalpx-cta)',
            color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 600,
            cursor: !selectedSlot || submitting ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          {submitting ? 'Booking…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--kalpx-cta)',
  fontSize: 14, cursor: 'pointer', padding: 0,
};
