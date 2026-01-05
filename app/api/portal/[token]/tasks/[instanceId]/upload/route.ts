import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; instanceId: string }> }
) {
  try {
    const { token, instanceId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;

    if (!file || !email) {
      return NextResponse.json({ error: 'File and email are required' }, { status: 400 });
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

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${client.id}/${instanceId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-proofs')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('task-proofs')
      .getPublicUrl(fileName);

    // Update task instance with proof URL
    const { error: updateError } = await supabase
      .from('client_task_instances')
      .update({
        proof_file_url: publicUrl,
      })
      .eq('id', instanceId);

    if (updateError) throw updateError;

    // Create audit event
    await supabase.from('audit_events').insert({
      client_id: client.id,
      actor_type: 'client_contact',
      actor_identifier: email,
      event_type: 'file_uploaded',
      metadata_json: {
        task_instance_id: instanceId,
        file_name: file.name,
        file_url: publicUrl,
      },
    });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
