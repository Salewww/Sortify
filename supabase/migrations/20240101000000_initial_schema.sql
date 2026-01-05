-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  portal_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_owner ON public.clients(owner_user_id);
CREATE INDEX idx_clients_portal_token ON public.clients(portal_token);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = owner_user_id);

-- Client contacts table
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_contacts_client ON public.client_contacts(client_id);

ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage contacts for own clients" ON public.client_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_contacts.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

-- Platforms table
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read platforms
CREATE POLICY "Authenticated users can view platforms" ON public.platforms
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  why_text TEXT NOT NULL,
  instructions_md TEXT NOT NULL,
  is_blocking BOOLEAN NOT NULL DEFAULT TRUE,
  help_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_platform ON public.tasks(platform_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Packs table
CREATE TABLE IF NOT EXISTS public.packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_packs_owner ON public.packs(owner_user_id);

ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Users can see system packs (owner_user_id IS NULL) and their own packs
CREATE POLICY "Users can view available packs" ON public.packs
  FOR SELECT USING (owner_user_id IS NULL OR owner_user_id = auth.uid());

CREATE POLICY "Users can create own packs" ON public.packs
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own packs" ON public.packs
  FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own packs" ON public.packs
  FOR DELETE USING (auth.uid() = owner_user_id);

-- Pack tasks junction table
CREATE TABLE IF NOT EXISTS public.pack_tasks (
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (pack_id, task_id)
);

CREATE INDEX idx_pack_tasks_pack ON public.pack_tasks(pack_id);
CREATE INDEX idx_pack_tasks_task ON public.pack_tasks(task_id);

ALTER TABLE public.pack_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pack tasks" ON public.pack_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packs
      WHERE packs.id = pack_tasks.pack_id
      AND (packs.owner_user_id IS NULL OR packs.owner_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own pack tasks" ON public.pack_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packs
      WHERE packs.id = pack_tasks.pack_id
      AND packs.owner_user_id = auth.uid()
    )
  );

-- Client checklists table
CREATE TABLE IF NOT EXISTS public.client_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('onboarding', 'recurring_check')),
  run_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_checklists_client ON public.client_checklists(client_id);

ALTER TABLE public.client_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checklists for own clients" ON public.client_checklists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_checklists.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

-- Allow portal access via token (handled in application layer)
CREATE POLICY "Portal can view checklists via token" ON public.client_checklists
  FOR SELECT USING (true);

-- Client task instances table
CREATE TABLE IF NOT EXISTS public.client_task_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES public.client_checklists(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'needs_help')),
  completed_at TIMESTAMPTZ,
  completed_by_email TEXT,
  proof_file_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_task_instances_checklist ON public.client_task_instances(checklist_id);
CREATE INDEX idx_client_task_instances_status ON public.client_task_instances(status);

ALTER TABLE public.client_task_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage task instances for own clients" ON public.client_task_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_checklists
      JOIN public.clients ON clients.id = client_checklists.client_id
      WHERE client_checklists.id = client_task_instances.checklist_id
      AND clients.owner_user_id = auth.uid()
    )
  );

-- Allow portal access (handled in application layer)
CREATE POLICY "Portal can update task instances" ON public.client_task_instances
  FOR UPDATE USING (true);

CREATE POLICY "Portal can view task instances" ON public.client_task_instances
  FOR SELECT USING (true);

-- Reminder settings table
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  cadence_json JSONB NOT NULL DEFAULT '{"day0": true, "day2": true, "day5": true, "day9": true}'::jsonb,
  escalate_to_secondary BOOLEAN NOT NULL DEFAULT FALSE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminder_settings_client ON public.reminder_settings(client_id);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reminder settings for own clients" ON public.reminder_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = reminder_settings.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

-- Reminder events table
CREATE TABLE IF NOT EXISTS public.reminder_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sent_to TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invite', 'auto', 'manual')),
  payload_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminder_events_client ON public.reminder_events(client_id);
CREATE INDEX idx_reminder_events_sent_at ON public.reminder_events(sent_at);

ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminder events for own clients" ON public.reminder_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = reminder_events.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "System can create reminder events" ON public.reminder_events
  FOR INSERT WITH CHECK (true);

-- Audit events table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_identifier TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_client ON public.audit_events(client_id);
CREATE INDEX idx_audit_events_created_at ON public.audit_events(created_at);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit events for own clients" ON public.audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = audit_events.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "System can create audit events" ON public.audit_events
  FOR INSERT WITH CHECK (true);

-- Recurring check schedules table
CREATE TABLE IF NOT EXISTS public.recurring_check_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly')),
  next_run_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_check_schedules_client ON public.recurring_check_schedules(client_id);
CREATE INDEX idx_recurring_check_schedules_next_run ON public.recurring_check_schedules(next_run_date) WHERE is_active = TRUE;

ALTER TABLE public.recurring_check_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recurring check schedules for own clients" ON public.recurring_check_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = recurring_check_schedules.client_id
      AND clients.owner_user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_check_schedules_updated_at BEFORE UPDATE ON public.recurring_check_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_task_instances_updated_at BEFORE UPDATE ON public.client_task_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
