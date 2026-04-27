import { loadStripe } from '@stripe/stripe-js';

const key = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ?? '';

// Singleton promise — loadStripe must only be called once
export const stripePromise = key ? loadStripe(key) : null;
