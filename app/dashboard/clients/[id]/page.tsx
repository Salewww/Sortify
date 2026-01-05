import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDateTime, calculateProgress } from '@/lib/utils';
import Link from 'next/link';
import ClientActions from '@/components/ClientActions';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch client with all related data
  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      client_contacts (*),
      client_checklists (
        id,
        type,
        run_label,
        created_at,
        client_task_instances (
          *,
          task:tasks (
            *,
            platform:platforms (*)
          )
        )
      ),
      reminder_settings (*),
      recurring_check_schedules (*),
      audit_events (
        *
      )
    `)
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .single();

  if (error || !client) {
    notFound();
  }

  const onboardingChecklist = client.client_checklists.find((c: any) => c.type === 'onboarding');
  const taskInstances = onboardingChecklist?.client_task_instances || [];

  // Group tasks by platform
  const tasksByPlatform = taskInstances.reduce((acc: any, ti: any) => {
    const platformName = ti.task.platform.name;
    if (!acc[platformName]) {
      acc[platformName] = [];
    }
    acc[platformName].push(ti);
    return acc;
  }, {});

  const progress = calculateProgress(
    taskInstances.map((ti: any) => ({
      status: ti.status,
      is_blocking: ti.task.is_blocking,
    }))
  );

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${client.portal_token}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Link>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
            {client.notes && (
              <p className="text-gray-600">{client.notes}</p>
            )}
          </div>
          <div className="flex gap-3">
            <ClientActions clientId={client.id} portalToken={client.portal_token} />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Progress</div>
          <div className="text-3xl font-bold text-gray-900">{progress.percentage}%</div>
          <div className="text-xs text-gray-500">{progress.completed} of {progress.total} complete</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Blockers</div>
          <div className="text-3xl font-bold text-red-600">{progress.blocked}</div>
          <div className="text-xs text-gray-500">Tasks blocking work</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Needs Help</div>
          <div className="text-3xl font-bold text-yellow-600">{progress.needsHelp}</div>
          <div className="text-xs text-gray-500">Client requested help</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <div className="text-lg font-semibold">
            {progress.percentage === 100 ? (
              <span className="text-green-600">Complete</span>
            ) : progress.blocked > 0 ? (
              <span className="text-red-600">Blocked</span>
            ) : (
              <span className="text-yellow-600">In Progress</span>
            )}
          </div>
          <div className="text-xs text-gray-500">Current state</div>
        </div>
      </div>

      {/* Portal Link */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Client Portal Link</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={portalUrl}
            readOnly
            className="input flex-1 font-mono text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(portalUrl);
              alert('Link copied to clipboard!');
            }}
            className="btn-secondary"
          >
            Copy Link
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this link with your client contacts to give them access to the checklist.
        </p>
      </div>

      {/* Contacts */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Contacts</h2>
        <div className="space-y-2">
          {client.client_contacts.map((contact: any) => (
            <div key={contact.id} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-600">{contact.email}</div>
              </div>
              {contact.is_primary && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Checklist */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks Checklist</h2>
        <div className="space-y-6">
          {Object.entries(tasksByPlatform).map(([platform, tasks]: [string, any]) => (
            <div key={platform}>
              <h3 className="font-semibold text-gray-900 mb-3">{platform}</h3>
              <div className="space-y-3">
                {tasks.map((taskInstance: any) => (
                  <div
                    key={taskInstance.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {taskInstance.status === 'done' ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : taskInstance.status === 'needs_help' ? (
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {taskInstance.task.title}
                            {taskInstance.task.is_blocking && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Blocking
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{taskInstance.task.why_text}</p>
                        </div>
                        <div className="text-right text-sm">
                          {taskInstance.status === 'done' && taskInstance.completed_at && (
                            <div className="text-gray-600">
                              <div className="font-medium text-green-600">Completed</div>
                              <div className="text-xs">{formatDateTime(taskInstance.completed_at)}</div>
                              {taskInstance.completed_by_email && (
                                <div className="text-xs">by {taskInstance.completed_by_email}</div>
                              )}
                            </div>
                          )}
                          {taskInstance.status === 'needs_help' && (
                            <div className="font-medium text-yellow-600">Needs Help</div>
                          )}
                        </div>
                      </div>
                      {taskInstance.proof_file_url && (
                        <div className="mt-2">
                          <a
                            href={taskInstance.proof_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            View proof file →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h2>
        <div className="space-y-3">
          {client.audit_events.length === 0 ? (
            <p className="text-gray-500 text-sm">No audit events yet</p>
          ) : (
            client.audit_events
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
              .map((event: any) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="text-gray-500 whitespace-nowrap">
                    {formatDateTime(event.created_at)}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{event.actor_type}</span>
                    {' '}
                    <span className="text-gray-600">{event.event_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
