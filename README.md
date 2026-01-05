# Sortify MVP

**Tagline:** "Get client access set up fast. Track it. Remind it. Audit it."

Sortify is a lightweight onboarding and recurring "access health" system for fractional bookkeepers and small accounting firms. It replaces messy email threads with a single portal link per client.

## Features

- ✅ **Client Workspaces** - Create and manage client onboarding
- ✅ **Template Packs** - Pre-built task templates for common platforms (QBO, Xero, Stripe, etc.)
- ✅ **Client Portal** - No-login access for clients via secure token
- ✅ **Progress Tracking** - Real-time completion metrics and blocking task identification
- ✅ **Reminders** - Manual reminder system with email notifications
- ✅ **Audit Log** - Immutable trail of all actions
- ✅ **File Uploads** - Clients can upload proof of completion
- 🔄 **Recurring Checks** - Scheduled monthly/quarterly access verification (database ready, automation pending)

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (for file uploads)
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))
- A Resend account ([resend.com](https://resend.com))

### 1. Clone and Install

```bash
cd sortify
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

3. Run the database migrations **in order**:
   - Go to **SQL Editor** in Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Click **Run**
   - Then run `supabase/migrations/20240101000001_seed_data.sql`
   - Finally run `supabase/migrations/20240101000002_auto_create_user.sql`

4. Set up Storage bucket:
   - Go to **Storage** in Supabase dashboard
   - Create a new **public** bucket named `task-proofs`
   - Set the bucket to public so uploaded files are accessible

### 3. Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Resend
RESEND_API_KEY=your-resend-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. Click "Don't have an account? Sign up"
3. Enter your email and password (min 6 characters)
4. Check your email for the verification link from Supabase
5. Click the verification link
6. Sign in with your credentials

## Usage Guide

### Creating a Client

1. From the dashboard, click **+ New Client**
2. Fill in:
   - **Client Name** (e.g., "Acme Corporation")
   - **Notes** (optional internal notes)
   - **Template Pack** (choose from pre-built templates)
   - **Contacts** (at least one, mark primary contact)
   - **Recurring Checks** (optional, monthly or quarterly)
3. Click **Create Client**

### Sharing the Portal Link

1. Go to the client's detail page
2. Copy the **Client Portal Link**
3. Send it to your client via email or message
4. The client can access the checklist without creating an account

### Client Portal Experience

When clients open their portal link, they will see:

- Overall progress percentage
- List of tasks grouped by platform
- For each task:
  - Why it's needed
  - Step-by-step instructions
  - Option to mark as done
  - Option to request help
  - Optional file upload for proof

### Sending Reminders

From the client detail page, click **Send Reminder** to manually send an email reminder to the primary contact with:

- Current progress
- Remaining tasks
- Portal link

### Rotating Portal Links

If a portal link is compromised or needs to be changed:

1. Go to the client detail page
2. Click **Rotate Link**
3. The old link will immediately stop working
4. Copy and share the new link

### Viewing Audit Logs

Every action is logged:

- Client created/updated
- Portal link rotated
- Tasks marked done/needs help
- Reminders sent
- Files uploaded

View the audit log at the bottom of each client detail page.

## Project Structure

```
sortify/
├── app/
│   ├── api/              # API routes
│   │   ├── clients/      # Client management APIs
│   │   └── portal/       # Portal APIs (no auth)
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Bookkeeper dashboard
│   │   ├── clients/      # Client management
│   │   └── packs/        # Template packs (pending)
│   ├── p/[token]/        # Client portal (no auth)
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ClientActions.tsx
│   └── PortalTaskCard.tsx
├── lib/                  # Utility functions
│   ├── audit.ts          # Audit logging
│   ├── utils.ts          # Helper functions
│   └── supabase/         # Supabase clients
├── types/                # TypeScript types
│   └── database.ts       # Database type definitions
├── supabase/
│   └── migrations/       # SQL migrations
└── public/               # Static assets
```

## Database Schema

The application uses the following main tables:

- **users** - Bookkeeper accounts
- **clients** - Client workspaces
- **client_contacts** - Client contact information
- **platforms** - Platforms (QBO, Xero, Stripe, etc.)
- **tasks** - Task library
- **packs** - Template packs
- **pack_tasks** - Tasks in each pack
- **client_checklists** - Checklist instances per client
- **client_task_instances** - Individual task completions
- **reminder_settings** - Per-client reminder config
- **reminder_events** - Reminder history
- **audit_events** - Audit trail
- **recurring_check_schedules** - Recurring check config

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Portal tokens are 32-character random strings
- ✅ Portal access is scoped to specific clients only
- ✅ File uploads restricted to images and PDFs
- ✅ All actions are logged in audit trail
- ✅ Authentication via Supabase Auth

## What's Not Implemented (Future Enhancements)

The MVP focuses on core functionality. These features are planned for future releases:

- **Automated Reminder Scheduler** - Background job to send reminders based on cadence
- **Recurring Check Automation** - Auto-create new checklists monthly/quarterly
- **Pack & Task Management UI** - Create custom packs and tasks from dashboard
- **Settings Page** - Customize branding, default reminder cadence
- **Advanced Filters** - Dashboard filtering by status, date ranges
- **OAuth Integrations** - Verify access automatically via QBO/Xero APIs
- **White-label Domains** - Custom domains for client portals
- **Team Management** - Multi-user support for accounting firms
- **In-portal Messaging** - Chat with clients directly

## Development Notes

### Running Migrations Manually

If you need to reset the database:

```sql
-- Drop all tables
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS reminder_events CASCADE;
DROP TABLE IF EXISTS reminder_settings CASCADE;
DROP TABLE IF EXISTS recurring_check_schedules CASCADE;
DROP TABLE IF EXISTS client_task_instances CASCADE;
DROP TABLE IF EXISTS client_checklists CASCADE;
DROP TABLE IF EXISTS pack_tasks CASCADE;
DROP TABLE IF EXISTS packs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS platforms CASCADE;
DROP TABLE IF EXISTS client_contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run both migration files
```

### Customizing Email Templates

Email templates are inline HTML in the API routes. To customize:

1. Edit `/app/api/clients/[id]/reminders/send/route.ts`
2. Modify the HTML in the `resend.emails.send()` call
3. Consider using React Email templates for more complex emails

### Adding New Tasks/Packs

Currently, tasks and packs are seeded in the database. To add new ones:

1. Insert directly via Supabase SQL Editor
2. Or build the Pack Management UI (future feature)

Example SQL to add a new task:

```sql
INSERT INTO tasks (platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  (SELECT id FROM platforms WHERE key = 'quickbooks'),
  'New Task Title',
  'Why this task is needed',
  E'Step 1: Do this\nStep 2: Do that',
  true
);
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy!

### Post-Deployment Checklist

- [ ] Verify email sending works (test reminder feature)
- [ ] Test file uploads
- [ ] Create a test client and complete the portal flow
- [ ] Check audit logs are recording
- [ ] Update Resend domain if using custom domain

## Troubleshooting

### "Error creating client" - Foreign key constraint violation

If you see `violates foreign key constraint "clients_owner_user_id_fkey"`, it means your auth user hasn't been added to the public.users table:

1. Go to Supabase dashboard → **SQL Editor**
2. Run the migration: `supabase/migrations/20240101000002_auto_create_user.sql`
3. This will create a trigger AND backfill your existing user
4. Try creating a client again

### "Error creating client" - No template packs

If you see this error, the seed data hasn't been loaded yet:

1. Go to Supabase dashboard → **SQL Editor**
2. Run the seed migration: `supabase/migrations/20240101000001_seed_data.sql`
3. Verify the packs exist by running: `SELECT * FROM packs;`
4. You should see 4 template packs (Basic Bookkeeping, E-commerce, etc.)
5. Refresh the "New Client" page and try again

### No template packs available

Make sure you've run ALL migrations in order:
1. First: `20240101000000_initial_schema.sql` (creates tables)
2. Second: `20240101000001_seed_data.sql` (adds template packs and tasks)
3. Third: `20240101000002_auto_create_user.sql` (auto-creates users)

### Email reminders not sending

- Verify your Resend API key is correct in `.env.local`
- Make sure you've verified your sending domain in Resend
- Check the Resend dashboard for delivery logs

## Support & Contributing

For issues or questions:

- Check the audit log for debugging
- Review Supabase logs for database errors
- Check browser console for client-side errors

## License

This is an MVP build. Add your license here.

---

**Built with ❤️ for bookkeepers everywhere.**
