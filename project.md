# PRD — Sortify (MVP)
**Product:** Sortify  
**Tagline:** “Get client access set up fast. Track it. Remind it. Audit it.”  
**Version:** MVP v1.0  
**Primary wedge:** Access onboarding + recurring access checks in a simple client portal.

---

## 1) Overview
Sortify is a lightweight onboarding and recurring “access health” system for fractional bookkeepers and small accounting firms. It replaces messy email threads with a single portal link per client that shows:

- **What access is needed** (checklist)
- **How to grant it** (step-by-step instructions)
- **What’s still blocking work** (completeness score + blocked tags)
- **Automated follow-ups** (reminders + escalation)
- **Audit trail** (who did what, when)

MVP intentionally avoids deep integrations (OAuth / API verification of access). Instead, it wins on clarity, speed, and workflow.

---

## 2) Goals & Non-goals

### Goals (MVP)
1. Reduce time-to-access completion by making client steps obvious and centralized.
2. Give bookkeepers a clear dashboard of blocked clients and progress.
3. Automate reminders with minimal configuration.
4. Provide an audit log for accountability and compliance comfort.
5. Add recurring “Access Check” packs (monthly/quarterly) with the same portal UX.

### Non-goals (MVP)
- Live verification of access via QBO/Xero/Stripe APIs
- Full document processing (OCR, categorization)
- Full practice management (time tracking, billing, projects)
- Complex role-based permissions (beyond bookkeeper + client contacts)
- E-sign / engagement letters (can be linked out)

---

## 3) Target Users & Personas

### Persona A — Solo Fractional Bookkeeper
- Manages 10–40 clients.
- Biggest pain: chasing access and permissions.
- Needs: speed, “what’s missing” view, minimal setup.

### Persona B — Small Firm Ops / Lead Accountant
- Manages multiple staff and handoffs.
- Needs: standardization, auditability, less back-and-forth.

### Client Side Persona — Business Owner / Office Manager
- Non-technical, busy.
- Needs: one link, short steps, “done” confirmation, minimal friction.

---

## 4) Key Use Cases / User Stories

### Bookkeeper
1. Create client workspace in < 2 minutes.
2. Choose a template pack (or build custom pack).
3. Invite one or more client contacts.
4. Monitor progress and send nudges.
5. Mark items as “needs help” if client is stuck.
6. Schedule recurring access checks (monthly/quarterly).
7. Export audit log if needed.

### Client contact
1. Open portal link without account creation.
2. See checklist grouped by platform with clear steps.
3. Mark tasks complete and optionally upload proof (screenshot/pdf).
4. Request help (simple “needs help” option).

---

## 5) MVP Functional Requirements

### 5.1 Authentication & Roles
- **Bookkeeper user:** authenticated (email/password or OAuth).
- **Client portal:** no login in MVP. Access via signed token link.
- Bookkeeper can add multiple client contacts (email recipients).

**Acceptance criteria**
- Bookkeeper can log in/out.
- Client portal link is unique and cannot be guessed (long token).
- Portal token can be rotated (invalidate old link).

---

### 5.2 Client Workspaces
- Create, edit, archive clients.
- Each client has:
  - Name, optional notes
  - Contacts (name, email)
  - Checklist items (instances)
  - Progress metrics
  - Reminder settings
  - Recurring check schedule

**Acceptance criteria**
- Create client with name + at least 1 contact.
- Client page shows progress + blocking items + last activity.

---

### 5.3 Task Library + Packs
**Task** = a single access action (e.g., “Invite us to QuickBooks Online as Accountant”).  
Fields:
- Platform (QBO/Xero/Stripe/PayPal/Shopify/Bank/Payroll/etc.)
- Title
- Instructions (short, structured markdown)
- Permission level guidance (text)
- “Blocking” boolean (true = blocks starting work)
- Optional link to external help doc

**Pack** = a template list of tasks.
- Built-in default packs (seeded):
  - “Basic Bookkeeping (QBO + Bank + Statements)”
  - “Ecom (Shopify + Stripe/PayPal + QBO/Xero)”
  - “Payroll add-on (Gusto/Deel/etc.)”
- Bookkeeper can create custom packs.

**Acceptance criteria**
- Bookkeeper can apply a pack to a client during creation.
- Bookkeeper can add/remove tasks per client after creation.
- Tasks show in the client portal grouped by platform.

---

### 5.4 Client Portal Checklist UX
Portal shows:
- Client name (optional)
- Progress bar (completed/total)
- “Blocking” section (remaining blockers)
- Grouped tasks by platform with:
  - Task title
  - “Why we need this” (short)
  - Steps (3–7 bullets)
  - Button: **Mark as done**
  - Button: **I need help** (sets status = needs_help)
  - Optional file upload for proof

