-- Sortify v2.0 Schema Extensions (Slovenia-only)
-- This migration adds v2-specific tables and columns without breaking v1.0

-- ============================================
-- FIRMS TABLE (New for v2.0) - CREATE FIRST WITHOUT POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  default_language TEXT NOT NULL DEFAULT 'sl',
  reminder_cadence_days INTEGER[] DEFAULT ARRAY[0, 2, 5, 9],
  ai_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_triage_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ocr_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  settings_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_firms_created ON public.firms(created_at);

ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EXTEND USERS TABLE (v2.0 additions) - ADD COLUMNS BEFORE FIRM POLICIES
-- ============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS firm_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add foreign key constraint after column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_firm_id_fkey'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_firm_id_fkey
      FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add check constraint after column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_account_type_check'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_account_type_check
      CHECK (account_type IN ('firm', 'solo'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_firm ON public.users(firm_id);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);

-- ============================================
-- FIRMS RLS POLICIES (After users.firm_id exists)
-- ============================================
DROP POLICY IF EXISTS "Firm members can view their firm" ON public.firms;
CREATE POLICY "Firm members can view their firm" ON public.firms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.firm_id = firms.id
    )
  );

DROP POLICY IF EXISTS "Firm owners can update their firm" ON public.firms;
CREATE POLICY "Firm owners can update their firm" ON public.firms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.firm_id = firms.id
    )
  );

-- ============================================
-- EXTEND CLIENTS TABLE (v2.0 additions)
-- ============================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- Add check constraint for business_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'clients_business_type_check'
  ) THEN
    ALTER TABLE public.clients ADD CONSTRAINT clients_business_type_check
      CHECK (business_type IN ('normiran_sp', 'sp', 'doo', 'other'));
  END IF;
END $$;

-- ============================================
-- SLOVENIA PLATFORMS (v2.0)
-- ============================================
INSERT INTO public.platforms (id, key, name) VALUES
  ('eda00000-0000-0000-0000-000000000000', 'edavki', 'eDavki'),
  ('ajp00000-0000-0000-0000-000000000000', 'ajpes', 'AJPES'),
  ('ban00000-0000-0000-0000-000000000000', 'bank_si', 'Slovenska Banka'),
  ('fur00000-0000-0000-0000-000000000000', 'furs', 'FURS')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEMPLATE PACKS (Extend from packs) - ADD COLUMNS FIRST
-- ============================================
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS business_types TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_packs_country ON public.packs(country_code);
CREATE INDEX IF NOT EXISTS idx_packs_system ON public.packs(is_system);

-- ============================================
-- TEMPLATE TASKS (Extend from tasks)
-- ============================================
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS proof_type TEXT DEFAULT 'none';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS platform_tag TEXT;

-- Add check constraint for proof_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_proof_type_check'
  ) THEN
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_proof_type_check
      CHECK (proof_type IN ('none', 'upload', 'screenshot', 'link', 'note'));
  END IF;
END $$;

-- ============================================
-- CLIENT TASK INSTANCES (v2.0 extensions)
-- ============================================
-- Drop existing constraint first, then add new one
ALTER TABLE public.client_task_instances DROP CONSTRAINT IF EXISTS client_task_instances_status_check;
ALTER TABLE public.client_task_instances ADD CONSTRAINT client_task_instances_status_check
  CHECK (status IN ('pending', 'in_progress', 'needs_help', 'submitted', 'needs_verification', 'completed', 'blocked', 'rejected', 'done'));

ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS blocker_reason TEXT;
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS assignee_type TEXT DEFAULT 'client';
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS solo_user_id UUID;

