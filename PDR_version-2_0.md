# Sortify v2.0 (Slovenia-only) — Product Requirements Document (PRD)
**Audience:** AI Coding Agent (full-stack)  
**Primary market:** Slovenia (SI)  
**Primary language (UI):** Slovenian by default, with English fallback for internal labels (optional)  
**Product type:** B2B SaaS for accounting firms + self-service for Slovenian sole proprietors (s.p., including **normiranec**)  
**Version:** 2.0  
**Owner POV:** Accounting firm owner / lead accountant

---

### Account Mode Selection (Critical)
On first login, the user MUST select one of the following modes:
1. Accounting Firm / Accountant (Firm mode)
2. Self-managed bookkeeping (Solo mode)

This selection sets `account_type` and permanently defines:
- Navigation structure
- Enabled modules
- Default template packs
- Permissions and scope of data (clients vs self)

The system uses a single core architecture with feature flags and scoping rules.


## 0) Executive Summary

Sortify v2.0 is an “Accounting Operations OS” for Slovenia that:
1) Standardizes and automates client onboarding for accounting firms (računovodski servis).
2) Adds a **Documents/Receipts (Računi)** module so businesses (normiranec, regular s.p., d.o.o.) can store and organize invoices/receipts and connect them to tasks.
3) Adds **AI-assisted operations** (Phase 1) to reduce chasing clients:  
   - AI Reminder Composer (email drafts + send scheduling support)  
   - Smart Help Triage (client “Need help” → suggested response steps)  
   - OCR & Data Extraction for documents (minimal but valuable)  
4) Adds an in-app **AI Chat Assistant** focused on:  
   - Helping users navigate Sortify  
   - Providing Slovenia-specific plain-language guidance for tasks (“What/Why/How”)  
   - Later expansion: guided bookkeeping flows (NOT in scope for v2.0)

**Core principle:** v2.0 must deliver **time-to-first-value < 10 minutes** for both accountants and self-service normiranci.

---

## 1) Goals & Non-Goals

### 1.1 Goals
**G1 — Onboarding OS for SLO accounting firms**
- Create repeatable onboarding “packs” aligned with Slovenian needs (eDavki, AJPES, bank statements, VAT, payroll onboarding).
- Reduce manual email back-and-forth with structured tasks, client portal, reminders, and status tracking.

**G2 — Self-service accounting readiness for normiranci**
- Provide a lightweight “compliance + document organization” hub that removes chaos for normirani s.p. who self-manage.
- Store invoices/receipts (Računi), optionally tag as issued/received, and keep them searchable and exportable.

**G3 — Documents/Receipts module**
- Allow uploading, storing, organizing, searching documents.
- Minimal OCR extraction to auto-fill date/vendor/amount and categorize.

**G4 — AI Phase 1**
- AI Reminder Composer (draft + tone + context)
- Smart Help Triage (suggested instructions)
- OCR & Data Extraction (basic invoice fields)
- AI Chat Assistant (tool help + task explanations in SI context)

**G5 — Professional, sale-ready product**
- White-label basic branding for accounting firms (logo, firm name)
- Clear onboarding demo experience
- Audit trail of actions & reminders

### 1.2 Non-Goals (v2.0)
- Multi-country / multi-legislation engine (explicitly out of scope)
- Full bookkeeping system (posting entries, VAT returns automation, eDavki API integration)
- Full client-accountant chat/messaging system (only email reminders + help requests)
- Advanced ML predictions (blocker prediction, churn scoring) — out of scope for v2.0

---

## 2) Target Users & Personas

### Persona A — Accounting Firm Owner / Admin
- Creates templates/packs, adds clients, tracks progress, sends reminders, handles help requests.
- Needs: scale onboarding, reduce chasing, standardize operations.

### Persona B — Staff Accountant (Firm Member)
- Works on subset of clients, resolves help requests, verifies proofs/documents.

