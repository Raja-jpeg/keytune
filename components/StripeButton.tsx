'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeButtonProps {
  email: string;
}

export default function StripeButton({ email }: StripeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    const res = await fetch('/api/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    const stripe = await stripePromise;
    stripe?.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-black text-white px-4 py-2 rounded hover:opacity-80"
    >
      {loading ? 'Redirecting...' : 'Upgrade to Premium'}
    </button>
  );
}
