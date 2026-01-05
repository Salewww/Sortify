import { createClient } from '@/lib/supabase/server';

export type AuditEventType =
  | 'client_created'
  | 'client_updated'
  | 'portal_token_rotated'
  | 'task_marked_done'
  | 'task_marked_needs_help'
  | 'task_reverted'
  | 'reminder_sent_auto'
  | 'reminder_sent_manual'
  | 'file_uploaded'
  | 'recurring_check_created'
  | 'checklist_completed';

export interface AuditEvent {
  clientId: string;
  actorType: 'bookkeeper' | 'client_contact' | 'system';
  actorIdentifier: string; // user_id or email
  eventType: AuditEventType;
  metadata?: Record<string, any>;
}

export async function createAuditEvent(event: AuditEvent) {
  const supabase = await createClient();

  const { error } = await supabase.from('audit_events').insert({
    client_id: event.clientId,
    actor_type: event.actorType,
    actor_identifier: event.actorIdentifier,
    event_type: event.eventType,
    metadata_json: event.metadata || {},
  });

  if (error) {
    console.error('Failed to create audit event:', error);
  }
}

export async function getAuditEventsForClient(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch audit events:', error);
    return [];
  }

  return data;
}