### Persona C — Self-service Normiran s.p. (Solo)
- No accounting firm. Wants reminders, document storage, clarity about tasks.
- Needs: “What do I need to do?” and “Where do I store invoices?”

### Persona D — Business Client (Client Portal User)
- Receives tasks from accounting firm, uploads proofs/documents, clicks “Need help”.

---

## 3) Product Packaging (Plans) — Implementation Requirements

### 3.1 Plans (logical)
- **Solo (Normiran / Self-service):**  
  - No “Clients” concept (or “Client” = self).  
  - Templates limited to Solo packs.  
  - Documents module enabled.
- **Firm (Accounting):**  
  - Full Clients, Templates, Team, Branding.

**Implementation approach:** feature flags by `account_type`:
- `account_type = "solo" | "firm"`
- Solo: UI shows “My Workspace” instead of Clients list; client portal optional.
- Firm: full dashboard.

---

## 4) Core IA (Information Architecture)

### 4.1 Navigation (Firm)
- Dashboard
- Clients
- Templates
- Documents (Računi)
- AI Assistant
- Settings

### 4.2 Navigation (Solo)
- Dashboard
- Tasks (My Checklist)
- Documents (Računi)
- AI Assistant
- Settings

---

## 5) Key Concepts & Definitions

- **Client:** A business entity managed by a firm (or self for Solo).
- **Template Pack:** A curated set of tasks for a scenario (e.g., “SLO Normiran Onboarding”).
- **Task:** A single action the client must complete (e.g., “Grant eDavki authorization”, “Upload last 3 months bank statements”).
- **Proof:** Client-submitted evidence for task completion (upload, screenshot, note, link).
- **Blocker:** A task state indicating completion is blocked; requires client action or help.
- **Help Request:** Client signals they’re stuck on a task; triggers triage and accountant workflow.
- **Reminder:** Email sent (or scheduled) to encourage completion; tracked in audit log.
- **Document/Receipt (Račun):** An invoice/receipt stored in the system; may be linked to tasks and have extracted fields.

---

## 6) Slovenia-specific Requirements (SLO Market Fit)

### 6.1 Must-have Template Packs (System Templates for SI)
Provide these “System Packs” out of the box (editable only by admins, with “duplicate to custom”).

#### Pack SI-1: **Normiran s.p. — Self-Service Starter**
- Store issued invoices (evidence)
- Store received invoices/receipts (optional)
- Annual reminders: “Oddaja davčnega obračuna” (deadline guidance)
- VAT status awareness (if VAT registered)
- Document retention reminder (plain-language)

#### Pack SI-2: **Accounting Firm — Basic Onboarding (s.p.)**
- eDavki access + authorization guidance
- Bank statement upload (PDF)
- Issued invoices export/summary
- VAT status confirm
- Business activity overview (questionnaire)

#### Pack SI-3: **Accounting Firm — Basic Onboarding (d.o.o.)**
- AJPES data confirmation
- eDavki authorization
- Bank statements
- VAT config tasks
- Assets list (basic)

#### Pack SI-4: **Switching Accountant (Migration)**
- Request prior year financials
- Chart of accounts / balances (simplified request)
- Open AR/AP list
- Payroll handover (if applicable)

#### Pack SI-5: **VAT Onboarding**
- VAT obligations checklist (plain language)
- Required evidence upload tasks

> NOTE: We will not build Slovenia tax logic automation. We provide **tasks + guidance**.

---

## 7) User Journeys & Flows

### 7.1 First-time Experience (Firm)
**Objective:** show value in <10 minutes.

**Flow:**
1. Sign up / sign in
2. “Setup wizard” (one-time):
   - firm name
   - default sender email (system uses transactional email provider)
   - optional logo upload
3. Landing on Dashboard:  
   - A demo client exists (toggle “Remove demo”)
   - A default SI template pack is visible
4. CTA: “Add real client” → create client → select pack → generate checklist
5. Invite client via email (client portal link)

**Acceptance:** firm can create first client and send invite in <10 minutes.

