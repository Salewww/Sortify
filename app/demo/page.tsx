'use client';

import Link from 'next/link';
import { useState } from 'react';

const CLIENTS = [
  { id: 1, name: 'Harrington & Co.', contact: 'Sarah Harrington', email: 'sarah@harringtoncpa.com', status: 'active', progress: 85, tasks: 12, done: 10, lastActivity: '2 hours ago', avatar: 'H', color: 'bg-violet-500' },
  { id: 2, name: 'Meadow Bookkeeping', contact: 'James Meadow', email: 'james@meadowbooks.com', status: 'needs_attention', progress: 40, tasks: 10, done: 4, lastActivity: '3 days ago', avatar: 'M', color: 'bg-blue-500' },
  { id: 3, name: 'Thornton Retail Ltd', contact: 'Lucy Thornton', email: 'lucy@thorntonretail.com', status: 'active', progress: 100, tasks: 8, done: 8, lastActivity: '1 day ago', avatar: 'T', color: 'bg-emerald-500' },
  { id: 4, name: 'Peak Financial', contact: 'Omar Hassan', email: 'omar@peakfin.com', status: 'pending', progress: 15, tasks: 14, done: 2, lastActivity: 'Just now', avatar: 'P', color: 'bg-amber-500' },
  { id: 5, name: 'Cedar Grove Dental', contact: 'Dr. Amy Chen', email: 'amy@cedargrovedental.com', status: 'active', progress: 65, tasks: 9, done: 6, lastActivity: '5 hours ago', avatar: 'C', color: 'bg-rose-500' },
];

const TASKS = [
  { id: 1, label: 'Grant QuickBooks access', client: 'Meadow Bookkeeping', done: false, blocking: true },
  { id: 2, label: 'Upload last 3 bank statements', client: 'Peak Financial', done: false, blocking: true },
  { id: 3, label: 'Sign engagement letter', client: 'Harrington & Co.', done: true, blocking: false },
  { id: 4, label: 'Provide payroll records (Q4)', client: 'Meadow Bookkeeping', done: false, blocking: false },
  { id: 5, label: 'Confirm business address', client: 'Cedar Grove Dental', done: true, blocking: false },
  { id: 6, label: 'Upload Articles of Incorporation', client: 'Peak Financial', done: false, blocking: false },
];

const DOCUMENTS = [
  { name: 'Bank Statement — Oct 2024.pdf', client: 'Harrington & Co.', size: '284 KB', uploaded: '2 hours ago', type: 'pdf' },
  { name: 'Engagement Letter (signed).pdf', client: 'Cedar Grove Dental', size: '118 KB', uploaded: '1 day ago', type: 'pdf' },
  { name: 'Articles of Incorporation.docx', client: 'Thornton Retail Ltd', size: '52 KB', uploaded: '3 days ago', type: 'doc' },
  { name: 'Payroll_Q3_2024.xlsx', client: 'Peak Financial', size: '1.2 MB', uploaded: '5 days ago', type: 'xls' },
];

