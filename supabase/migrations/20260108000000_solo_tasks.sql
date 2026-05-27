-- Solo tasks table for individual bookkeepers (v2.0 solo mode)
create table if not exists public.solo_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.solo_tasks enable row level security;

create policy "Users manage own tasks"
  on public.solo_tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_solo_tasks_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists solo_tasks_updated_at on public.solo_tasks;
create trigger solo_tasks_updated_at
  before update on public.solo_tasks
  for each row execute function public.update_solo_tasks_updated_at();

-- Index for fast user queries
create index if not exists solo_tasks_user_id_idx on public.solo_tasks(user_id);
create index if not exists solo_tasks_status_idx on public.solo_tasks(user_id, status);