### 7.2 First-time Experience (Solo)
1. Sign up
2. Select business type: `normiran s.p. | s.p. | d.o.o.` (default: normiran)
3. Auto-assign SI-1 pack (normiran) or relevant pack
4. Redirect to “My Checklist”
5. CTA: “Upload your first invoice/receipt” (Documents tab)

### 7.3 Client Onboarding (Firm)
1. Firm creates client + selects pack + (optional) custom tasks
2. System generates tasks (ordered)
3. Firm invites client by email
4. Client opens portal, sees tasks, completes tasks by:
   - marking done
   - uploading proof
   - requesting help
5. Firm reviews tasks, marks approved/rejected if “requires verification”
6. Reminders are sent automatically on cadence (v2.0: scheduler included)

---

## 8) Feature Requirements (Detailed)

# 8A) Clients Module (Firm)

### 8A.1 Clients List
**Fields displayed per client card:**
- Client name
- Primary contact (name/email)
- Progress: % tasks complete
- Blockers count
- Status pill: `Active | Blocked | Needs Help | Completed`
- Last activity timestamp
- CTA: open client detail

**Filters (must):**
- All
- Blocked
- Needs Help
- Completed

**Sort (must):**
- Default: “most blocked + recent activity”
- Option: by name, by created date, by progress

### 8A.2 Create Client
**Inputs:**
- Client name (required)
- Legal type (optional): s.p. (normiran / not), d.o.o.
- VAT registered? (boolean)
- Primary contact:
  - name
  - email (required)
- Template pack selection (required)
- Invite immediately toggle (default ON)

**Actions:**
- Create client record
- Generate tasks from selected pack
- If Invite: send email with portal link

### 8A.3 Client Detail (Firm view)
Tabs:
- Overview
- Tasks
- Documents
- Contacts
- Audit Log

**Overview**
- Progress bar
- Status summary: blockers, needs help
- Upcoming reminders (next scheduled)
- Quick actions: Send reminder, Add task, Upload doc, Invite/Resend invite

**Tasks**
- Task list grouped by status:
  - To Do / In Progress / Needs Verification / Completed / Blocked
- Each task shows:
  - title
  - short “why this matters”
  - instructions link (expand)
  - due date (optional)
  - assignee (client vs firm)
  - proof requirements (if any)
  - help status

**Documents**
- Embedded Documents module view filtered for this client

**Audit Log**
- Immutable timeline:
  - task created/updated
  - proof uploaded
  - reminder sent
  - help request created/resolved
  - AI suggestions accepted/rejected

---

# 8B) Templates Module (Firm + Solo Read-only)

### 8B.1 Template Packs List
- System Packs (SI) shown first
- Custom Packs below
- Each pack shows:
  - name
  - description
  - task count
  - tags: `SI`, `s.p.`, `normiran`, `d.o.o.`, `VAT`, `Migration`
- Actions:
  - View
  - Duplicate (System → Custom)
  - Edit (Custom only)
  - Archive (Custom only)

### 8B.2 Template Pack Detail
- Pack info (name, description, intended use)
- Tasks list with ordering
- Each task has:
  - title
  - platform tag (e.g., eDavki, Bank, AJPES)
  - instructions (rich text)
  - proof type (none / upload / screenshot / link / note)
  - verification required? (boolean)
  - default reminder cadence override? (optional)

### 8B.3 Template Builder (Custom Packs)
**Must-have builder features:**
- Create task
- Reorder tasks (drag/drop)
- Mark task required/optional
- Set proof requirement type
- Add “Why this matters” (short)
- Add “Steps” (detailed instructions)
- Add links (e.g., eDavki portal)
- Save version

**Non-goal:** dependency graph. Keep simple ordering.

---

# 8C) Tasks & Client Portal (Firm clients + Solo self)

