import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { calculateProgress } from '@/lib/utils';
import ClientsList from '@/components/ClientsList';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all clients with their checklists and task instances
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      client_checklists (
        id,
        type,
        client_task_instances (
          id,
          status,
          updated_at,
          task:tasks (
            is_blocking
          )
        )
      ),
      client_contacts (
        id,
        email,
        is_primary
      )
    `)
    .eq('owner_user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  const clientsWithMetrics = (clients || []).map((client) => {
    const onboardingChecklist = client.client_checklists.find((c: any) => c.type === 'onboarding');
    const tasks = onboardingChecklist?.client_task_instances.map((ti: any) => ({
      status: ti.status,
      is_blocking: ti.task?.is_blocking || false,
    })) || [];

    const progress = calculateProgress(tasks);
    const lastActivity = onboardingChecklist?.client_task_instances
      .map((ti: any) => new Date(ti.updated_at).getTime())
      .sort()
      .reverse()[0];

    return {
      ...client,
      progress,
      lastActivity: lastActivity ? new Date(lastActivity) : null,
    };
  });

  // Sort by most blocked
  const sortedClients = clientsWithMetrics.sort((a, b) => b.progress.blocked - a.progress.blocked);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage access onboarding and recurring checks</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary">
          + New Client
        </Link>
      </div>

      <ClientsList clients={sortedClients} />
    </div>
  );
}
