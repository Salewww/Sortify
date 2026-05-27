import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { calculateProgress } from '@/lib/utils';
import ClientsList from '@/components/ClientsList';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

export default async function DashboardPage() {
  const supabase = await createClient();
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // For v2.0, check if user has Firm account type
  if (isV2) {
    const { data: userData } = await supabase
      .from('users')
      .select('account_type')
      .eq('id', user.id)
      .single();

    // Only allow Firm accounts to access this page
    if (userData?.account_type !== 'firm') {
      redirect('/dashboard/documents');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isV2 ? 'Stranke' : 'Clients'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isV2 ? 'Upravljajte z dostopom, vnosom in rednimi pregledi' : 'Manage access onboarding and recurring checks'}
          </p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary">
          + {isV2 ? 'Nova stranka' : 'New Client'}
        </Link>
      </div>

      <ClientsList clients={sortedClients} />
    </div>
  );
}