## 8C.1 Task States
- `TODO`
- `IN_PROGRESS`
- `NEEDS_HELP` (client requested)
- `SUBMITTED` (client says done + proof uploaded)
- `NEEDS_VERIFICATION` (awaiting firm approval)
- `COMPLETED`
- `BLOCKED` (explicit blocker reason)
- `REJECTED` (firm rejected proof; returns to TODO/IN_PROGRESS)

**Rules:**
- Client can move `TODO → IN_PROGRESS → SUBMITTED`
- If verification required: `SUBMITTED → NEEDS_VERIFICATION`
- Firm can approve: `NEEDS_VERIFICATION → COMPLETED`
- Firm can reject: `NEEDS_VERIFICATION → REJECTED` with reason
- Client can set `NEEDS_HELP` anytime
- Blocked can be applied by firm with reason (e.g., “Missing credentials”)

## 8C.2 Task Detail (Client Portal)
**Must include:**
- Title
- Why this matters (plain language)
- Steps (numbered)
- Proof upload area (if required)
- “Need help” button
- “Mark as done” button
- Comments thread (lightweight):
  - client notes
  - firm notes
  - AI suggestion snippet (optional)

**Uploads:**
- PDF, PNG, JPG
- max size per file configurable (e.g., 25MB)
- store in secure bucket

## 8C.3 Client Portal Access
- Magic link or tokenized link from email (simple)
- Optional password auth later (not required if you already have auth)
- The portal must be scoped to a single client.

**Security requirement:** portal link must expire or be revocable.  
- Recommended: signed URL token with expiry + allow “Resend new invite”.

---

# 8D) Documents / Receipts Module (Računi)

## 8D.1 Goals
- A single place to store invoices/receipts for Solo and Firm clients.
- Fast upload, search, categorize.
- Basic OCR extraction to reduce manual entry.

## 8D.2 Document Types
- `ISSUED_INVOICE` (izdan račun)
- `RECEIVED_INVOICE` (prejet račun)
- `RECEIPT` (račun iz trgovine)
- `BANK_STATEMENT`
- `OTHER`

## 8D.3 Document Fields (data model)
- `id`
- `owner_type`: `solo_user | firm_client`
- `owner_id`: user_id or client_id
- `type`
- `vendor_name` (extracted/manual)
- `document_number` (optional)
- `issue_date` (extracted/manual)
- `due_date` (optional)
- `amount_gross` (extracted/manual)
- `currency` (default EUR)
- `vat_amount` (optional extracted)
- `vat_rate` (optional)
- `notes`
- `tags[]`
- `linked_task_id` (optional)
- `file_url` (secure)
- `created_at`, `updated_at`
- `ocr_status`: `NOT_RUN | RUNNING | SUCCESS | FAILED`

## 8D.4 Documents UI
**List view:**
- Filter by type
- Search by vendor, amount, date, doc number
- Sort by date uploaded / issue date
- Bulk actions: download/export metadata CSV (phase optional)

**Upload:**
- Drag-drop
- Choose type (default: RECEIPT)
- After upload:
  - show extracted fields
  - allow edit and save

## 8D.5 OCR & Extraction (AI Feature #3)
**Scope for v2.0:** basic, best-effort extraction.
- Extract vendor name, date, amount, currency
- If fails: allow manual entry
- Show confidence indicator (simple: high/low)
- Log extraction result to audit.

**Acceptance:**
- For common invoice PDFs and clear photos, extraction succeeds “often enough” (no strict % requirement) but must never block the user.

---

# 8E) Reminders System (Non-AI + AI)

## 8E.1 Default Reminder Cadence (Firm)
- Default: Day 0, 2, 5, 9 after onboarding start (or pack assignment)
- Customizable in Settings (firm-level)
- Per-client override allowed (v2.0 optional but recommended)

## 8E.2 Reminder Scheduler (MVP-level background jobs)
- Daily job checks overdue tasks and schedules reminders
- Avoid spamming:
  - max 1 reminder per client per day
  - only remind if there are incomplete tasks