Status types:
- `pending`
- `done`
- `needs_help`

**Acceptance criteria**
- Client can mark tasks done; progress updates.
- Client can upload proof; bookkeeper can view/download.
- Tasks show clear “blocking” label when relevant.

---

### 5.5 Reminders & Escalation
System sends automated reminder emails to client contacts.

Default cadence (configurable per bookkeeper, overridable per client):
- Day 0: Invite email
- Day 2: Gentle reminder
- Day 5: “This blocks us from starting”
- Day 9: Escalation (optional toggle: include secondary contact)

Reminder email includes:
- Progress (%)
- Top 1–3 remaining items
- Portal link
- Single CTA button

Bookkeeper actions:
- Send manual reminder anytime.
- Pause reminders for a client.
- Change cadence per client.

**Acceptance criteria**
- Reminders are sent based on schedule and only if tasks remain pending/needs_help.
- No reminders sent once all tasks done.
- Manual reminder sends immediately and logs an audit event.

---

### 5.6 Recurring “Access Check” (CloseLoop Lite)
Bookkeeper can enable recurring check for each client:
- Frequency: monthly or quarterly (MVP)
- On run date, create a new “check pack” instance (or reuse same tasks) and email client:
  - “Confirm access still works”
Client choices per task:
- “Still working” → done
- “Needs update” → needs_help

**Acceptance criteria**
- System schedules next run automatically.
- Each run is logged (audit).
- Recurring checks don’t overwrite original onboarding history; they create a new run record or a dated checklist snapshot.

---

### 5.7 Audit Log
Audit events captured:
- Client created/updated
- Portal link created/rotated
- Task marked done / needs_help (with actor = client contact)
- Reminder sent (auto/manual)
- File uploaded
- Recurring check run created

**Acceptance criteria**
- Bookkeeper can view audit log in client workspace.
- Audit is immutable (no edit/delete in UI).

---

### 5.8 Dashboard & Reporting (MVP)
Dashboard list of clients with:
- Completeness %
- # blockers remaining
- Last activity timestamp
- Reminder status (active/paused)
- Filter: “Blocked”, “Stuck >7 days”, “Needs help”

**Acceptance criteria**
- Filters work.
- Clients sort by “most blocked” default.

---

## 6) UX / Screens (Deliverables)

### Bookkeeper App
1. Login
2. Dashboard (client list + filters)
3. Create Client (choose pack, contacts, reminder settings, recurring check)
4. Client Workspace
   - Progress + blockers
   - Checklist table (status, proof, actions)
   - Audit log
   - Reminder controls (send now / pause)
   - Rotate portal link
5. Template Library (packs + tasks)
6. Settings (branding + reminder defaults)

### Client Portal
1. Checklist view (no auth)
2. Task item expanded view (steps + mark done + need help + upload proof)
3. “All done” confirmation state

---

## 7) Data Model (MVP)
Suggested relational model (Postgres):

### Core
- **users**
  - id, email, name, created_at
- **clients**
  - id, owner_user_id, name, notes, is_archived, created_at
- **client_contacts**
  - id, client_id, name, email
- **platforms**
  - id, key, name (seed)
- **tasks**
  - id, platform_id, title, why_text, instructions_md, is_blocking, help_url
- **packs**
  - id, owner_user_id (nullable for system packs), name, description
- **pack_tasks**
  - pack_id, task_id, sort_order

### Per-client instances
- **client_checklists**
  - id, client_id, type (`onboarding` | `recurring_check`), run_label/date, created_at
- **client_task_instances**
  - id, checklist_id, task_id, status, completed_at, completed_by_email, proof_file_url, updated_at

### Reminders & scheduling
- **reminder_settings**
  - client_id, is_paused, cadence_json, escalate_to_secondary, last_sent_at
- **reminder_events**
  - id, client_id, sent_to, type (`invite` | `auto` | `manual`), payload_snapshot, sent_at

### Audit
- **audit_events**
  - id, client_id, actor_type, actor_identifier, event_type, metadata_json, created_at

---

## 8) API Requirements (High-level)
Implement REST or Next.js route handlers.

### Auth
- `POST /auth/*` (provider)

