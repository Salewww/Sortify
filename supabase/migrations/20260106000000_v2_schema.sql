-- Sortify v2.0 Schema Extensions (Slovenia-only)
-- This migration adds v2-specific tables and columns without breaking v1.0

-- ============================================
-- FIRMS TABLE (New for v2.0)
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

CREATE INDEX idx_firms_created ON public.firms(created_at);

ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;

-- Firm owners can manage their firm
CREATE POLICY "Firm members can view their firm" ON public.firms
  FOR SELECT USING (
    id IN (
      SELECT firm_id FROM public.users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Firm owners can update their firm" ON public.firms
  FOR UPDATE USING (
    id IN (
      SELECT firm_id FROM public.users WHERE users.id = auth.uid()
    )
  );

-- ============================================
-- EXTEND USERS TABLE (v2.0 additions)
-- ============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('firm', 'solo'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES public.firms(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_firm ON public.users(firm_id);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);

-- ============================================
-- EXTEND CLIENTS TABLE (v2.0 additions)
-- ============================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('normiran_sp', 'sp', 'doo', 'other'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- ============================================
-- SLOVENIA PLATFORMS (v2.0)
-- ============================================
INSERT INTO public.platforms (id, key, name) VALUES
  ('edavki00-0000-0000-0000-000000000000', 'edavki', 'eDavki'),
  ('ajpes000-0000-0000-0000-000000000000', 'ajpes', 'AJPES'),
  ('banksi00-0000-0000-0000-000000000000', 'bank_si', 'Slovenska Banka'),
  ('furs0000-0000-0000-0000-000000000000', 'furs', 'FURS')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEMPLATE PACKS (Extend from packs)
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
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS proof_type TEXT CHECK (proof_type IN ('none', 'upload', 'screenshot', 'link', 'note')) DEFAULT 'none';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS platform_tag TEXT;

-- ============================================
-- CLIENT TASK INSTANCES (v2.0 extensions)
-- ============================================
-- Expand status enum to support verification workflow
ALTER TABLE public.client_task_instances DROP CONSTRAINT IF EXISTS client_task_instances_status_check;
ALTER TABLE public.client_task_instances ADD CONSTRAINT client_task_instances_status_check
  CHECK (status IN ('pending', 'in_progress', 'needs_help', 'submitted', 'needs_verification', 'completed', 'blocked', 'rejected', 'done'));

ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS blocker_reason TEXT;
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS assignee_type TEXT CHECK (assignee_type IN ('client', 'firm', 'system')) DEFAULT 'client';
ALTER TABLE public.client_task_instances ADD COLUMN IF NOT EXISTS solo_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_client_task_instances_solo_user ON public.client_task_instances(solo_user_id);
CREATE INDEX IF NOT EXISTS idx_client_task_instances_due_date ON public.client_task_instances(due_date);

-- ============================================
-- DOCUMENTS TABLE (New for v2.0)
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('solo_user', 'firm_client')),
  owner_id UUID NOT NULL, -- references users.id OR clients.id
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('issued_invoice', 'received_invoice', 'receipt', 'bank_statement', 'other')),
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
  linked_task_id UUID REFERENCES public.client_task_instances(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  ocr_status TEXT CHECK (ocr_status IN ('not_run', 'running', 'success', 'failed')) DEFAULT 'not_run',
  ocr_data_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_owner ON public.documents(owner_type, owner_id);
CREATE INDEX idx_documents_firm ON public.documents(firm_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_issue_date ON public.documents(issue_date);
CREATE INDEX idx_documents_created_at ON public.documents(created_at);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Solo users can manage their own documents
CREATE POLICY "Solo users can manage own documents" ON public.documents
  FOR ALL USING (
    owner_type = 'solo_user' AND owner_id = auth.uid()
  );

-- Firm users can manage documents for their clients
CREATE POLICY "Firm users can manage client documents" ON public.documents
  FOR ALL USING (
    EXISTS (
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
  client_task_id UUID NOT NULL REFERENCES public.client_task_instances(id) ON DELETE CASCADE,
  client_message TEXT,
  ai_suggestion_json JSONB DEFAULT '{}'::jsonb,
  firm_response TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_help_requests_task ON public.help_requests(client_task_id);
CREATE INDEX idx_help_requests_status ON public.help_requests(status);
CREATE INDEX idx_help_requests_created_at ON public.help_requests(created_at);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Firm users can manage help requests for their clients
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

-- Portal can view/create help requests (application layer handles this)
CREATE POLICY "Portal can create help requests" ON public.help_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Portal can view help requests" ON public.help_requests
  FOR SELECT USING (true);

-- ============================================
-- AI LOGS TABLE (New for v2.0)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('reminder_composer', 'help_triage', 'ocr_extract', 'chat_message')),
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  model TEXT,
  tokens_used INTEGER,
  cost_cents INTEGER,
  duration_ms INTEGER,
  status TEXT CHECK (status IN ('success', 'error', 'timeout')) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_firm ON public.ai_logs(firm_id);
CREATE INDEX idx_ai_logs_user ON public.ai_logs(user_id);
CREATE INDEX idx_ai_logs_operation ON public.ai_logs(operation_type);
CREATE INDEX idx_ai_logs_created_at ON public.ai_logs(created_at);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Firm users can view their AI logs
CREATE POLICY "Firm users can view AI logs" ON public.ai_logs
  FOR SELECT USING (
    firm_id IN (
      SELECT firm_id FROM public.users WHERE users.id = auth.uid()
    )
  );

-- System can create AI logs
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
CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON public.firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (v2.0)
-- ============================================
-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents-v2', 'documents-v2', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents-v2 bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents-v2');

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents-v2');

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents-v2');