**Email content types:**
- General progress reminder
- Blocker reminder
- Help request follow-up

## 8E.3 Reminder Tracking
Store:
- reminder_id
- client_id
- sent_to email
- subject/body
- sent_at
- related_task_ids (optional)
- AI_generated boolean
- status: `SENT | FAILED`

---

# 8F) AI Features — Phase 1 (Must Build in v2.0)

## 8F.1 AI Reminder Composer (Priority #1)
**User:** Firm user (admin/staff)

**Where:**
- Client detail → “Send Reminder”
- Or auto-reminder job uses AI if enabled

**Inputs to model:**
- client name, business type
- incomplete tasks summary
- blockers summary
- last activity date
- prior reminder history
- desired tone: `Friendly | Direct | Formal`
- language: `Slovenian` (default)

**Outputs:**
- subject
- email body (plain text + optional HTML)
- suggested CTA bullets: top 3 tasks
- optional “next steps” section

**UI:**
- Show draft
- Edit before send
- “Use this style next time” toggle (stores preferences)

**Acceptance Criteria:**
- Generates usable Slovenian reminder text with placeholders resolved.
- User can edit and send.
- Store whether AI was used + edits delta (optional).

---

## 8F.2 Smart Help Triage (Priority #2)
**User:** Firm user responding to client stuck on a task

**Flow:**
1. Client clicks “Need help” on a task
2. System creates Help Request with context:
   - task details
   - client note (optional)
   - platform (eDavki, bank, etc.)
3. AI produces:
   - likely issue hypotheses (1–3)
   - recommended next steps (simple checklist)
   - suggested reply message in Slovenian

**UI:**
- Firm sees Help Requests queue
- Open request → AI suggestions shown
- Buttons: “Send suggested reply”, “Edit”, “Mark resolved”

**Acceptance:**
- Creates triage suggestion in <10 seconds (or shows “AI unavailable” fallback).
- Firm can respond without leaving app.

---

## 8F.3 OCR & Data Extraction (Priority #3)
Defined earlier in Documents module (8D.5).

---

# 8G) AI Chat Assistant (Tool Help + SLO Context)

## 8G.1 Primary Role (v2.0)
- Helps user use Sortify:
  - “How do I add a client?”
  - “What does Blocked mean?”
- Helps explain tasks in plain language:
  - “What is eDavki authorization and why do I need it?”
- Helps with document handling:
  - “What should I upload here?”
  - “Where do I store issued invoices?”

## 8G.2 Constraints & Safety
- Must display disclaimer:
  - “This is general information, not legal/tax advice.”
- Must not claim filing actions were performed (no eDavki automation).
- Must cite internal knowledge base (templates + in-app help) where possible.

## 8G.3 Chat UI
- Right-side panel or dedicated page
- Suggested prompts:
  - “What’s next for this client?”
  - “Explain this task in simple terms”
  - “Draft a message to the client”

**Context injection rules:**
- If user is on client page, include client context
- If user is on task page, include task context
- If user is Solo, include solo tasks context

**Acceptance:**
- Chat works without requiring user to copy/paste.
- Answers are short, actionable, in Slovenian by default.

---

## 9) Settings & Admin

### 9.1 Profile Settings
- Name
- Email (read-only if tied to auth provider)
- Organization name (Firm)
- Logo upload (Firm)

### 9.2 Application Settings (Firm)
- Default reminder cadence
- Default language (Slovenian)
- AI features toggles:
  - AI reminders enabled
  - AI triage enabled
  - OCR enabled
- Email sender config (if needed)
- Data export (optional link)

### 9.3 Danger Zone
- Delete account:
  - Must delete all data (clients, tasks, documents, logs)
  - Confirm by typing “DELETE”

---

## 10) Permissions & Roles

### Roles (Firm)
- `OWNER`: full access
- `ADMIN`: manage templates, clients, settings
- `STAFF`: manage assigned clients, respond to help, view templates
- `READ_ONLY`: view only (optional)

