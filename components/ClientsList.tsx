'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

type FilterType = 'all' | 'blocked' | 'needs_help' | 'completed';

interface ClientWithMetrics {
  id: string;
  name: string;
  client_contacts: any[];
  lastActivity: Date | null;
  progress: {
    percentage: number;
    blocked: number;
    needsHelp: number;
    completed: number;
    total: number;
  };
}

interface ClientsListProps {
  clients: ClientWithMetrics[];
}

export default function ClientsList({ clients }: ClientsListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredClients = clients.filter((client) => {
    switch (activeFilter) {
      case 'blocked':
        return client.progress.blocked > 0;
      case 'needs_help':
        return client.progress.needsHelp > 0;
      case 'completed':
        return client.progress.percentage === 100;
      default:
        return true;
    }
  });

  const counts = {
    all: clients.length,
    blocked: clients.filter(c => c.progress.blocked > 0).length,
    needsHelp: clients.filter(c => c.progress.needsHelp > 0).length,
    completed: clients.filter(c => c.progress.percentage === 100).length,
  };

  return (
    <>
      {/* Quick Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeFilter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('blocked')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeFilter === 'blocked'
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Blocked ({counts.blocked})
          </button>
          <button
            onClick={() => setActiveFilter('needs_help')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeFilter === 'needs_help'
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Needs Help ({counts.needsHelp})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeFilter === 'completed'
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No clients yet' : `No ${activeFilter.replace('_', ' ')} clients`}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeFilter === 'all'
              ? 'Create your first client to start tracking access onboarding'
              : 'Try selecting a different filter to see other clients'}
          </p>
          {activeFilter === 'all' && (
            <Link href="/dashboard/clients/new" className="btn-primary inline-block">
              Create Client
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
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
    </>
  );
}
