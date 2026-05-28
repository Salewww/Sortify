import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Lazy-init Stripe — avoids module-level crash when env var is missing at build time
function getStripe() {
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
  });
}

const PRICE_IDS = () => ({
  solo_monthly: process.env.STRIPE_SOLO_MONTHLY_PRICE_ID!,
  solo_annual: process.env.STRIPE_SOLO_ANNUAL_PRICE_ID!,
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  team_annual: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID!,
  firm_monthly: process.env.STRIPE_FIRM_MONTHLY_PRICE_ID!,
  firm_annual: process.env.STRIPE_FIRM_ANNUAL_PRICE_ID!,
});

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billing } = await request.json();
    const prices = PRICE_IDS();
    const priceKey = `${plan}_${billing}` as keyof ReturnType<typeof PRICE_IDS>;
    const priceId = prices[priceKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      locale: 'en',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { user_id: user.id, plan, billing },
      subscription_data: {
        trial_period_days: 14,
        metadata: { user_id: user.id, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
