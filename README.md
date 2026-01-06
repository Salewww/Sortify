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
   - Then run `supabase/migrations/20240101000002_auto_create_user.sql`
   - Finally run `supabase/migrations/20240101000003_migration_pack.sql` (adds Migration template pack)

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

## AI-Powered Features (Future Vision)

Sortify can leverage AI to transform the onboarding experience for both bookkeepers and clients. Here's a roadmap of intelligent features:

### 1. Intelligent Task Generation
- **Custom Pack Builder** - Describe your client's business in plain English, AI generates a customized task pack
  - Example: "E-commerce business using Shopify, Stripe, and QuickBooks with 5 employees"
  - AI creates relevant tasks: Shopify integration, Stripe reconciliation, payroll setup, sales tax configuration
- **Task Auto-Optimization** - AI analyzes completion patterns across clients to suggest task reordering, combining, or splitting
- **Missing Task Detection** - AI reviews completed onboardings and suggests tasks that were frequently added manually

### 2. Smart Client Communication
- **AI Reminder Composer** - Generate personalized reminder emails based on:
  - Client's industry and communication style
  - Current blockers and progress
  - Historical response patterns
  - Time of day/week with best engagement
- **Help Request Triage** - When clients click "Need Help", AI:
  - Analyzes the task and common issues
  - Suggests solutions or clarifications automatically
  - Routes complex issues to bookkeeper with context
  - Learns from bookkeeper responses to improve suggestions
- **Progress Summaries** - Auto-generate client-facing progress reports with plain-language explanations

### 3. Intelligent Automation & Prediction
- **Blocker Prediction** - AI predicts which tasks are likely to become blockers based on:
  - Client type and industry
  - Task complexity
  - Historical data from similar clients
  - Proactively suggests interventions
- **Completion Time Estimates** - ML model predicts onboarding completion dates based on:
  - Current progress velocity
  - Remaining task complexity
  - Client engagement patterns
- **Churn Risk Detection** - Identifies clients at risk of abandoning onboarding:
  - Declining engagement metrics
  - Increasing time between task completions
  - Rising help requests
  - Suggests intervention strategies

### 4. Document Intelligence
- **Smart Proof Validation** - AI reviews uploaded proof documents:
  - Verifies screenshots contain expected UI elements
  - Extracts data to confirm task completion (e.g., "User added with Admin role")
  - Flags incomplete or incorrect proofs with specific feedback
  - Learns from bookkeeper approvals/rejections
- **OCR & Data Extraction** - Extract structured data from uploaded documents:
  - Company details from registration documents
  - Account numbers from bank statements
  - Tax IDs from forms
  - Auto-populate client records

### 5. Natural Language Interfaces
- **AI Onboarding Assistant (Client-Facing)** - Chat interface in client portal:
  - "How do I find my Stripe API keys?" → Step-by-step guidance with screenshots
  - "I'm stuck on this task" → Contextual troubleshooting
  - "What's next?" → Explains upcoming tasks and why they matter
- **Bookkeeper Copilot** - Chat interface in dashboard:
  - "Show me all blocked e-commerce clients" → Instant filtered view
  - "Draft reminder for Acme Corp focusing on tax deadline" → Generate custom email
  - "What's the average onboarding time for retail clients?" → Analytics insights

### 6. Smart Search & Discovery
- **Semantic Task Search** - Find tasks by describing what you need:
  - "Two-factor authentication setup" → Returns all 2FA-related tasks across platforms
  - "Tax compliance for California" → Surfaces relevant state-specific tasks
- **Knowledge Base Auto-Builder** - AI analyzes completed tasks and builds a searchable knowledge base:
  - Common troubleshooting steps
  - Platform-specific gotchas
  - Best practices learned from successful onboardings

### 7. Workflow Optimization
- **Task Dependency Detection** - AI identifies implicit dependencies between tasks:
  - "Stripe integration" should come before "Automated invoicing"
  - Suggests optimal task ordering
  - Warns when tasks are marked complete out of sequence
- **Parallel Task Suggestion** - Identifies tasks clients can work on simultaneously to speed up onboarding
- **Template Pack Intelligence** - Recommends template pack combinations based on client profile

### 8. Proactive Insights & Analytics
- **Client Health Score** - AI-powered health metrics combining:
  - Progress velocity
  - Help request frequency
  - Communication responsiveness
  - Blocker resolution time
- **Revenue Impact Prediction** - Estimate client lifetime value based on onboarding smoothness:
  - Smooth onboarding → Higher retention
  - Early blocker resolution → Better relationship
- **Capacity Planning** - Predict bookkeeper workload:
  - "Next week you'll likely have 3 help requests based on current client progress"
  - Suggest optimal times to onboard new clients

### 9. Continuous Learning System
- **Feedback Loop** - Every interaction trains the AI:
  - Bookkeeper edits AI-generated email → Learns writing style
  - Bookkeeper marks AI suggestion as helpful/unhelpful → Improves recommendations
  - Client completes task after AI help → Reinforces successful patterns
- **Industry-Specific Models** - Fine-tuned AI models for different verticals:
  - E-commerce bookkeeping
  - Professional services
  - Non-profits
  - Each with specialized knowledge and terminology

### 10. Integration Intelligence
- **OAuth Verification Assistant** - AI guides through OAuth connection flows:
  - Detects what step client is stuck on
  - Provides contextual help with actual screenshots from that platform
  - Verifies connection was successful by checking API responses
- **API Health Monitoring** - AI monitors connected platform APIs:
  - Detects when credentials expire or permissions change
  - Proactively notifies before issues affect bookkeeping
  - Suggests re-authentication steps

### Implementation Priorities

**Phase 1 (Quick Wins):**
- AI Reminder Composer
- Smart Help Request Triage
- Document OCR & Data Extraction

**Phase 2 (High Impact):**
- Blocker Prediction
- Client Health Score
- Custom Pack Builder

**Phase 3 (Advanced):**
- Natural Language Interfaces (Copilot)
- Smart Proof Validation
- Completion Time Estimates

**Technical Considerations:**
- Use Claude API for text generation and analysis
- OpenAI GPT-4 Vision for document/screenshot analysis
- Fine-tune smaller models for specific predictions (blocker detection, completion time)
- Vector database (Pinecone/Weaviate) for semantic search
- Regular human-in-the-loop feedback to improve AI accuracy

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

-- Then re-run all migration files in order
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
