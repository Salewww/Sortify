'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generatePortalToken } from '@/lib/utils';

interface Pack {
  id: string;
  name: string;
  description: string | null;
}

interface Contact {
  name: string;
  email: string;
  is_primary: boolean;
}

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', email: '', is_primary: true }
  ]);
  const [recurringCheck, setRecurringCheck] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    async function loadPacks() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading packs:', error);
        alert('Failed to load template packs. Please ensure the database is set up correctly.');
        return;
      }

      if (data) {
        setPacks(data);
        if (data.length > 0) {
          setSelectedPackId(data[0].id);
        } else {
          alert('No template packs found. Please run the database seed migration first.');
        }
      }
    }
    loadPacks();
  }, []);

  const addContact = () => {
    setContacts([...contacts, { name: '', email: '', is_primary: false }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedPackId) {
      alert('Please select a template pack');
      return;
    }

    if (contacts.some(c => !c.name || !c.email)) {
      alert('Please fill in all contact details');
      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Authentication error: ' + userError.message);
      if (!user) throw new Error('Not authenticated');

      // Create client
      const portalToken = generatePortalToken();
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          owner_user_id: user.id,
          name: clientName,
          notes: notes || null,
          portal_token: portalToken,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create contacts
      const contactsToInsert = contacts.map(c => ({
        client_id: client.id,
        name: c.name,
        email: c.email,
        is_primary: c.is_primary,
      }));

      const { error: contactsError } = await supabase
        .from('client_contacts')
        .insert(contactsToInsert);

      if (contactsError) throw contactsError;

      // Create onboarding checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('client_checklists')
        .insert({
          client_id: client.id,
          type: 'onboarding',
          run_label: 'Initial Onboarding',
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Get tasks from selected pack
      const { data: packTasks, error: packTasksError } = await supabase
        .from('pack_tasks')
        .select('task_id, sort_order')
        .eq('pack_id', selectedPackId)
        .order('sort_order');

      if (packTasksError) throw packTasksError;

      // Create task instances
      const taskInstances = packTasks.map(pt => ({
        checklist_id: checklist.id,
        task_id: pt.task_id,
        status: 'pending' as const,
      }));

      const { error: instancesError } = await supabase
        .from('client_task_instances')
        .insert(taskInstances);

      if (instancesError) throw instancesError;

      // Create reminder settings
      const { error: reminderError } = await supabase
        .from('reminder_settings')
        .insert({
          client_id: client.id,
          is_paused: false,
          cadence_json: {
            day0: true,
            day2: true,
            day5: true,
            day9: true,
          },
          escalate_to_secondary: false,
        });

      if (reminderError) throw reminderError;

      // Create recurring check schedule if enabled
      if (recurringCheck) {
        const nextRunDate = new Date();
        nextRunDate.setMonth(nextRunDate.getMonth() + (recurringFrequency === 'monthly' ? 1 : 3));

        const { error: scheduleError } = await supabase
          .from('recurring_check_schedules')
          .insert({
            client_id: client.id,
            frequency: recurringFrequency,
            next_run_date: nextRunDate.toISOString().split('T')[0],
            is_active: true,
          });

        if (scheduleError) throw scheduleError;
      }

      // Create audit event
      await supabase.from('audit_events').insert({
        client_id: client.id,
        actor_type: 'bookkeeper',
        actor_identifier: user.id,
        event_type: 'client_created',
        metadata_json: {
          pack_id: selectedPackId,
          contacts_count: contacts.length,
        },
      });

      // Redirect to client page
      router.push(`/dashboard/clients/${client.id}`);
    } catch (error: any) {
      console.error('Error creating client:', error);
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error occurred';
      alert('Failed to create client: ' + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Client</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card space-y-6">
          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="input"
              placeholder="Acme Corporation"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Add any internal notes about this client..."
            />
          </div>

          {/* Select Pack */}
          <div>
            <label htmlFor="pack" className="block text-sm font-medium text-gray-700 mb-2">
              Template Pack *
            </label>
            <select
              id="pack"
              value={selectedPackId}
              onChange={(e) => setSelectedPackId(e.target.value)}
              required
              className="input"
            >
              {packs.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
            {packs.find(p => p.id === selectedPackId)?.description && (
              <p className="mt-1 text-sm text-gray-500">
                {packs.find(p => p.id === selectedPackId)?.description}
              </p>
            )}
          </div>

          {/* Contacts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Contacts *
            </label>
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Contact Name"
                    required
                    className="input flex-1"
                  />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="input flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={contact.is_primary}
                      onChange={(e) => updateContact(index, 'is_primary', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Primary
                  </label>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addContact}
              className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Another Contact
            </button>
          </div>

          {/* Recurring Check */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recurringCheck}
                onChange={(e) => setRecurringCheck(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Recurring Access Checks
              </span>
            </label>
            {recurringCheck && (
              <div className="mt-3 ml-6">
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as 'monthly' | 'quarterly')}
                  className="input max-w-xs"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