### Client Portal Role
- `CLIENT_USER`: can only view/complete tasks for their client, upload documents, request help.

### Solo
- single role: `SOLO_USER`

---

## 11) Data Model (Minimum Entities)

> Adapt to your existing Supabase schema; below are required logical entities.

### 11.1 `users`
- id
- email
- name
- account_type: solo/firm
- firm_id (nullable)
- created_at

### 11.2 `firms`
- id
- name
- logo_url
- default_language (SI)
- reminder_cadence_json
- ai_settings_json

### 11.3 `clients`
- id
- firm_id
- name
- business_type: normiran_sp | sp | doo
- vat_registered boolean
- primary_contact_name
- primary_contact_email
- status derived
- created_at

### 11.4 `template_packs`
- id
- firm_id (nullable for system packs)
- is_system boolean
- country_code = "SI"
- name
- description
- tags[]
- created_at

### 11.5 `template_tasks`
- id
- pack_id
- order_index
- title
- platform_tag
- why_this_matters
- steps_richtext
- proof_type: none/upload/screenshot/link/note
- requires_verification boolean

### 11.6 `client_tasks`
- id
- client_id (nullable for solo tasks if using “self-client” approach)
- solo_user_id (nullable)
- template_task_id (nullable)
- title, steps, etc snapshot
- status
- due_date (optional)
- blocker_reason (optional)
- help_requested boolean
- created_at, updated_at

### 11.7 `task_proofs`
- id
- client_task_id
- uploaded_by: client/firm
- file_url (nullable)
- note (nullable)
- link (nullable)
- created_at

### 11.8 `help_requests`
- id
- client_task_id
- client_message
- ai_suggestion_json
- status: open/resolved
- created_at, resolved_at

### 11.9 `documents`
(as defined in 8D.3)

### 11.10 `reminders`
(as defined in 8E.3)

### 11.11 `audit_logs`
- id
- firm_id
- actor_user_id
- entity_type (client/task/doc/reminder/help)
- entity_id
- action
- payload_json
- created_at

---

## 12) API / Backend Requirements (Logical)

### 12.1 Core Endpoints (examples)
- `POST /api/clients` create client + generate tasks
- `POST /api/clients/:id/invite` send portal invite
- `POST /api/tasks/:id/status` update status
- `POST /api/tasks/:id/proof` upload proof
- `POST /api/tasks/:id/help` create help request
- `POST /api/ai/reminder-draft` generate reminder draft
- `POST /api/ai/help-triage` generate help triage suggestion
- `POST /api/documents/upload` upload doc + (optional) run OCR
- `POST /api/ai/ocr-extract` run extraction
- `POST /api/ai/chat` chat assistant with context

### 12.2 Background Jobs
- Reminder scheduler job (daily + optional hourly)
- OCR processing job (queue-based)
- Cleanup job for expired portal tokens (if needed)

---

## 13) UX/UI Requirements (Implementation-Level)

### 13.1 General UI
- Clean, minimal admin UI
- Clear status pills
- Consistent CTAs:
  - Primary: Add Client / Upload Document / Send Reminder
- Empty states must guide next action

### 13.2 Dashboard (Firm)
Widgets:
- Clients needing attention (Blocked, Needs Help)
- Reminders scheduled today
- Recent activity
- Template usage quick stats

### 13.3 Dashboard (Solo)
Widgets:
- Next tasks
- Upcoming yearly reminders
- Recent uploads

### 13.4 Client Detail
Must have:
- prominent progress + blockers
- “Send Reminder” button
- “Open help requests” shortcut
- tasks list with expand detail

### 13.5 Documents tab
- Fast upload
- Editable extracted fields
- Search + filters

### 13.6 AI Assistant UI
- Chat panel
- “Use context from current page” always ON
- Quick buttons:
  - “Explain this task”
  - “Draft reminder”
  - “Summarize progress”

---

## 14) Copy & Language (Slovenia)