function ProgressBar({ value, color = 'bg-indigo-500' }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    needs_attention: { label: 'Needs attention', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    pending: { label: 'Pending', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  };
  const { label, cls } = map[status] || map.pending;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>{label}</span>;
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'tasks' | 'documents'>('clients');
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const client = CLIENTS.find(c => c.id === selectedClient);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top banner */}
      <div className="bg-indigo-600 text-white text-center py-3 px-4 text-sm font-medium flex items-center justify-center gap-4">
        <span>👀 You&apos;re viewing a live demo — no account needed</span>
        <Link href="/auth/login?mode=signup" className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-4 py-1 rounded-lg text-xs transition-colors active:scale-[0.97]">
          Start free trial →
        </Link>
      </div>

      {/* Shell */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 88px)' }}>
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="px-4 py-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-gray-900">Sortify</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {[
              { id: 'clients', label: 'Clients', badge: null },
              { id: 'tasks', label: 'Tasks', badge: '4' },
              { id: 'documents', label: 'Documents', badge: null },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as typeof activeTab); setSelectedClient(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <span>{item.label}</span>
                {item.badge && <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">JD</div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">Jane Demo</div>
                <div className="text-[10px] text-gray-400 truncate">jane@demoaccounting.com</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Clients list */}
          {activeTab === 'clients' && !selectedClient && (
            <div className="p-6 max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Clients</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{CLIENTS.length} clients · 3 active onboardings</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">Demo — actions disabled</span>
                  <button disabled className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg opacity-50 cursor-not-allowed">+ Add client</button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {CLIENTS.map((c) => (
                  <button key={c.id} onClick={() => setSelectedClient(c.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left group">
                    <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{c.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-xs text-gray-400">{c.contact} · {c.email}</div>
                    </div>
                    <div className="w-32 shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{c.done}/{c.tasks} tasks</span>
                        <span className="text-xs font-semibold text-gray-700">{c.progress}%</span>
                      </div>
                      <ProgressBar value={c.progress} color={c.progress === 100 ? 'bg-emerald-500' : c.status === 'needs_attention' ? 'bg-amber-400' : 'bg-indigo-500'} />
                    </div>
                    <div className="text-xs text-gray-400 w-24 text-right shrink-0">{c.lastActivity}</div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[{ label: 'Total clients', value: '5', sub: '3 active' }, { label: 'Tasks pending', value: '8', sub: '2 blocking' }, { label: 'Avg. completion', value: '61%', sub: 'this month' }].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                    <div className="text-xs text-indigo-500 font-medium mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single client */}
          {activeTab === 'clients' && client && (
            <div className="p-6 max-w-3xl">
              <button onClick={() => setSelectedClient(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                All clients
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl ${client.color} flex items-center justify-center text-white font-bold text-lg`}>{client.avatar}</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{client.contact}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">{client.email}</span>
                    <StatusBadge status={client.status} />
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button disabled className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 opacity-50 cursor-not-allowed">Copy portal link</button>
                  <button disabled className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg opacity-50 cursor-not-allowed">Send reminder</button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 text-sm">Onboarding progress</h2>
                  <span className="text-sm font-bold text-gray-900">{client.progress}%</span>
                </div>
                <ProgressBar value={client.progress} color={client.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{client.done} of {client.tasks} tasks complete</span>
                  <span className="text-xs text-gray-400">Last activity: {client.lastActivity}</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-50">
                  <h2 className="font-semibold text-gray-900 text-sm">Checklist</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {TASKS.filter(t => t.client === client.name).length > 0
                    ? TASKS.filter(t => t.client === client.name).map(task => (
                        <div key={task.id} className="flex items-center gap-3 px-5 py-3.5">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>
                            {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={`text-sm flex-1 ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.label}</span>
                          {task.blocking && !task.done && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Blocking</span>}
                        </div>
                      ))
                    : <div className="px-5 py-8 text-center text-sm text-gray-400">All tasks completed ✓</div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="p-6 max-w-3xl">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Open tasks</h1>
              <p className="text-sm text-gray-500 mb-6">4 tasks pending across all clients</p>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {TASKS.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>
                      {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{task.client}</div>
                    </div>
                    {task.blocking && !task.done && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shrink-0">Blocking</span>}
                    {task.done && <span className="text-xs text-emerald-600 font-medium shrink-0">Done</span>}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                <strong>2 blocking tasks</strong> need client attention. In Sortify, you send an AI-drafted reminder in one click — no copy-pasting.
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="p-6 max-w-3xl">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Documents</h1>
              <p className="text-sm text-gray-500 mb-6">4 files collected from clients</p>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {DOCUMENTS.map(doc => (
                  <div key={doc.name} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : doc.type === 'doc' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {doc.type.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{doc.client} · {doc.size}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{doc.uploaded}</div>
                    <button disabled className="text-xs text-indigo-600 font-medium opacity-50 cursor-not-allowed shrink-0">Download</button>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
                Clients upload files through their portal link — no login, no friction. Everything lands here instantly.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg z-40">
        <div>
          <div className="font-semibold text-gray-900">Ready to use Sortify for real?</div>
          <div className="text-sm text-gray-500">Start your 14-day free trial — no credit card required.</div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">See pricing</Link>
          <Link href="/auth/login?mode=signup" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-sm">
            Start free trial →
          </Link>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
