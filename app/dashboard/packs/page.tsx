'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

interface Pack {
  id: string;
  name: string;
  description: string | null;
  owner_user_id: string | null;
  created_at: string;
  is_system: boolean;
  country_code: string;
  tags: string[];
  business_types: string[];
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
  const [deleteConfirmPack, setDeleteConfirmPack] = useState<{id: string; name: string} | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWhy, setNewTaskWhy] = useState('');
  const [newTaskInstructions, setNewTaskInstructions] = useState('');
  const [newTaskPlatform, setNewTaskPlatform] = useState('general');
  const [newTaskBlocking, setNewTaskBlocking] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    const supabase = createClient();
    const appVersion = getAppVersion();

    let query = supabase
      .from('packs')
      .select('*')
      .order('name');

    // v2.0: Filter to show only Slovenia system packs + user's custom packs
    if (appVersion === 'v2') {
      const { data: { user } } = await supabase.auth.getUser();

      query = query.or(`and(country_code.eq.SI,is_system.eq.true),owner_user_id.eq.${user?.id || 'null'}`);
    }

    const { data } = await query;

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
    const appVersion = getAppVersion();
    const errorMsg = appVersion === 'v2' ? 'Najprej vnesite ime paketa' : 'Please enter a pack name first';

    if (!newPackName.trim()) {
      showToast(errorMsg, 'error');
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
      const successMsg = appVersion === 'v2'
        ? 'Naloge uspešno ustvarjene! Preglejte in uredite jih spodaj.'
        : 'Tasks generated successfully! Review and edit them below.';
      showToast(successMsg, 'success');
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      const errorMsg = appVersion === 'v2'
        ? error.message || 'Napaka pri ustvarjanju nalog z AI'
        : error.message || 'Failed to generate tasks with AI';
      showToast(errorMsg, 'error');
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
    const appVersion = getAppVersion();

    if (!newPackName.trim()) {
      const errorMsg = appVersion === 'v2'
        ? 'Ime paketa je obvezno za AI generiranje'
        : 'Pack name is required for AI generation';
      showToast(errorMsg, 'error');
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
        const successMsg = appVersion === 'v2'
          ? 'Naloga uspešno ponovno ustvarjena!'
          : 'Task regenerated successfully!';
        showToast(successMsg, 'success');
      }
    } catch (error: any) {
      const errorMsg = appVersion === 'v2'
        ? error.message || 'Napaka pri ponovnem ustvarjanju naloge'
        : error.message || 'Failed to regenerate task';
      showToast(errorMsg, 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const addTaskToPack = async () => {
    const appVersion = getAppVersion();

    if (!newTaskTitle.trim()) {
      const errorMsg = appVersion === 'v2' ? 'Vnesite naslov naloge' : 'Please enter a task title';
      showToast(errorMsg, 'error');
      return;
    }

    if (!selectedPack) {
      const errorMsg = appVersion === 'v2' ? 'Najprej izberite paket' : 'Please select a pack first';
      showToast(errorMsg, 'error');
      return;
    }

    setAddingTask(true);
    const supabase = createClient();

    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          why: newTaskWhy || null,
          instructions: newTaskInstructions || null,
          platform: newTaskPlatform,
          is_blocking: newTaskBlocking,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Link task to pack
      const { error: linkError } = await supabase
        .from('pack_tasks')
        .insert({
          pack_id: selectedPack.id,
          task_id: task.id,
          sort_order: packTasks.length + 1,
        });

      if (linkError) throw linkError;

      const successMsg = appVersion === 'v2'
        ? 'Naloga uspešno dodana!'
        : 'Task added successfully!';
      showToast(successMsg, 'success');

      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskWhy('');
      setNewTaskInstructions('');
      setNewTaskPlatform('general');
      setNewTaskBlocking(false);

      // Reload pack tasks
      loadPackTasks(selectedPack);
    } catch (error: any) {
      console.error('Error adding task:', error);
      const errorMsg = appVersion === 'v2'
        ? 'Napaka pri dodajanju naloge'
        : 'Failed to add task';
      showToast(errorMsg, 'error');
    } finally {
      setAddingTask(false);
    }
  };

  const confirmDeletePack = async () => {
    if (!deleteConfirmPack) return;

    const appVersion = getAppVersion();
    const supabase = createClient();

    try {
      // Delete pack_tasks first (foreign key relationship)
      const { error: packTasksError } = await supabase
        .from('pack_tasks')
        .delete()
        .eq('pack_id', deleteConfirmPack.id);

      if (packTasksError) throw packTasksError;

      // Delete the pack
      const { error: packError } = await supabase
        .from('packs')
        .delete()
        .eq('id', deleteConfirmPack.id);

      if (packError) throw packError;

      const successMsg = appVersion === 'v2'
        ? 'Paket uspešno izbrisan!'
        : 'Pack deleted successfully!';
      showToast(successMsg, 'success');
      setDeleteConfirmPack(null);
      loadPacks();
    } catch (error: any) {
      console.error('Error deleting pack:', error);
      const errorMsg = appVersion === 'v2'
        ? 'Napaka pri brisanju paketa'
        : 'Failed to delete pack';
      showToast(errorMsg, 'error');
    }
  };

  const createCustomPack = async () => {
    const appVersion = getAppVersion();

    if (!newPackName.trim()) {
      const errorMsg = appVersion === 'v2' ? 'Vnesite ime paketa' : 'Please enter a pack name';
      showToast(errorMsg, 'error');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const errorMsg = appVersion === 'v2'
        ? 'Za ustvarjanje paketa morate biti prijavljeni'
        : 'You must be logged in to create a pack';
      showToast(errorMsg, 'error');
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
      const errorMsg = appVersion === 'v2' ? 'Napaka pri ustvarjanju paketa' : 'Failed to create pack';
      showToast(errorMsg, 'error');
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
          const errorMsg = appVersion === 'v2'
            ? 'Paket ustvarjen, vendar naloge niso bile shranjene. Dodate jih lahko ročno.'
            : 'Pack created but tasks failed to save. You can add them manually.';
          showToast(errorMsg, 'error');
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
            const errorMsg = appVersion === 'v2'
              ? 'Paket in naloge ustvarjeni, vendar povezava ni uspela'
              : 'Pack and tasks created but linking failed';
            showToast(errorMsg, 'error');
          } else {
            const successMsg = appVersion === 'v2'
              ? `Paket ustvarjen z ${createdTasks.length} nalogami!`
              : `Pack created with ${createdTasks.length} tasks!`;
            showToast(successMsg, 'success');
          }
        }
      } catch (error) {
        console.error('Error saving tasks:', error);
        const errorMsg = appVersion === 'v2'
          ? 'Paket ustvarjen, vendar naloge niso bile shranjene'
          : 'Pack created but tasks failed to save';
        showToast(errorMsg, 'error');
      }
    } else {
      const successMsg = appVersion === 'v2' ? 'Paket uspešno ustvarjen!' : 'Pack created successfully!';
      showToast(successMsg, 'success');
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
    const loadingText = getAppVersion() === 'v2' ? 'Nalaganje...' : 'Loading...';
    return <div>{loadingText}</div>;
  }

  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';
  const t = isV2 ? sl.templates : {
    title: 'Template Packs',
    description: 'Manage and create custom onboarding template packs',
    availablePacks: 'Available Packs',
    systemTemplate: 'System Template',
    customPack: '+ Create Custom Pack',
    tasksInPack: 'Tasks in this Pack',
    noTasks: 'No tasks in this pack yet.',
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.description}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          {t.customPack}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pack List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.availablePacks}</h2>
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
                    {pack.is_system && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {t.systemTemplate}
                      </span>
                    )}
                  </button>
                  {pack.owner_user_id !== null && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmPack({id: pack.id, name: pack.name});
                      }}
                      className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title={isV2 ? 'Izbriši paket' : 'Delete pack'}
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t.tasksInPack} ({packTasks.length})
                  </h3>
                  {selectedPack.owner_user_id !== null && (
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="btn-primary text-sm"
                    >
                      {isV2 ? '+ Dodaj nalogo' : '+ Add Task'}
                    </button>
                  )}
                </div>
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
                  {t.noTasks}
                </p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-gray-500 text-center py-12">
                {isV2 ? 'Izberite paket za ogled nalog' : 'Select a pack to view its tasks'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          {isV2 ? 'O predlogah paketov' : 'About Template Packs'}
        </h3>
        <p className="text-sm text-gray-700">
          {isV2
            ? 'Predloge paketov so vnaprej konfigurirani nizi nalog, ki vam pomagajo hitro uvesti nove stranke. Ko ustvarite stranko, izberete paket in vse naloge iz tega paketa se avtomatsko dodajo na njihov kontrolni seznam za uvajanje.'
            : 'Template packs are pre-configured sets of tasks that help you quickly onboard new clients. When creating a client, you select a pack, and all tasks from that pack are automatically added to their onboarding checklist.'
          }
        </p>
      </div>

      {/* Create Pack Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isV2 ? 'Ustvari paket po meri' : 'Create Custom Pack'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Ime paketa *' : 'Pack Name *'}
                </label>
                <input
                  type="text"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  className="input"
                  placeholder={isV2 ? 'npr. Menjava računovodstva' : 'e.g., Migration from Previous Accountant'}
                  disabled={showTaskEditor}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Opis' : 'Description'}
                </label>
                <textarea
                  value={newPackDescription}
                  onChange={(e) => setNewPackDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder={isV2 ? 'Kratek opis vsebine tega paketa...' : 'Brief description of what this pack includes...'}
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
                        {isV2 ? 'Uporabite AI za ustvarjanje nalog' : 'Use AI to Generate Tasks'}
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        {isV2
                          ? 'Naj AI analizira ime paketa in opis ter avtomatsko ustvari ustrezne naloge za uvajanje. Preglejte in uredite jih pred shranjevanjem.'
                          : 'Let AI analyze your pack name and description to automatically generate relevant onboarding tasks. You can review and edit them before saving.'
                        }
                      </p>
                      <button
                        onClick={generateTasksWithAI}
                        disabled={generatingAI || !newPackName.trim()}
                        className="btn-primary text-sm"
                      >
                        {generatingAI
                          ? (isV2 ? 'Ustvarjam z AI...' : 'Generating with AI...')
                          : (isV2 ? '✨ Ustvari naloge z AI' : '✨ Generate Tasks with AI')
                        }
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
                      {isV2 ? `Ustvarjene naloge (${aiGeneratedTasks.length})` : `Generated Tasks (${aiGeneratedTasks.length})`}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={addManualTask}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {isV2 ? '+ Dodaj nalogo' : '+ Add Task'}
                      </button>
                      <button
                        onClick={() => {
                          setShowTaskEditor(false);
                          setAiGeneratedTasks([]);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {isV2 ? 'Počisti in ponovno ustvari' : 'Clear & Regenerate'}
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
                              placeholder={isV2 ? 'Naslov naloge' : 'Task title'}
                            />
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => regenerateSingleTask(index)}
                              disabled={generatingAI}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title={isV2 ? 'Ponovno ustvari to nalogo z AI' : 'Regenerate this task with AI'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeTask(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title={isV2 ? 'Odstrani nalogo' : 'Remove task'}
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
                              {isV2 ? 'Zakaj je to potrebno?' : 'Why is this needed?'}
                            </label>
                            <input
                              type="text"
                              value={task.why}
                              onChange={(e) => updateTask(index, 'why', e.target.value)}
                              className="input text-sm"
                              placeholder={isV2 ? 'Kratka razlaga' : 'Brief explanation'}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {isV2 ? 'Navodila' : 'Instructions'}
                            </label>
                            <textarea
                              value={task.instructions}
                              onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                              className="input text-sm"
                              rows={3}
                              placeholder={isV2 ? 'Navodila korak za korakom' : 'Step-by-step instructions'}
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
                              <span className="text-sm text-gray-700">
                                {isV2 ? 'Kritično (blokirajoče)' : 'Critical (Blocking)'}
                              </span>
                            </label>
                            <div className="text-xs text-gray-500">
                              {isV2 ? 'Platforma:' : 'Platform:'} {task.platform}
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
                {isV2 ? 'Prekliči' : 'Cancel'}
              </button>
              <button
                onClick={createCustomPack}
                className="btn-primary"
                disabled={generatingAI}
              >
                {showTaskEditor
                  ? (isV2 ? `Ustvari paket z ${aiGeneratedTasks.length} nalogami` : `Create Pack with ${aiGeneratedTasks.length} Tasks`)
                  : (isV2 ? 'Ustvari paket' : 'Create Pack')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isV2 ? 'Potrdite brisanje' : 'Confirm Deletion'}
            </h3>
            <p className="text-gray-700 mb-2">
              {isV2
                ? `Ali ste prepričani, da želite izbrisati "${deleteConfirmPack.name}"?`
                : `Are you sure you want to delete "${deleteConfirmPack.name}"?`
              }
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {isV2
                ? 'To bo izbrisalo tudi vse povezane naloge.'
                : 'This will also remove all associated tasks.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmPack(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isV2 ? 'Prekliči' : 'Cancel'}
              </button>
              <button
                onClick={confirmDeletePack}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isV2 ? 'Izbriši' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isV2 ? 'Dodaj nalogo v paket' : 'Add Task to Pack'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Naslov naloge *' : 'Task Title *'}
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input"
                  placeholder={isV2 ? 'npr. Omogoči dostop do QuickBooks' : 'e.g., Enable QuickBooks Access'}
                  disabled={addingTask}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Zakaj je to potrebno?' : 'Why is this needed?'}
                </label>
                <input
                  type="text"
                  value={newTaskWhy}
                  onChange={(e) => setNewTaskWhy(e.target.value)}
                  className="input"
                  placeholder={isV2 ? 'Kratka razlaga...' : 'Brief explanation...'}
                  disabled={addingTask}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Navodila' : 'Instructions'}
                </label>
                <textarea
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  className="input"
                  rows={5}
                  placeholder={isV2 ? 'Navodila korak za korakom...' : 'Step-by-step instructions...'}
                  disabled={addingTask}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isV2 ? 'Platforma' : 'Platform'}
                </label>
                <select
                  value={newTaskPlatform}
                  onChange={(e) => setNewTaskPlatform(e.target.value)}
                  className="input"
                  disabled={addingTask}
                >
                  <option value="general">General</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="xero">Xero</option>
                  <option value="stripe">Stripe</option>
                  <option value="gusto">Gusto</option>
                  <option value="bill">Bill.com</option>
                  <option value="shopify">Shopify</option>
                  <option value="bank">Bank</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTaskBlocking}
                    onChange={(e) => setNewTaskBlocking(e.target.checked)}
                    className="rounded border-gray-300"
                    disabled={addingTask}
                  />
                  <span className="text-sm text-gray-700">
                    {isV2 ? 'Kritično (blokirajoče)' : 'Critical (Blocking)'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1">
                  {isV2
                    ? 'Označite, če je ta naloga obvezna za nadaljevanje uvajanja'
                    : 'Mark if this task is required before proceeding with onboarding'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                  setNewTaskWhy('');
                  setNewTaskInstructions('');
                  setNewTaskPlatform('general');
                  setNewTaskBlocking(false);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={addingTask}
              >
                {isV2 ? 'Prekliči' : 'Cancel'}
              </button>
              <button
                onClick={addTaskToPack}
                className="btn-primary"
                disabled={addingTask || !newTaskTitle.trim()}
              >
                {addingTask
                  ? (isV2 ? 'Dodajam...' : 'Adding...')
                  : (isV2 ? 'Dodaj nalogo' : 'Add Task')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
