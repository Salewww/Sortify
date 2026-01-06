# Sortify v2.0 Setup Instructions

## Overview
Sortify v2.0 is a parallel implementation running on port **3007**, while v1.0 continues on port **3000**.

## Running the Applications

### v1.0 (Existing - Port 3000)
```bash
npm run dev
```
Access at: http://localhost:3000

### v2.0 (New - Port 3007)
```bash
npm run dev:v2
```
Access at: http://localhost:3007

## Database Migrations (REQUIRED)

The v2.0 schema extensions are in:
- `/supabase/migrations/20260106000000_v2_schema.sql`
- `/supabase/migrations/20260106000001_v2_slovenia_packs.sql`

### To Apply Migrations:

#### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/hxbbrmlkakiyoeapfltr
2. Navigate to **SQL Editor**
3. Copy and paste the content of `20260106000000_v2_schema.sql`
4. Click **Run**
5. Repeat for `20260106000001_v2_slovenia_packs.sql`

#### Option 2: Supabase CLI (if configured)
```bash
supabase db push
```

### What the Migrations Add:

**New Tables:**
- `firms` - Accounting firm entities
- `documents` - Invoice/receipt storage
- `help_requests` - Client help workflow
- `ai_logs` - AI operation tracking

**Extended Tables:**
- `users` - Added `account_type` (firm/solo), `firm_id`, `onboarding_completed`
- `clients` - Added `business_type`, `vat_registered`, contact fields
- `packs` - Added `is_system`, `country_code`, `tags`, `business_types`
- `tasks` - Added `proof_type`, `requires_verification`, `platform_tag`
- `client_task_instances` - Expanded status enum, added `blocker_reason`, `due_date`, `solo_user_id`
- `reminder_events` - Added `ai_generated`, `subject`, `body_text`

**New Platforms (Slovenia):**
- eDavki
- AJPES
- Banka Slovenije
- FURS

**New Template Packs (Slovenia):**
1. **SI-1**: Normiran s.p. - Self-Service Starter
2. **SI-2**: Accounting Firm - Basic s.p. Onboarding
3. **SI-3**: Accounting Firm - Basic d.o.o. Onboarding
4. **SI-4**: Switching Accountant (Migration)
5. **SI-5**: VAT Onboarding

## Key Differences: v1.0 vs v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Port** | 3000 | 3007 |
| **Market** | US-focused | Slovenia-only |
| **Account Types** | Single user | Firm / Solo modes |
| **Platforms** | QuickBooks, Xero, Stripe | eDavki, AJPES, Bank SI |
| **Documents Module** | ❌ | ✅ (Računi) |
| **Help Requests** | ❌ | ✅ |
| **AI Features** | ❌ | ✅ (Composer, Triage, OCR, Chat) |
| **Language** | English | Slovenian |
| **Task Verification** | Simple | Multi-step (submit → verify → approve) |

## Environment Variables

### v1.0 (.env.local)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### v2.0 (uses same .env.local but detects PORT)
The app automatically detects the version based on the PORT environment variable.

## Architecture

Both versions share:
- ✅ Supabase backend
- ✅ Authentication
- ✅ Storage buckets
- ✅ Email provider (Resend)

v2.0 uses:
- Port-based version detection (`lib/version.ts`)
- Additive schema changes (no breaking changes to v1)
- Separate UI flows based on `account_type`

## Development Status

### ✅ Completed
- [x] Dual-port setup (3000 vs 3007)
- [x] Database migrations created
- [x] Slovenia template packs defined
- [x] Version detection logic

### 🔨 In Progress
- [ ] Apply database migrations
- [ ] Account mode selection flow
- [ ] Navigation (Firm vs Solo)
- [ ] Documents module
- [ ] Help requests workflow
- [ ] AI features

### ⏳ Pending
- [ ] Client portal v2
- [ ] End-to-end testing

## Next Steps

1. **Apply migrations** (see instructions above)
2. **Test v1.0** still works: `npm run dev` → http://localhost:3000
3. **Test v2.0** starts: `npm run dev:v2` → http://localhost:3007
4. **Continue development** of v2.0 features

## Safety Notes

- ✅ v1.0 is **completely isolated** - no code changes
- ✅ Database changes are **additive only** - won't break v1.0
- ✅ RLS policies ensure data isolation between firms
- ✅ Storage buckets are separate (`documents-v2`)

## Support

For issues or questions:
- Check migration files in `/supabase/migrations/`
- Review PRD: `PDR_version-2_0.md`
- Check this file: `V2_SETUP_INSTRUCTIONS.md`
