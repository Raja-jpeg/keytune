import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const text = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const supabase = createClient()

  try {
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      // Update user's premium status in database
      await supabase
        .from('music_links')
        .update({ is_premium: true })
        .eq('link_id', session.metadata?.linkId)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return new NextResponse('Webhook error', { status: 400 })
  }
}