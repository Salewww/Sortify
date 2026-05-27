-- Fix help_requests table to support standalone support tickets
-- The v2.0 schema has help_requests tied to client tasks, but the UI expects standalone tickets

-- Drop the existing help_requests table and recreate with proper structure
DROP TABLE IF EXISTS public.help_requests CASCADE;

CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  ai_triaged BOOLEAN DEFAULT FALSE,
  ai_suggested_solution TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own help requests
CREATE POLICY "Users can view own help requests"
  ON public.help_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own help requests
CREATE POLICY "Users can create help requests"
  ON public.help_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own help requests
CREATE POLICY "Users can update own help requests"
  ON public.help_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON public.help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON public.help_requests(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
