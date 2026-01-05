import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; instanceId: string }> }
) {
  try {
    const { token, instanceId } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify token belongs to a valid client
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('portal_token', token)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'Invalid portal token' }, { status: 404 });
    }

    // Update task instance
    const { error } = await supabase
      .from('client_task_instances')
      .update({
        status: 'done',
        completed_at: new Date().toISOString(),
        completed_by_email: email,
      })
      .eq('id', instanceId);

    if (error) throw error;

    // Create audit event
    await supabase.from('audit_events').insert({
      client_id: client.id,
      actor_type: 'client_contact',
      actor_identifier: email,
      event_type: 'task_marked_done',
      metadata_json: { task_instance_id: instanceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking task as done:', error);
    return NextResponse.json(
      { error: 'Failed to mark task as done' },
      { status: 500 }
    );
  }
}
