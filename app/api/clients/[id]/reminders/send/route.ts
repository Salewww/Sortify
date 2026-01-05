import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch client with contacts and progress
    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_contacts (*),
        client_checklists (
          id,
          type,
          client_task_instances (
            id,
            status,
            task:tasks (
              title,
              is_blocking
            )
          )
        )
      `)
      .eq('id', params.id)
      .eq('owner_user_id', user.id)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const onboardingChecklist = client.client_checklists.find((c: any) => c.type === 'onboarding');
    const tasks = onboardingChecklist?.client_task_instances || [];
    const pendingTasks = tasks.filter((t: any) => t.status !== 'done');

    if (pendingTasks.length === 0) {
      return NextResponse.json({ error: 'All tasks completed' }, { status: 400 });
    }

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${client.portal_token}`;
    const completed = tasks.filter((t: any) => t.status === 'done').length;
    const total = tasks.length;
    const percentage = Math.round((completed / total) * 100);

    // Get primary contact
    const primaryContact = client.client_contacts.find((c: any) => c.is_primary) || client.client_contacts[0];

    if (!primaryContact) {
      return NextResponse.json({ error: 'No contacts found' }, { status: 400 });
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Sortify <onboarding@sortify.app>',
      to: primaryContact.email,
      subject: `${client.name} - Access Setup Reminder`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0ea5e9;">Access Setup Reminder</h1>
          <p>Hi ${primaryContact.name},</p>
          <p>This is a friendly reminder to complete the access setup for <strong>${client.name}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Your Progress</h2>
            <p><strong>${percentage}%</strong> complete (${completed} of ${total} tasks)</p>
            <p><strong>${pendingTasks.length}</strong> tasks remaining</p>
          </div>
          <p><a href="${portalUrl}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Setup</a></p>
          <p style="color: #6b7280; font-size: 14px;">If you have any questions or need help, just reply to this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Create reminder event
    await supabase.from('reminder_events').insert({
      client_id: client.id,
      sent_to: primaryContact.email,
      type: 'manual',
      payload_snapshot: {
        progress: percentage,
        pending_count: pendingTasks.length,
      },
    });

    // Create audit event
    await supabase.from('audit_events').insert({
      client_id: client.id,
      actor_type: 'bookkeeper',
      actor_identifier: user.id,
      event_type: 'reminder_sent_manual',
      metadata_json: {
        sent_to: primaryContact.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
