import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { StripePaymentForm } from '../../components/classes/StripePaymentForm';
import { createPaymentIntent } from '../../engine/classApi';
import { WEB_ENV } from '../../lib/env';

export function ClassPaymentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = Number(searchParams.get('booking_id'));

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Invalid booking. Please start over.');
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const result = await createPaymentIntent({ booking_id: bookingId });
        if (!result?.client_secret) {
          setError('Could not start payment. Please try again.');
          return;
        }
        setClientSecret(result.client_secret);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error('[ClassPaymentPage] intent error:', err);
        setError(err?.message ?? 'Payment setup failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const returnUrl = `${window.location.origin}/en/classes/success?slug=${slug}&booking_id=${bookingId}`;

  function handleSuccess() {
    navigate(`/en/classes/success?slug=${slug}&booking_id=${bookingId}`);
  }

  function handleError(msg: string) {
    setError(msg);
  }

  if (!stripePromise) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#b91c1c', fontSize: 14 }}>Stripe is not configured. Please contact support.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px 60px' }}>
        <button
          onClick={() => navigate(`/en/classes/${slug}/book`)}
          style={{ background: 'none', border: 'none', color: 'var(--kalpx-cta)', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 24 }}
        >
          ← Back
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 4 }}>Complete payment</h2>
        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginBottom: 28 }}>Booking #{bookingId}</p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>Setting up payment…</p>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#fff1f0', border: '1px solid #fca5a5', marginBottom: 20 }}>
            <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 8 }}>{error}</p>
            <button
              onClick={() => navigate(`/en/classes/${slug}/book`)}
              style={{ fontSize: 13, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Try booking again
            </button>
          </div>
        )}

        {!loading && !error && clientSecret && (
          <div style={{ background: 'var(--kalpx-card-bg)', borderRadius: 14, padding: '20px 16px', border: '1px solid var(--kalpx-border-gold)' }}>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#c89a47',
                    borderRadius: '8px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                },
              }}
            >
              <StripePaymentForm
                onSuccess={handleSuccess}
                onError={handleError}
                returnUrl={returnUrl}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
