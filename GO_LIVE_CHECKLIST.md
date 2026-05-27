# 🚀 Sortify Go-Live Checklist

## ✅ Already Done
- [x] Build errors fixed (Suspense wrapper, middleware→proxy, turbopack config)
- [x] `solo_tasks` migration added
- [x] Tasks page uses toast instead of browser alerts
- [x] All v2 features committed and pushed to GitHub
- [x] `vercel.json` deployment config created
- [x] Code pushed to: https://github.com/Salewww/Sortify
- [x] Design system redesigned — indigo palette, Emil Kowalski easing, Geist font
- [x] Landing page redesigned — hero, feature grid, competitor comparison, pricing
- [x] Stripe integration — checkout route, webhook handler, 14-day trial
- [x] Stripe products created (Solo/Team/Firm × monthly/annual) — 6 price IDs in `.env.local`
- [x] Stripe checkout wired to pricing buttons (with unauthenticated redirect)
- [x] Subscription card in /dashboard/settings with upgrade button

---

## 🔴 Step 1 — Deploy to Vercel (5 min)

```bash
vercel login
cd "/Users/skolmaan/Desktop/DELO/WEB Projects/Sortify"
vercel --prod
```

When prompted: Framework → **Next.js** (auto-detected), link to existing or create new.

After first deploy, add **all** of these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Key | Where to find it |
|-----|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| `RESEND_API_KEY` | `.env.local` |
| `GEMINI_API_KEY` | `.env.local` |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g. `https://sortify.app`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local` |
| `STRIPE_SECRET_KEY` | `.env.local` |
| `STRIPE_SOLO_MONTHLY_PRICE_ID` | `.env.local` |
| `STRIPE_SOLO_ANNUAL_PRICE_ID` | `.env.local` |
| `STRIPE_TEAM_MONTHLY_PRICE_ID` | `.env.local` |
| `STRIPE_TEAM_ANNUAL_PRICE_ID` | `.env.local` |
| `STRIPE_FIRM_MONTHLY_PRICE_ID` | `.env.local` |
| `STRIPE_FIRM_ANNUAL_PRICE_ID` | `.env.local` |
| `STRIPE_WEBHOOK_SECRET` | ← set AFTER Step 4 |

Then redeploy: `vercel --prod`

---

## 🔴 Step 2 — Apply Database Migrations (3 min)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # ref is in Supabase Dashboard URL
supabase db push
```

This applies: v2 schema, Slovenia packs, help requests fix, solo tasks, Stripe fields.

**Alternative:** Supabase Dashboard → SQL Editor → paste each migration file manually.

---

## 🔴 Step 3 — Create Storage Bucket (2 min)

1. Supabase Dashboard → Storage → Buckets → **New bucket**
2. Name: `documents-v2`
3. Public bucket: **YES**
4. Save

---

## 🔴 Step 4 — Set Up Stripe Webhook (5 min)

After deploy, you'll have a production URL (e.g. `https://sortify.vercel.app`).

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. URL: `https://YOUR_PRODUCTION_URL/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy: `vercel --prod`

---

## 🟡 Step 5 — Optional: Custom Domain

Vercel Dashboard → Your Project → Settings → Domains → Add domain.

---

## ✅ Test Checklist After Deployment

- [ ] Landing page loads at production URL
- [ ] Login / signup works
- [ ] New user → onboarding (account-type selection)
- [ ] Firm mode: Clients, Documents, Templates, Help, Settings
- [ ] Solo mode: Dashboard, Documents, Tasks, Settings
- [ ] Pricing buttons → Stripe checkout → 14-day trial starts
- [ ] After trial checkout → `/dashboard?upgraded=true` shows success banner
- [ ] `/dashboard/settings` shows subscription plan + status
- [ ] Webhook fires on subscription events (check Stripe Dashboard → Webhooks)
- [ ] Upload a document → appears in Documents list
- [ ] Create a help request → AI triage responds
- [ ] Client portal at `/p/[token]` works

---

## 📋 Known Limitations (Post-Launch)

1. **Email sending**: AI composes reminders but Resend sending not fully wired up
2. **Document OCR**: Files upload but AI extraction not triggered automatically
3. **Portal v2**: Client portal is v1 design (functional, not yet redesigned)
4. **Stripe portal**: No self-serve billing portal (cancel/change plan requires contacting support)

---

## 🔗 Quick Links

- **GitHub**: https://github.com/Salewww/Sortify
- **Stripe Dashboard (test)**: https://dashboard.stripe.com/test
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Knowledge Graph**: open `graphify-out/graph.html` in browser
