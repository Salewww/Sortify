-- Seed Platforms
INSERT INTO public.platforms (id, key, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'quickbooks', 'QuickBooks Online'),
  ('22222222-2222-2222-2222-222222222222', 'xero', 'Xero'),
  ('33333333-3333-3333-3333-333333333333', 'stripe', 'Stripe'),
  ('44444444-4444-4444-4444-444444444444', 'paypal', 'PayPal'),
  ('55555555-5555-5555-5555-555555555555', 'shopify', 'Shopify'),
  ('66666666-6666-6666-6666-666666666666', 'bank', 'Bank Account'),
  ('77777777-7777-7777-7777-777777777777', 'gusto', 'Gusto Payroll'),
  ('88888888-8888-8888-8888-888888888888', 'square', 'Square'),
  ('99999999-9999-9999-9999-999999999999', 'bill_com', 'Bill.com'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'expensify', 'Expensify')
ON CONFLICT (id) DO NOTHING;

-- Seed Tasks
-- QuickBooks Online Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Invite us to QuickBooks Online as Accountant',
    'We need full access to your books to provide accurate bookkeeping services.',
    E'1. Log in to QuickBooks Online\n2. Go to **Settings** (gear icon) → **Manage Users**\n3. Click **Invite Accountant**\n4. Enter our email: accounting@yourfirm.com\n5. Click **Send Invitation**',
    true,
    'https://quickbooks.intuit.com/learn-support/en-us/help-article/user-management/add-accountant-user-quickbooks-online/L7OEIP7Vp_US_en_US'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Connect your bank account to QuickBooks',
    'Automatic bank feeds save time and ensure we have up-to-date transaction data.',
    E'1. In QuickBooks, go to **Banking** → **Link account**\n2. Search for your bank name\n3. Enter your online banking credentials\n4. Select the account(s) to connect\n5. Click **Connect**',
    true,
    null
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Provide last 3 months of bank statements (PDF)',
    'We need historical data to reconcile and catch up on your books.',
    E'1. Log in to your online banking\n2. Navigate to **Statements** or **Documents**\n3. Download the last 3 months as PDF\n4. Upload them here using the button below',
    true,
    null
  );

-- Xero Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222',
    'Add us as an Advisor in Xero',
    'Advisor access lets us manage your books and run reports without needing your login.',
    E'1. Log in to Xero\n2. Go to **Settings** → **Users**\n3. Click **Invite a user**\n4. Select **Advisor** as the role\n5. Enter our email: accounting@yourfirm.com\n6. Click **Send invitation**',
    true,
    'https://central.xero.com/s/article/Add-an-advisor-to-your-Xero-organisation'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'Connect bank feeds in Xero',
    'Bank feeds automate transaction imports and reduce manual entry.',
    E'1. In Xero, go to **Accounting** → **Bank accounts**\n2. Click **Add bank account**\n3. Search and select your bank\n4. Follow prompts to authorize the connection\n5. Confirm the account details',
    true,
    null
  );

-- Stripe Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000006',
    '33333333-3333-3333-3333-333333333333',
    'Add us as a Team Member in Stripe',
    'We need access to your payment data to reconcile revenue and fees.',
    E'1. Log in to Stripe Dashboard\n2. Go to **Settings** → **Team and security**\n3. Click **Invite team member**\n4. Enter our email: accounting@yourfirm.com\n5. Set permissions to **Analyst** or **Developer**\n6. Click **Send invite**',
    true,
    'https://stripe.com/docs/dashboard/access/invite-team-members'
  );

-- PayPal Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000007',
    '44444444-4444-4444-4444-444444444444',
    'Provide PayPal transaction reports',
    'We need your PayPal sales and fees data to properly record revenue.',
    E'1. Log in to PayPal Business account\n2. Go to **Reports** → **Statements**\n3. Select the date range (last 3 months)\n4. Download as **CSV**\n5. Upload the file here',
    true,
    null
  );

