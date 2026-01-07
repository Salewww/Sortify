'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Pack {
  id: string;
  name: string;
  description: string | null;
  owner_user_id: string | null;
  created_at: string;
}

interface PackTask {
  task_id: string;
  sort_order: number;
  task: {
    id: string;
    title: string;
    platform: {
      name: string;
    };
  };
}

interface GeneratedTask {
  title: string;
  why: string;
  instructions: string;
  platform: string;
  isBlocking: boolean;
}

export default function PacksPage() {
  const { showToast } = useToast();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [packTasks, setPackTasks] = useState<PackTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [showTaskEditor, setShowTaskEditor] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('packs')
      .select('*')
      .order('name');

    if (data) {
      setPacks(data);
      if (data.length > 0) {
        loadPackTasks(data[0]);
      }
    }
    setLoading(false);
  };

  const loadPackTasks = async (pack: Pack) => {
    setSelectedPack(pack);
    const supabase = createClient();

    const { data } = await supabase
      .from('pack_tasks')
      .select(`
        task_id,
        sort_order,
        task:tasks (
          id,
          title,
          platform:platforms (
            name
          )
        )
      `)
      .eq('pack_id', pack.id)
      .order('sort_order');

    if (data) {
      setPackTasks(data as any);
    }
  };

  const generateTasksWithAI = async () => {
    if (!newPackName.trim()) {
      showToast('Please enter a pack name first', 'error');
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packName: newPackName,
          packDescription: newPackDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate tasks');
      }

      const { tasks } = await response.json();
      setAiGeneratedTasks(tasks);
      setShowTaskEditor(true);
      showToast('Tasks generated successfully! Review and edit them below.', 'success');
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      showToast(error.message || 'Failed to generate tasks with AI', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const updateTask = (index: number, field: keyof GeneratedTask, value: string | boolean) => {
    const updated = [...aiGeneratedTasks];
    updated[index] = { ...updated[index], [field]: value };
    setAiGeneratedTasks(updated);
  };

  const removeTask = (index: number) => {
    setAiGeneratedTasks(aiGeneratedTasks.filter((_, i) => i !== index));
  };

  const addManualTask = () => {
    const newTask: GeneratedTask = {
      title: '',
      why: '',
      instructions: '',
      platform: 'general',
      isBlocking: false,
    };
    setAiGeneratedTasks([...aiGeneratedTasks, newTask]);
    if (!showTaskEditor) {
      setShowTaskEditor(true);
    }
  };

  const regenerateSingleTask = async (index: number) => {
    if (!newPackName.trim()) {
      showToast('Pack name is required for AI generation', 'error');
      return;
    }

    const currentTask = aiGeneratedTasks[index];
    setGeneratingAI(true);

    try {
      const response = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packName: newPackName,
          packDescription: `Generate 1 task similar to: ${currentTask.title}. ${newPackDescription}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate task');
      }

      const { tasks } = await response.json();
      if (tasks && tasks.length > 0) {
        const updated = [...aiGeneratedTasks];
        updated[index] = tasks[0];
        setAiGeneratedTasks(updated);
        showToast('Task regenerated successfully!', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to regenerate task', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const deletePack = async (packId: string, packName: string) => {
    if (!confirm(`Are you sure you want to delete "${packName}"? This will also remove all associated tasks.`)) {
      return;
    }

    const supabase = createClient();

    try {
      // Delete pack_tasks first (foreign key relationship)
      const { error: packTasksError } = await supabase
        .from('pack_tasks')
        .delete()
        .eq('pack_id', packId);

      if (packTasksError) throw packTasksError;

      // Delete the pack
      const { error: packError } = await supabase
        .from('packs')
        .delete()
        .eq('id', packId);

      if (packError) throw packError;

      showToast('Pack deleted successfully!', 'success');
      loadPacks();
    } catch (error: any) {
      console.error('Error deleting pack:', error);
      showToast('Failed to delete pack', 'error');
    }
  };

  const createCustomPack = async () => {
    if (!newPackName.trim()) {
      showToast('Please enter a pack name', 'error');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast('You must be logged in to create a pack', 'error');
      return;
    }

    // Create the pack
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .insert({
        name: newPackName,
        description: newPackDescription || null,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (packError) {
      console.error('Error creating pack:', packError);
      showToast('Failed to create pack', 'error');
      return;
    }

    // If we have AI-generated tasks, create them
    if (aiGeneratedTasks.length > 0) {
      try {
        // First, create the tasks
        const tasksToInsert = aiGeneratedTasks.map((task) => ({
          platform_id: null, // Will need to be set manually or matched
          title: task.title,
          why_text: task.why,
          instructions_md: task.instructions,
          is_blocking: task.isBlocking,
          owner_user_id: user.id,
        }));

        const { data: createdTasks, error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (tasksError) {
          console.error('Error creating tasks:', tasksError);
          showToast('Pack created but tasks failed to save. You can add them manually.', 'error');
        } else if (createdTasks) {
          // Link tasks to the pack
          const packTasksToInsert = createdTasks.map((task, index) => ({
            pack_id: pack.id,
            task_id: task.id,
            sort_order: index + 1,
          }));

          const { error: packTasksError } = await supabase
            .from('pack_tasks')
            .insert(packTasksToInsert);

          if (packTasksError) {
            console.error('Error linking tasks to pack:', packTasksError);
            showToast('Pack and tasks created but linking failed', 'error');
          } else {
            showToast(`Pack created with ${createdTasks.length} tasks!`, 'success');
          }
        }
      } catch (error) {
        console.error('Error saving tasks:', error);
        showToast('Pack created but tasks failed to save', 'error');
      }
    } else {
      showToast('Pack created successfully!', 'success');
    }

    // Reset and close
    setShowCreateModal(false);
    setShowTaskEditor(false);
    setNewPackName('');
    setNewPackDescription('');
    setAiGeneratedTasks([]);

    // Reload packs and select the newly created one
    await loadPacks();
    if (pack) {
      loadPackTasks(pack);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Packs</h1>
          <p className="text-gray-600 mt-1">Manage and create custom onboarding template packs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Create Custom Pack
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pack List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Packs</h2>
            <div className="space-y-2">
              {packs.map((pack) => (
                <div key={pack.id} className="relative group">
                  <button
                    onClick={() => loadPackTasks(pack)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedPack?.id === pack.id
                        ? 'bg-primary-50 border-2 border-primary-500 text-primary-900'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{pack.name}</div>
                    {pack.description && (
                      <div className="text-sm text-gray-600 mt-1">{pack.description}</div>
                    )}
                    {pack.owner_user_id === null && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        System Template
                      </span>
                    )}
                  </button>
                  {pack.owner_user_id !== null && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePack(pack.id, pack.name);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete pack"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pack Details */}
        <div className="lg:col-span-2">
          {selectedPack ? (
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPack.name}</h2>
                {selectedPack.description && (
                  <p className="text-gray-600 mt-2">{selectedPack.description}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tasks in this Pack ({packTasks.length})
                </h3>
                <div className="space-y-3">
                  {packTasks.map((pt, index) => (
                    <div
                      key={pt.task_id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pt.task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Platform: {pt.task.platform.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {packTasks.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No tasks in this pack yet.
                </p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-gray-500 text-center py-12">
                Select a pack to view its tasks
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">About Template Packs</h3>
        <p className="text-sm text-gray-700">
          Template packs are pre-configured sets of tasks that help you quickly onboard new clients.
          When creating a client, you select a pack, and all tasks from that pack are automatically
          added to their onboarding checklist.
        </p>
      </div>

      {/* Create Pack Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Custom Pack</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pack Name *
                </label>
                <input
                  type="text"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  className="input"
                  placeholder="e.g., Migration from Previous Accountant"
                  disabled={showTaskEditor}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPackDescription}
                  onChange={(e) => setNewPackDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Brief description of what this pack includes..."
                  disabled={showTaskEditor}
                />
              </div>

              {!showTaskEditor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        Use AI to Generate Tasks
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        Let AI analyze your pack name and description to automatically generate relevant onboarding tasks. You can review and edit them before saving.
                      </p>
                      <button
                        onClick={generateTasksWithAI}
                        disabled={generatingAI || !newPackName.trim()}
                        className="btn-primary text-sm"
                      >
                        {generatingAI ? 'Generating with AI...' : '✨ Generate Tasks with AI'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Task Editor */}
              {showTaskEditor && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Generated Tasks ({aiGeneratedTasks.length})
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={addManualTask}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        + Add Task
                      </button>
                      <button
                        onClick={() => {
                          setShowTaskEditor(false);
                          setAiGeneratedTasks([]);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Clear & Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {aiGeneratedTasks.map((task, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTask(index, 'title', e.target.value)}
                              className="input text-sm font-medium"
                              placeholder="Task title"
                            />
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => regenerateSingleTask(index)}
                              disabled={generatingAI}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Regenerate this task with AI"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeTask(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Remove task"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Why is this needed?
                            </label>
                            <input
                              type="text"
                              value={task.why}
                              onChange={(e) => updateTask(index, 'why', e.target.value)}
                              className="input text-sm"
                              placeholder="Brief explanation"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Instructions
                            </label>
                            <textarea
                              value={task.instructions}
                              onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                              className="input text-sm"
                              rows={3}
                              placeholder="Step-by-step instructions"
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={task.isBlocking}
                                onChange={(e) => updateTask(index, 'isBlocking', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Critical (Blocking)</span>
                            </label>
                            <div className="text-xs text-gray-500">
                              Platform: {task.platform}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowTaskEditor(false);
                  setNewPackName('');
                  setNewPackDescription('');
                  setAiGeneratedTasks([]);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createCustomPack}
                className="btn-primary"
                disabled={generatingAI}
              >
                {showTaskEditor ? `Create Pack with ${aiGeneratedTasks.length} Tasks` : 'Create Pack'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
