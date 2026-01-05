import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate, calculateProgress } from '@/lib/utils';

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

      {/* Quick Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
            All ({sortedClients.length})
          </button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm">
            Blocked ({sortedClients.filter(c => c.progress.blocked > 0).length})
          </button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm">
            Needs Help ({sortedClients.filter(c => c.progress.needsHelp > 0).length})
          </button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm">
            Completed ({sortedClients.filter(c => c.progress.percentage === 100).length})
          </button>
        </div>
      </div>

      {/* Clients List */}
      {sortedClients.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600 mb-6">Create your first client to start tracking access onboarding</p>
          <Link href="/dashboard/clients/new" className="btn-primary inline-block">
            Create Client
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedClients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {client.client_contacts.length} contact{client.client_contacts.length !== 1 ? 's' : ''}
                    </span>
                    {client.lastActivity && (
                      <span>Last activity: {formatDate(client.lastActivity)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{client.progress.percentage}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>

                  {/* Blockers */}
                  {client.progress.blocked > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{client.progress.blocked}</div>
                      <div className="text-xs text-gray-500">Blockers</div>
                    </div>
                  )}

                  {/* Needs Help */}
                  {client.progress.needsHelp > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{client.progress.needsHelp}</div>
                      <div className="text-xs text-gray-500">Needs Help</div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div>
                    {client.progress.percentage === 100 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    ) : client.progress.blocked > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>{client.progress.completed} of {client.progress.total} tasks complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${client.progress.percentage}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
