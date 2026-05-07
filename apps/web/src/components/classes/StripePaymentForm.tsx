import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  returnUrl: string;
  submitLabel?: string;
}

export function StripePaymentForm({
  onSuccess,
  onError,
  returnUrl,
  submitLabel = "Pay now",
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      onError(err?.message ?? 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card'],
        }}
      />
      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          marginTop: 20,
          width: '100%',
          padding: '14px 24px',
          borderRadius: 12,
          background: submitting ? '#d1a646' : '#e0a90c',
          color: '#fff',
          border: 'none',
          fontSize: 16,
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
}
