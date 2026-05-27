# 🚀 Launch Checklist — Do This Now

## STEP 1 — Deploy (10 min)

```bash
cd "/Users/skolmaan/Desktop/DELO/WEB Projects/Sortify"
vercel login
vercel --prod
```

When Vercel asks:
- Framework: Next.js (auto-detected)
- Root directory: `.` (default)

**After first deploy you get a URL like `sortify.vercel.app`.**

---

## STEP 2 — Add env vars to Vercel (5 min)

Go to: https://vercel.com/dashboard → your project → Settings → Environment Variables

Copy every line from `.env.local` except comments. Key ones:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | from .env.local |
| `RESEND_API_KEY` | from .env.local |
| `GEMINI_API_KEY` | from .env.local |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | from .env.local |
| `STRIPE_SECRET_KEY` | from .env.local |
| `STRIPE_SOLO_MONTHLY_PRICE_ID` | from .env.local |
| `STRIPE_SOLO_ANNUAL_PRICE_ID` | from .env.local |
| `STRIPE_TEAM_MONTHLY_PRICE_ID` | from .env.local |
| `STRIPE_TEAM_ANNUAL_PRICE_ID` | from .env.local |
| `STRIPE_FIRM_MONTHLY_PRICE_ID` | from .env.local |
| `STRIPE_FIRM_ANNUAL_PRICE_ID` | from .env.local |
| `NEXT_PUBLIC_APP_URL` | **https://your-domain.vercel.app** |

Then: `vercel --prod` (second deploy with env vars)

---

## STEP 3 — Apply DB migrations (3 min)

```bash
supabase login
supabase link --project-ref axwkjmydfiqyrojcviwo
supabase db push
```

Or: Supabase Dashboard → SQL Editor → paste files from `supabase/migrations/` one by one.

---

## STEP 4 — Create storage bucket (2 min)

Supabase Dashboard → Storage → New bucket:
- Name: `documents-v2`
- Public: YES

---

## STEP 5 — Set up Stripe webhook (5 min)

1. Go to https://dashboard.stripe.com/test/webhooks → Add endpoint
2. URL: `https://YOUR_PRODUCTION_URL/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret (`whsec_...`)
5. Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
6. `vercel --prod` (final redeploy)

---

## STEP 6 — Test the full flow (5 min)

- [ ] Landing page loads
- [ ] Click "Start free trial" → goes to signup
- [ ] Signup → Stripe checkout appears with 14-day trial
- [ ] Demo page works at /demo
- [ ] Privacy and Terms pages work

---

## STEP 7 — Post for first clients

### r/Bookkeeping (paste this exactly)

**Title:** I built a tool to stop chasing clients for documents — free trials for this community

**Body:**
```
Hey r/bookkeeping,

I'm a developer who watched my partner (a bookkeeper) spend hours every week 
copying and pasting the same "did you send the bank statements yet?" emails.

So I built Sortify. Here's how it works:

1. You add a client
2. They get one link (no login required on their end)
3. They upload documents and complete your checklist
4. You get notified. AI drafts follow-up reminders for the slow ones.

It handles the whole onboarding flow — QuickBooks access requests, document 
collection, progress tracking, audit log.

Currently in early launch. Offering **free 14-day trials** to anyone from this 
community. No credit card to start.

Happy to answer any questions about how it works. What's your current process 
for document collection?

→ sortify.app/demo (no signup to see it)
```

---

### Indie Hackers (paste this)

**Title:** Launched Sortify — client onboarding tool for bookkeepers (stop chasing docs via email)

**Body:**
```
Hey IH,

Just launched Sortify after building it over the past few months.

**The problem:** Bookkeepers spend a surprising amount of time chasing clients 
for bank statements, QuickBooks access, and signed documents. The average firm 
loses 3-5 hours per week to this.

**What I built:** A client portal tool specifically for bookkeepers/accountants:
- Client gets one link, no account needed
- Uploads documents, completes checklist  
- Bookkeeper gets notified + AI drafts reminders
- Full audit log of everything

**Tech:** Next.js 16, Supabase, Stripe, Gemini AI

**Traction so far:** Just launched today. Looking for first 10 paying customers.

**Pricing:** From $14/mo (annual) with 14-day trial.

Live demo (no signup): sortify.app/demo

Would love feedback from other founders who've built SaaS for professional 
services. What's been your experience with this market?
```

---

### Product Hunt (submit at https://producthunt.com/posts/new)

**Name:** Sortify
**Tagline:** Stop chasing clients for documents. Send one link.
**Description:**
Sortify helps bookkeepers and accountants collect documents from clients without the endless email chain. Send a portal link → client uploads everything → you get notified. AI drafts follow-up reminders. From $14/mo with a 14-day free trial.

**Topics:** SaaS, Productivity, Accounting, Small Business

**Best day to launch:** Tuesday or Wednesday, 12:01 AM PST

---

## After first 10 signups — do this

1. Email every single one personally. Ask: "What made you sign up? What's your biggest pain?"
2. Offer to jump on a 15-min call
3. Use their words in your marketing copy (they know the pain better than you)
4. Ask for a testimonial after they've used it for a week
