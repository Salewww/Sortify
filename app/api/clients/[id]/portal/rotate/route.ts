import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generatePortalToken } from '@/lib/utils';
import { Database } from '@/types/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new token
    const newToken = generatePortalToken();

    // Update client
    const { error } = await supabase
      .from('clients')
      .update({ portal_token: newToken })
      .match({ id, owner_user_id: user.id });

    if (error) throw error;

    // Create audit event
    await supabase.from('audit_events').insert({
      client_id: id,
      actor_type: 'bookkeeper',
      actor_identifier: user.id,
      event_type: 'portal_token_rotated',
      metadata_json: {},
    });

    return NextResponse.json({ success: true, newToken });
  } catch (error) {
    console.error('Error rotating portal token:', error);
    return NextResponse.json(
      { error: 'Failed to rotate portal token' },
      { status: 500 }
    );
  }
}
