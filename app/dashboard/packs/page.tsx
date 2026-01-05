'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [packTasks, setPackTasks] = useState<PackTask[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Template Packs</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pack List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Packs</h2>
            <div className="space-y-2">
              {packs.map((pack) => (
                <button
                  key={pack.id}
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
    </div>
  );
}
