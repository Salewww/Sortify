import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: any;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await (supabase.from('users') as any).update({
          subscription_plan: plan,
          subscription_status: 'active',
          stripe_customer_id: session.customer,
        }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status; // 'active' | 'trialing' | 'past_due' | 'canceled'

      const { data: user } = await (supabase.from('users') as any)
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await (supabase.from('users') as any).update({
          subscription_status: status === 'trialing' ? 'trialing'
            : status === 'active' ? 'active'
            : status === 'past_due' ? 'past_due'
            : 'inactive',
        }).eq('id', user.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { data: user } = await (supabase.from('users') as any)
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await (supabase.from('users') as any).update({
          subscription_plan: 'free',
          subscription_status: 'inactive',
        }).eq('id', user.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
