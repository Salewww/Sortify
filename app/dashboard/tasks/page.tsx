'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

export default function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(isV2 ? 'Niste prijavljeni' : 'Not authenticated');
        setLoading(false);
        return;
      }

      // For now, we'll create a simple tasks view
      // In the future, this could be expanded to pull from a solo_tasks table
      const { data, error: fetchError } = await supabase
        .from('solo_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Table might not exist yet, show empty state
        console.log('No solo_tasks table yet:', fetchError);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(isV2 ? 'Napaka pri nalaganju nalog' : 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(task => task.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };

    const labels = isV2 ? {
      pending: 'Čakajoče',
      in_progress: 'V teku',
      completed: 'Zaključeno',
    } : {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-red-200 text-red-900 font-bold',
    };

    const labels = isV2 ? {
      low: 'Nizka',
      medium: 'Srednja',
      high: 'Visoka',
      urgent: 'Nujno',
    } : {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const createTask = async () => {
    if (!newTitle.trim()) {
      showToast(isV2 ? 'Vnesite naslov naloge' : 'Please enter a task title', 'error');
      return;
    }

    setCreating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast(isV2 ? 'Niste prijavljeni' : 'Not authenticated', 'error');
      setCreating(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('solo_tasks')
        .insert({
          user_id: user.id,
          title: newTitle,
          description: newDescription || null,
          priority: newPriority,
          status: 'pending',
          due_date: newDueDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setNewDueDate('');
      showToast(isV2 ? 'Naloga ustvarjena!' : 'Task created!', 'success');
    } catch (error: any) {
      console.error('Error creating task:', error);
      showToast(isV2 ? 'Napaka pri ustvarjanju naloge: ' + error.message : 'Error creating task: ' + error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">
          {isV2 ? 'Nalaganje nalog...' : 'Loading tasks...'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isV2 ? 'Moje naloge' : 'My Tasks'}
        </h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          {isV2 ? '+ Nova naloga' : '+ New Task'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isV2 ? 'Vse' : 'All'} ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'pending'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isV2 ? 'Čakajoče' : 'Pending'} ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'in_progress'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isV2 ? 'V teku' : 'In Progress'} ({tasks.filter(t => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'completed'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isV2 ? 'Zaključeno' : 'Completed'} ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isV2 ? 'Ni nalog' : 'No tasks'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isV2
              ? 'Začnite z dodajanjem nove naloge.'
              : 'Get started by creating a new task.'}
          </p>
          <div className="mt-6">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              {isV2 ? '+ Nova naloga' : '+ New Task'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {task.title}
                    </h3>
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.due_date && (
                      <span>
                        {isV2 ? 'Rok:' : 'Due:'} {new Date(task.due_date).toLocaleDateString(isV2 ? 'sl-SI' : 'en-US')}
                      </span>
                    )}
                    <span>
                      {isV2 ? 'Ustvarjeno:' : 'Created:'} {new Date(task.created_at).toLocaleDateString(isV2 ? 'sl-SI' : 'en-US')}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isV2 ? 'Nova naloga' : 'New Task'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Naslov *' : 'Title *'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                  placeholder={isV2 ? 'Vnesite naslov naloge...' : 'Enter task title...'}
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Opis' : 'Description'}
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder={isV2 ? 'Opis naloge...' : 'Task description...'}
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Prioriteta' : 'Priority'}
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="input"
                  disabled={creating}
                >
                  <option value="low">{isV2 ? 'Nizka' : 'Low'}</option>
                  <option value="medium">{isV2 ? 'Srednja' : 'Medium'}</option>
                  <option value="high">{isV2 ? 'Visoka' : 'High'}</option>
                  <option value="urgent">{isV2 ? 'Nujno' : 'Urgent'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Rok' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input"
                  disabled={creating}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle('');
                  setNewDescription('');
                  setNewPriority('medium');
                  setNewDueDate('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={creating}
              >
                {isV2 ? 'Prekliči' : 'Cancel'}
              </button>
              <button
                onClick={createTask}
                className="btn-primary"
                disabled={creating || !newTitle.trim()}
              >
                {creating
                  ? (isV2 ? 'Ustvarjam...' : 'Creating...')
                  : (isV2 ? 'Ustvari nalogo' : 'Create Task')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