-- Add foreign key for solo_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'client_task_instances_solo_user_id_fkey'
  ) THEN
    ALTER TABLE public.client_task_instances ADD CONSTRAINT client_task_instances_solo_user_id_fkey
      FOREIGN KEY (solo_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraint for assignee_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'client_task_instances_assignee_type_check'
  ) THEN
    ALTER TABLE public.client_task_instances ADD CONSTRAINT client_task_instances_assignee_type_check
      CHECK (assignee_type IN ('client', 'firm', 'system'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_client_task_instances_solo_user ON public.client_task_instances(solo_user_id);
CREATE INDEX IF NOT EXISTS idx_client_task_instances_due_date ON public.client_task_instances(due_date);

-- ============================================
-- DOCUMENTS TABLE (New for v2.0)
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type TEXT NOT NULL,
  owner_id UUID NOT NULL,
  firm_id UUID,
  type TEXT NOT NULL,
  vendor_name TEXT,
  document_number TEXT,
  issue_date DATE,
  due_date DATE,
  amount_gross DECIMAL(12, 2),
  currency TEXT DEFAULT 'EUR',
  vat_amount DECIMAL(12, 2),
  vat_rate DECIMAL(5, 2),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  linked_task_id UUID,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  ocr_status TEXT DEFAULT 'not_run',
  ocr_data_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints after table creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_owner_type_check'
  ) THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_owner_type_check
      CHECK (owner_type IN ('solo_user', 'firm_client'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_type_check'
  ) THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_type_check
      CHECK (type IN ('issued_invoice', 'received_invoice', 'receipt', 'bank_statement', 'other'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_ocr_status_check'
  ) THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_ocr_status_check
      CHECK (ocr_status IN ('not_run', 'running', 'success', 'failed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_firm_id_fkey'
  ) THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_firm_id_fkey
      FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_linked_task_id_fkey'
  ) THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_linked_task_id_fkey
      FOREIGN KEY (linked_task_id) REFERENCES public.client_task_instances(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_firm ON public.documents(firm_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_issue_date ON public.documents(issue_date);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo users can manage own documents" ON public.documents;
CREATE POLICY "Solo users can manage own documents" ON public.documents
  FOR ALL USING (
    owner_type = 'solo_user' AND owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Firm users can manage client documents" ON public.documents;
CREATE POLICY "Firm users can manage client documents" ON public.documents
  FOR ALL USING (
    firm_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.firm_id = documents.firm_id
    )
  );

-- ============================================
-- HELP REQUESTS TABLE (New for v2.0)
-- ============================================
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_task_id UUID NOT NULL,
  client_message TEXT,
  ai_suggestion_json JSONB DEFAULT '{}'::jsonb,
  firm_response TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID
);

-- Add constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'help_requests_client_task_id_fkey'
  ) THEN
    ALTER TABLE public.help_requests ADD CONSTRAINT help_requests_client_task_id_fkey
      FOREIGN KEY (client_task_id) REFERENCES public.client_task_instances(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'help_requests_resolved_by_user_id_fkey'
  ) THEN
    ALTER TABLE public.help_requests ADD CONSTRAINT help_requests_resolved_by_user_id_fkey
      FOREIGN KEY (resolved_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'help_requests_status_check'
  ) THEN
    ALTER TABLE public.help_requests ADD CONSTRAINT help_requests_status_check
      CHECK (status IN ('open', 'in_progress', 'resolved'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_help_requests_task ON public.help_requests(client_task_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON public.help_requests(created_at);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Firm users can manage help requests" ON public.help_requests;
CREATE POLICY "Firm users can manage help requests" ON public.help_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_task_instances cti
      JOIN public.client_checklists cc ON cc.id = cti.checklist_id
      JOIN public.clients c ON c.id = cc.client_id
      JOIN public.users u ON u.id = c.owner_user_id
      WHERE cti.id = help_requests.client_task_id
      AND u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Portal can create help requests" ON public.help_requests;
CREATE POLICY "Portal can create help requests" ON public.help_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Portal can view help requests" ON public.help_requests;
CREATE POLICY "Portal can view help requests" ON public.help_requests
  FOR SELECT USING (true);

-- ============================================
-- AI LOGS TABLE (New for v2.0)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID,
  user_id UUID,
  operation_type TEXT NOT NULL,
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  model TEXT,
  tokens_used INTEGER,
  cost_cents INTEGER,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ai_logs_firm_id_fkey'
  ) THEN
    ALTER TABLE public.ai_logs ADD CONSTRAINT ai_logs_firm_id_fkey
      FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ai_logs_user_id_fkey'
  ) THEN
    ALTER TABLE public.ai_logs ADD CONSTRAINT ai_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ai_logs_operation_type_check'
  ) THEN
    ALTER TABLE public.ai_logs ADD CONSTRAINT ai_logs_operation_type_check
      CHECK (operation_type IN ('reminder_composer', 'help_triage', 'ocr_extract', 'chat_message'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ai_logs_status_check'
  ) THEN
    ALTER TABLE public.ai_logs ADD CONSTRAINT ai_logs_status_check
      CHECK (status IN ('success', 'error', 'timeout'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_logs_firm ON public.ai_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_operation ON public.ai_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_logs(created_at);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Firm users can view AI logs" ON public.ai_logs;
CREATE POLICY "Firm users can view AI logs" ON public.ai_logs
  FOR SELECT USING (
    firm_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.firm_id = ai_logs.firm_id
    )
  );

DROP POLICY IF EXISTS "System can create AI logs" ON public.ai_logs;
CREATE POLICY "System can create AI logs" ON public.ai_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- EXTEND REMINDER EVENTS (v2.0 additions)
-- ============================================
ALTER TABLE public.reminder_events ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.reminder_events ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.reminder_events ADD COLUMN IF NOT EXISTS body_text TEXT;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_firms_updated_at ON public.firms;
CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON public.firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
