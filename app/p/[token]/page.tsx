import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { calculateProgress } from '@/lib/utils';
import PortalTaskCard from '@/components/PortalTaskCard';

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch client by portal token (no auth required)
  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      client_checklists (
        id,
        type,
        client_task_instances (
          *,
          task:tasks (
            *,
            platform:platforms (*)
          )
        )
      )
    `)
    .eq('portal_token', token)
    .eq('is_archived', false)
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
      acc[platformName] = {
        name: platformName,
        tasks: [],
      };
    }
    acc[platformName].tasks.push(ti);
    return acc;
  }, {});

  const progress = calculateProgress(
    taskInstances.map((ti: any) => ({
      status: ti.status,
      is_blocking: ti.task.is_blocking,
    }))
  );

  const platforms = Object.values(tasksByPlatform);
  const blockingTasks = taskInstances.filter((ti: any) => ti.task.is_blocking && ti.status !== 'done');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {client.name} - Access Setup
          </h1>
          <p className="text-gray-600">
            Complete the steps below to give us the access we need to start your bookkeeping.
          </p>
        </div>

        {/* Progress Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
              <p className="text-sm text-gray-600">
                {progress.completed} of {progress.total} tasks complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">{progress.percentage}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {progress.percentage === 100 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900">All Set!</h3>
                  <p className="text-sm text-green-700">
                    You've completed all the required steps. We'll be in touch soon!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blocking Tasks Warning */}
        {blockingTasks.length > 0 && progress.percentage < 100 && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  {blockingTasks.length} task{blockingTasks.length !== 1 ? 's' : ''} blocking our work
                </h3>
                <p className="text-sm text-red-700">
                  These items are required before we can start working on your books. Please complete them as soon as possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tasks by Platform */}
        <div className="space-y-6">
          {platforms.map((platform: any) => (
            <div key={platform.name}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{platform.name}</h2>
              <div className="space-y-4">
                {platform.tasks.map((taskInstance: any) => (
                  <PortalTaskCard
                    key={taskInstance.id}
                    taskInstance={taskInstance}
                    checklistId={onboardingChecklist.id}
                    token={token}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800">
              <strong>Security Note:</strong> Never share your actual login credentials through this portal.
              We only need you to grant us access through each platform's official invite/sharing system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