### 14.1 Default language
- Slovenian everywhere for SI templates and UI
- Allow internal dev strings in EN if needed, but user-facing should be SI.

### 14.2 Plain-language style
- Avoid legal jargon
- Use:
  - “Kaj moraš narediti”
  - “Zakaj je to pomembno”
  - “Koraki”

---

## 15) Security & Compliance (Must)

- Role-based access control (firm separation)
- Documents stored securely (private bucket)
- Portal links revocable + expiring
- Audit trail for sensitive actions (documents, reminders, approvals)
- GDPR basics:
  - Export (optional)
  - Delete account flow (required)

---

## 16) Analytics & Telemetry (Must)

Track events:
- created_client
- invited_client
- task_completed
- help_requested
- reminder_sent
- ai_reminder_generated
- ai_triage_generated
- document_uploaded
- ocr_success / ocr_failed
- chat_opened / chat_message_sent

Key KPIs:
- Time-to-first-client-created (Firm)
- Time-to-first-document-upload (Solo)
- Avg onboarding duration (Firm)
- Reduction in help requests over time (proxy)
- AI adoption rate

---

## 17) Acceptance Criteria (Definition of Done)

### Firm MVP Done When:
- Can create client, select SI pack, auto-generate tasks
- Can invite client and client can complete tasks in portal
- Firm can approve/reject tasks requiring verification
- Help request queue exists + AI triage suggestions
- Reminder scheduler sends reminders and logs them
- Documents module works for client docs + OCR extraction
- AI reminder draft works from client detail page
- Audit log records key actions

### Solo MVP Done When:
- Solo user sees SI normiran pack assigned automatically
- Solo user can upload invoices/receipts and search them
- Solo user can ask AI “What do I do next?” and get relevant answer
- Annual reminders exist as tasks or scheduled reminders

---

## 18) Release Plan (Suggested)

### v2.0.0 (Core)
- Clients + Templates + Tasks + Portal
- Documents module + manual fields
- Reminder scheduler (non-AI)
- AI reminder draft
- AI help triage
- AI chat (tool usage + task explain)
- OCR extraction (basic)

### v2.0.1
- Better template builder UX
- Bulk document upload
- Improved audit timeline UI

---

## 19) Open Questions (Resolve in Implementation Without Blocking)
- Do Solo users use a pseudo-client record (“My Business”) or separate solo tables?  
  **Recommendation:** pseudo-client for reuse of UI & logic.
- Email provider integration details (Resend etc.)  
  **Recommendation:** continue using current provider; ensure deliverability and logging.
- OCR provider choice  
  **Recommendation:** start with a single OCR API; keep interface modular.

---

## 20) Appendix — System Template Examples (SI)

### Example Task (SI) — eDavki Authorization
- **Title:** “Uredi pooblastilo v eDavki za računovodstvo”
- **Why this matters:** “Brez pooblastila ne moremo oddajati obrazcev in pregledovati vaših davčnih obveznosti.”
- **Steps:**
  1. Prijavi se v eDavki
  2. Pojdi na Pooblastila
  3. Dodaj novo pooblastilo za naš računovodski servis
  4. Izberi ustrezne pravice (DDV, dohodnina, REK obrazci)
  5. Shrani in potrdi
- **Proof:** Screenshot upload
- **Verification:** Required

### Example Task (SI) — Upload Bank Statements
- **Title:** “Naloži bančne izpiske za zadnje 3 mesece”
- **Why this matters:** “Izpiski so osnova za knjiženje in usklajevanje transakcij.”
- **Proof:** PDF upload
- **Verification:** Optional

---

## 21) Implementation Notes (Guidance for AI Coding Agent)
- Prefer reusable components for Firm vs Solo.
- Keep templates “snapshot” into client tasks so future template changes don’t break existing clients.
- Make AI features fail-safe (feature toggles + graceful fallback).
- Do not block core flows if AI/OCR is unavailable.
- Log everything important in audit.

---
**End of PRD**
