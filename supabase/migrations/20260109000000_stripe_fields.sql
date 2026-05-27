ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'solo', 'team', 'firm')),
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx ON public.users(stripe_customer_id);
