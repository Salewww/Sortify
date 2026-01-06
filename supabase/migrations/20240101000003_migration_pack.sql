-- Migration Pack: For clients transitioning from another accountant
-- This pack includes tasks for gathering historical data and access from previous bookkeeper

-- Insert Migration Pack
INSERT INTO packs (id, name, description, owner_user_id)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Migration from Previous Accountant',
  'Complete checklist for transitioning clients from another bookkeeper or accountant, including data transfer and access handoff.',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Migration Tasks
-- 1. Obtain final reports from previous accountant
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  (SELECT id FROM platforms WHERE key = 'general'),
  'Obtain final financial reports from previous accountant',
  'We need all historical financial reports to ensure continuity and compliance.',
  E'1. Contact your previous accountant\n2. Request the following:\n   - Profit & Loss statements (last 2 years)\n   - Balance sheets (last 2 years)\n   - Tax returns (last 2 years)\n   - General ledger export\n3. Save all documents\n4. Upload to this portal',
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Get QuickBooks access or backup
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000002',
  (SELECT id FROM platforms WHERE key = 'quickbooks'),
  'Transfer QuickBooks Online access or obtain company backup',
  'We need full access to your QuickBooks to continue seamless bookkeeping.',
  E'**If using QuickBooks Online:**\n1. Ask previous accountant to invite us as Accountant user\n2. Our email: [your accounting firm email]\n\n**If using QuickBooks Desktop:**\n1. Request a backup file (.qbb or .qbw)\n2. Ensure it includes all company data through last month-end\n3. Upload the backup file here',
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Transfer bank account access
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000003',
  (SELECT id FROM platforms WHERE key = 'bank'),
  'Provide read-only bank account access',
  'Bank feeds are essential for accurate and timely bookkeeping.',
  E'1. Log into your business bank account\n2. Add us as a read-only user if possible\n3. Or provide us with:\n   - Last 3 months of bank statements (PDF)\n   - Access credentials for automatic feeds\n4. Ensure previous accountant\'s access is removed',
  true
) ON CONFLICT (id) DO NOTHING;

-- 4. Credit card access
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000004',
  (SELECT id FROM platforms WHERE key = 'bank'),
  'Provide credit card statements and access',
  'Credit card transactions need to be categorized and reconciled monthly.',
  E'1. Gather last 3 months of business credit card statements\n2. Provide read-only access to credit card portal\n3. Or upload statements as PDFs\n4. Remove previous accountant\'s access',
  true
) ON CONFLICT (id) DO NOTHING;

-- 5. Payroll system handoff
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000005',
  (SELECT id FROM platforms WHERE key = 'gusto'),
  'Transfer payroll system access',
  'Seamless payroll processing requires immediate access to your payroll provider.',
  E'**If using Gusto:**\n1. Add us as Admin user\n2. Our email: [your email]\n3. Remove previous accountant\'s access\n\n**If using other payroll provider:**\n1. Provide admin login credentials\n2. Or add us as authorized user\n3. Confirm previous accountant has been removed',
  false
) ON CONFLICT (id) DO NOTHING;

-- 6. Sales platform access (Stripe/PayPal/etc)
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000006',
  (SELECT id FROM platforms WHERE key = 'stripe'),
  'Provide payment processor access',
  'We need to reconcile all payment platform transactions with your books.',
  E'**If using Stripe:**\n1. Go to Settings → Team members\n2. Add us as Admin or Developer\n3. Our email: [your email]\n\n**If using PayPal or other platforms:**\n1. Provide administrator access\n2. Or export last 3 months of transaction data\n3. Remove previous accountant\'s access',
  false
) ON CONFLICT (id) DO NOTHING;

-- 7. Outstanding receivables list
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000007',
  (SELECT id FROM platforms WHERE key = 'general'),
  'Provide current Accounts Receivable aging report',
  'We need to know all outstanding customer invoices to properly manage cash flow.',
  E'1. Request AR Aging Report from previous accountant\n2. Report should show:\n   - All unpaid customer invoices\n   - Invoice amounts and dates\n   - Age buckets (0-30, 31-60, 61-90, 90+ days)\n3. Upload the report here',
  false
) ON CONFLICT (id) DO NOTHING;

-- 8. Outstanding payables list
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000008',
  (SELECT id FROM platforms WHERE key = 'general'),
  'Provide current Accounts Payable aging report',
  'We need to know all outstanding vendor bills to manage your payment obligations.',
  E'1. Request AP Aging Report from previous accountant\n2. Report should show:\n   - All unpaid vendor bills\n   - Bill amounts and due dates\n   - Vendor names and payment terms\n3. Upload the report here',
  false
) ON CONFLICT (id) DO NOTHING;

-- 9. Chart of accounts documentation
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000009',
  (SELECT id FROM platforms WHERE key = 'quickbooks'),
  'Provide Chart of Accounts and any special categorization notes',
  'Understanding your custom account structure helps us maintain consistency.',
  E'1. Request Chart of Accounts export from previous accountant\n2. Ask for notes on:\n   - Custom account purposes\n   - Special categorization rules\n   - Any class or location tracking used\n3. Upload all documentation',
  false
) ON CONFLICT (id) DO NOTHING;

-- 10. Tax credentials and deadlines
INSERT INTO tasks (id, platform_id, title, why_text, instructions_md, is_blocking)
VALUES (
  'e0000000-0000-0000-0000-000000000010',
  (SELECT id FROM platforms WHERE key = 'general'),
  'Provide tax filing credentials and upcoming deadlines',
  'We need access to tax portals and awareness of all filing obligations.',
  E'1. Provide login credentials for:\n   - IRS (EFTPS, e-services)\n   - State tax portal\n   - Local tax accounts\n2. List upcoming filing deadlines:\n   - Payroll tax deposits\n   - Sales tax filings\n   - Estimated tax payments\n   - Annual returns\n3. Include tax ID numbers (EIN, state tax ID)',
  true
) ON CONFLICT (id) DO NOTHING;

-- Add tasks to the Migration Pack
INSERT INTO pack_tasks (pack_id, task_id, sort_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 1),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 2),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 3),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 4),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 5),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 6),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 7),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 8),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000009', 9),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000010', 10)
ON CONFLICT (pack_id, task_id) DO NOTHING;
