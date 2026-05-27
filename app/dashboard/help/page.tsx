'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';

interface HelpRequest {
  id: string;
  client_id: string | null;
  user_id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  ai_triaged: boolean;
  ai_suggested_solution: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface AIResponse {
  language: string;
  canResolveWithoutTicket: boolean;
  answer?: {
    summary: string;
    steps: string[];
    verification: string[];
    fallback: string[];
  };
  classification?: {
    category: string;
    platform: string;
    prioritySuggested: Priority;
    confidence: number;
    tags: string[];
  };
  clarifyingQuestions?: string[];
  ticketDraft?: {
    title: string;
    description: string;
    priority: Priority;
    additionalDataRequested: string[];
  };
  safety?: {
    sensitiveDataDetected: boolean;
    warnings: string[];
  };
}

export default function HelpPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const appVersion = getAppVersion();
  const t = appVersion === 'v2' ? sl.help : {
    title: 'Help & Support',
    requestHelp: 'Request Help',
    myRequests: 'My Requests',
    createRequest: 'New Help Request',
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    },
    status: {
      open: 'Open',
      in_progress: 'In Progress',
      waiting_client: 'Waiting on Client',
      resolved: 'Resolved',
      closed: 'Closed',
    },
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading help requests:', error);
      // Only show error toast for actual errors, not for table not existing
      if (error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
        showToast('Napaka pri nalaganju zahtev', 'error');
      }
    }

    setRequests(data || []);
    setLoading(false);
  };

  const getAISuggestion = async () => {
    if (!newTitle.trim() && !newDescription.trim()) {
      showToast('Vnesite vsaj naslov ali opis', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/support-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `${newTitle}\n\n${newDescription}`,
          uiContext: 'support_modal',
          appVersion: getAppVersion(),
          locale: 'sl-SI',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const data: AIResponse = await response.json();
      setAiSuggestion(data);

      // If AI provided a ticket draft, pre-fill it
      if (data.ticketDraft) {
        setNewTitle(data.ticketDraft.title);
        setNewDescription(data.ticketDraft.description);
        setNewPriority(data.ticketDraft.priority);
      }
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      showToast('Napaka pri pridobivanju AI predloga', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const createRequest = async () => {
    if (!newTitle.trim()) {
      showToast('Vnesite naslov', 'error');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast('Niste prijavljeni', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: user.id,
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          status: 'open',
          ai_triaged: false,
        });

      if (error) throw error;

      showToast('Zahteva uspešno oddana!', 'success');
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setAiSuggestion(null);
      loadRequests();

      // TODO: Trigger AI triage in background
    } catch (error: any) {
      console.error('Error creating request:', error);
      showToast(error.message || 'Napaka pri oddaji zahteve', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting_client': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Nalaganje...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">Upravljajte z zahtevami za pomoč</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + {t.createRequest}
        </button>
      </div>

      {/* Requests List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t.myRequests} ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nimate odprtih zahtev za pomoč.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex-1">{request.title}</h3>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {t.priority[request.priority]}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {t.status[request.status]}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                {request.ai_triaged && request.ai_suggested_solution && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">AI Predlog rešitve:</p>
                        <p className="text-sm text-blue-800">{request.ai_suggested_solution}</p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Oddano: {new Date(request.created_at).toLocaleString('sl-SI')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.createRequest}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naslov *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                  placeholder="Kratko opišite problem..."
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input"
                  rows={5}
                  placeholder="Podroben opis problema ali vprašanja..."
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioriteta
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="input"
                  disabled={submitting}
                >
                  <option value="low">{t.priority.low}</option>
                  <option value="medium">{t.priority.medium}</option>
                  <option value="high">{t.priority.high}</option>
                  <option value="urgent">{t.priority.urgent}</option>
                </select>
              </div>

              {/* AI Support Copilot Button */}
              {!aiSuggestion && (
                <div className="mt-4">
                  <button
                    onClick={getAISuggestion}
                    disabled={aiLoading || submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {aiLoading ? 'AI analizira...' : '✨ AI Support Copilot'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    AI bo poskusil rešiti vaš problem brez oddaje zahteve
                  </p>
                </div>
              )}
            </div>

            {/* AI Suggestion Display */}
            {aiSuggestion && (
              <div className="mt-4 border-t pt-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">AI Support Copilot</h4>
                      {aiSuggestion.answer && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-700">{aiSuggestion.answer.summary}</p>

                          {aiSuggestion.answer.steps.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Koraki:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                {aiSuggestion.answer.steps.map((step, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {aiSuggestion.answer.verification.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Preveri:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {aiSuggestion.answer.verification.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiSuggestion.clarifyingQuestions && aiSuggestion.clarifyingQuestions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Dodatna vprašanja:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {aiSuggestion.clarifyingQuestions.map((q, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiSuggestion.safety?.warnings && aiSuggestion.safety.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                              <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Opozorilo:</p>
                              {aiSuggestion.safety.warnings.map((warning, idx) => (
                                <p key={idx} className="text-sm text-yellow-800">{warning}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {aiSuggestion.canResolveWithoutTicket && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setAiSuggestion(null);
                          setShowCreateModal(false);
                          setNewTitle('');
                          setNewDescription('');
                          setNewPriority('medium');
                          showToast('Super! Upamo, da smo pomagali 👍', 'success');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        ✓ To mi je pomagalo
                      </button>
                      <button
                        onClick={() => setAiSuggestion(null)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                      >
                        Še vedno potrebujem pomoč
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle('');
                  setNewDescription('');
                  setNewPriority('medium');
                  setAiSuggestion(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={submitting}
              >
                Prekliči
              </button>
              <button
                onClick={createRequest}
                className="btn-primary"
                disabled={submitting || !newTitle.trim()}
              >
                {submitting ? 'Oddajam...' : 'Oddaj zahtevo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