### Clients
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/:id`
- `PATCH /api/clients/:id`
- `POST /api/clients/:id/archive`

### Packs/Tasks
- `GET /api/packs`
- `POST /api/packs`
- `GET /api/tasks`
- `POST /api/tasks`

### Checklist Instances
- `POST /api/clients/:id/checklists` (create onboarding or recurring run)
- `GET /api/checklists/:id`

### Portal
- `GET /p/:token` (server resolves token → checklist)
- `POST /api/portal/:token/tasks/:instanceId/done`
- `POST /api/portal/:token/tasks/:instanceId/help`
- `POST /api/portal/:token/tasks/:instanceId/upload` (multipart)

### Reminders
- `POST /api/clients/:id/reminders/send` (manual)
- Background job: send auto reminders for eligible clients

### Link rotation
- `POST /api/clients/:id/portal/rotate`

**Acceptance criteria**
- All endpoints validate ownership and token permissions.
- Rate limit portal actions.

---

## 9) Email Templates (MVP)
1. Invite email
2. Gentle reminder
3. Blocking reminder
4. Escalation reminder
5. Recurring check email
6. Completion email (optional)

Each includes:
- Client name
- Progress summary
- Portal button link
- Support contact line (“Reply to this email” or bookkeeper email)

---

## 10) Security & Privacy
- Portal access via signed token:
  - Long random token stored hashed OR stored plaintext but rotated easily (prefer hashed + lookup by hash).
- File uploads:
  - Virus scan optional (out of MVP) but restrict file types: png/jpg/pdf.
  - Max size limit.
- Data:
  - Encrypt secrets at rest via managed DB.
  - Audit log immutable.
- Compliance posture:
  - Do not ask for passwords. Include a banner: “Never share credentials here.”

**Acceptance criteria**
- Portal token cannot access other clients.
- Rotating token invalidates old link immediately.
- Upload permissions scoped to checklist.

---

## 11) Analytics (MVP)
Track events:
- client_created
- portal_opened
- task_completed
- task_needs_help
- reminder_sent (auto/manual)
- checklist_completed
- recurring_check_run_created

Key KPIs:
- Median time from invite → 100% completion
- Completion rate within 7 days
- Avg reminders per client until completion
- % tasks marked “needs help”

---

## 12) Performance & Reliability
- Portal loads < 2s on average.
- Background reminder job must be idempotent (no duplicate sends).
- Email provider retry logic.
- Store reminder send records to prevent duplicates.

---

## 13) Milestones
### M1 — Core portal + client creation
- Auth, client creation, pack apply, portal checklist, mark done

### M2 — Reminders + dashboard
- Auto reminder scheduler, manual reminders, dashboard filters

### M3 — Audit + recurring checks
- Audit event system, recurring check scheduling, checklist runs

### M4 — Polish
- Branding settings, link rotation UI, basic export

---

## 14) Acceptance Criteria Checklist (MVP “Done”)
- Bookkeeper can create a client workspace with a pack and invite contacts.
- Client can complete tasks via portal link without login.
- Progress shows accurately and updates instantly.
- Automated reminders send based on schedule and stop on completion.
- Bookkeeper can send manual reminders and pause reminders.
- Bookkeeper can rotate portal link to invalidate old link.
- Audit log captures key actions and is viewable per client.
- Recurring access check can be scheduled and produces a new dated run.

---

## 15) Edge Cases (Must handle)
- Contact email typo → bookkeeper can edit contacts and resend invite.
- Multiple contacts: reminders sent to all or primary only (MVP: primary + optional secondary escalation).
- Client marks wrong task done → bookkeeper can revert status (optional). If not included, add “bookkeeper override” in MVP.
- Portal token leaked → rotate link.
- File upload too large/invalid → clear error message.
- Reminder duplication due to retries → prevented by reminder_events idempotency key.

---

## 16) Future (Post-MVP)
- OAuth “Connect” buttons for QBO/Xero/Stripe and automatic access verification
- White-label domain + custom sender domain
- In-portal messaging
- SOP library marketplace (packs shared/sold)
- Multi-user firms (team roles)
- Integrations with practice mgmt (Karbon, Canopy, Jetpack Workflow, etc.)

---

## 17) AI Coding Agent Handoff Notes (Implementation Guidance)
**Recommended stack (can be swapped):**
- Next.js (App Router), Tailwind
- Supabase (Postgres, Auth, Storage) or Clerk + Postgres
- Resend/Postmark for email
- Stripe for billing
- Cron/background jobs (Vercel Cron / Supabase scheduled functions / server cron)

**Build order suggestion**
1. Schema + seeds (platforms, tasks, default packs)
2. Bookkeeper auth + dashboard
3. Client create flow + portal token generation
4. Client portal checklist actions + uploads
5. Reminder scheduler + email templates
6. Audit log + recurring checks

**Seed content**
- Provide 12–15 tasks across the most common platforms and 3 packs.
- Keep instruction text short; treat as editable CMS content in DB.