-- Shopify Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000008',
    '55555555-5555-5555-5555-555555555555',
    'Grant Staff Account access to Shopify store',
    'We need access to orders, payouts, and inventory to maintain accurate records.',
    E'1. Log in to Shopify Admin\n2. Go to **Settings** → **Users and permissions**\n3. Click **Add staff**\n4. Enter our email: accounting@yourfirm.com\n5. Select permissions: **Orders, Products, Reports**\n6. Click **Send invite**',
    true,
    'https://help.shopify.com/en/manual/your-account/staff-accounts'
  );

-- Bank Account Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-000000000009',
    '66666666-6666-6666-6666-666666666666',
    'Provide online banking login (read-only if available)',
    'View-only access helps us monitor transactions and reconcile accounts efficiently.',
    E'1. Check with your bank if they offer read-only access\n2. Create a view-only user if available\n3. Share credentials via secure method (we''ll send a link)\n4. Or upload monthly statements as PDF instead',
    false,
    null
  ),
  (
    'a0000000-0000-0000-0000-00000000000a',
    '66666666-6666-6666-6666-666666666666',
    'Upload last 3 months of bank statements',
    'Bank statements are essential for reconciling your accounts and ensuring accuracy.',
    E'1. Log in to your online banking\n2. Go to **Statements** section\n3. Download the last 3 months as PDF\n4. Upload each file using the button below',
    true,
    null
  );

-- Gusto Payroll Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-00000000000b',
    '77777777-7777-7777-7777-777777777777',
    'Add us as an Admin in Gusto',
    'We need access to payroll reports and tax filings to record payroll expenses accurately.',
    E'1. Log in to Gusto\n2. Go to **Settings** → **Admins**\n3. Click **Add an admin**\n4. Enter our email: accounting@yourfirm.com\n5. Select appropriate permissions\n6. Click **Send invitation**',
    false,
    'https://support.gusto.com/article/100895878100000/Add-or-edit-an-account-admin'
  );

-- Square Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-00000000000c',
    '88888888-8888-8888-8888-888888888888',
    'Invite us as a Team Member in Square',
    'We need access to sales data and settlement reports for accurate bookkeeping.',
    E'1. Log in to Square Dashboard\n2. Go to **Staff** → **Team**\n3. Click **Create a team member**\n4. Enter our email: accounting@yourfirm.com\n5. Set permission level to **Full access** or custom\n6. Click **Save**',
    false,
    null
  );

-- Bill.com Tasks
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, help_url) VALUES
  (
    'a0000000-0000-0000-0000-00000000000d',
    '99999999-9999-9999-9999-999999999999',
    'Add us as a User in Bill.com',
    'We need to track and approve bills on your behalf to maintain cash flow visibility.',
    E'1. Log in to Bill.com\n2. Go to **Settings** → **Users**\n3. Click **Add User**\n4. Enter our email: accounting@yourfirm.com\n5. Set role to **Accountant** or **Approver**\n6. Click **Send invite**',
    false,
    null
  );

-- Create System Packs
INSERT INTO public.packs (id, owner_user_id, name, description) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    null,
    'Basic Bookkeeping (QBO + Bank)',
    'Essential access for monthly bookkeeping with QuickBooks Online and bank statements.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    null,
    'E-commerce Bookkeeping (Shopify + Stripe + QBO)',
    'Complete access setup for online stores using Shopify and Stripe payments.'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    null,
    'Basic Bookkeeping (Xero + Bank)',
    'Essential access for monthly bookkeeping with Xero and bank statements.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    null,
    'Full-Service Bookkeeping',
    'Comprehensive access including payroll, bills, and all payment platforms.'
  )
ON CONFLICT (id) DO NOTHING;

-- Pack Tasks Associations

-- Pack: Basic Bookkeeping (QBO + Bank)
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 2),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 3),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 4)
ON CONFLICT DO NOTHING;

-- Pack: E-commerce
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 2),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 3),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 4),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-00000000000a', 5)
ON CONFLICT DO NOTHING;

-- Pack: Xero Basic
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-00000000000a', 3)
ON CONFLICT DO NOTHING;

-- Pack: Full-Service
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 2),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000a', 3),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000006', 4),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000b', 5),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000d', 6)
ON CONFLICT DO NOTHING;
