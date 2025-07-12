import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

/**export async function POST(req: Request) {
  const { linkId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Premium Audio Access',
          },
          unit_amount: 299, // $2.99 in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      linkId,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/link/${linkId}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/link/${linkId}?canceled=true`,
  })

  return Response.json({ url: session.url })
}**/