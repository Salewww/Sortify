# 🚀 Sortify Go-Live Checklist

## ✅ Already Done (by Claude)
- [x] Build errors fixed (Suspense wrapper, middleware→proxy, turbopack config)
- [x] `solo_tasks` migration added
- [x] Tasks page uses toast instead of browser alerts
- [x] All v2 features committed and pushed to GitHub
- [x] `vercel.json` deployment config created
- [x] Code pushed to: https://github.com/Salewww/Sortify

---

## 🔴 Step 1 — Deploy to Vercel (5 min)

```bash
# Login to Vercel
vercel login

# Deploy to production
cd "/Users/skolmaan/Desktop/DELO/WEB Projects/Sortify"
vercel --prod
```

When prompted:
- Link to existing project? → **No** (create new) OR **Yes** if already on Vercel
- Framework: **Next.js** (auto-detected)

After first deploy, add env vars in **Vercel Dashboard → Project Settings → Environment Variables**
(copy values from your `.env.local` file):

| Key | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | From .env.local |
| `RESEND_API_KEY` | From .env.local |
| `GEMINI_API_KEY` | From .env.local |
| `NEXT_PUBLIC_APP_URL` | Set to your production URL |

Then redeploy: `vercel --prod`

---

## 🔴 Step 2 — Apply Database Migrations (3 min)

```bash
# Login to Supabase CLI
supabase login

# Link project (find your project ref in Supabase Dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

This applies migrations for: v2 schema, Slovenia packs, help requests fix, solo tasks.

**Alternative:** Supabase Dashboard → SQL Editor → paste each migration file manually.

---

## 🔴 Step 3 — Create Storage Bucket (2 min)

1. Open Supabase Dashboard → Storage → Buckets
2. Click **New bucket**
3. Name: `documents-v2`
4. Public bucket: **YES**
5. Save

---

## 🟡 Step 4 — Optional: Custom Domain

Vercel Dashboard → Your Project → Settings → Domains → Add domain.

---

## ✅ Test Checklist After Deployment

- [ ] Landing page loads
- [ ] Login/signup works
- [ ] New user → redirected to account type selection
- [ ] Firm mode navigation: Clients, Documents, Templates, Help, Settings
- [ ] Solo mode navigation: Dashboard, Documents, Tasks, Settings
- [ ] Upload a document → appears in Documents list
- [ ] Create a task (solo mode) → appears in Tasks list
- [ ] Create a help request → AI triage responds
- [ ] Client portal at `/p/[token]` works

---

## 📋 Known Limitations (Post-Launch)

1. **Email sending**: AI composes reminders but doesn't send yet (Resend not wired up to send)
2. **Document OCR**: Files upload but AI extraction not triggered automatically
3. **Portal v2**: Client portal is v1 design (functional, not yet redesigned)

---

## 🔗 Quick Links

- **GitHub**: https://github.com/Salewww/Sortify
- **Knowledge Graph**: open `graphify-out/graph.html` in browser for interactive codebase map
