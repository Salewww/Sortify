import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, taskSummary, tone = 'professional' } = body;

    if (!clientId || !taskSummary) {
      return NextResponse.json(
        { error: 'Client ID and task summary required' },
        { status: 400 }
      );
    }

    // Get client details
    const { data: client } = await supabase
      .from('clients')
      .select('name, contact_person')
      .eq('id', clientId)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Generate reminder with AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are writing a professional reminder email in Slovenian language for an accounting firm to their client.

Client name: ${client.name}
Contact person: ${client.contact_person || 'the client'}
Outstanding tasks: ${taskSummary}

Tone: ${tone === 'friendly' ? 'friendly and warm' : 'professional and courteous'}

Generate:
1. Subject line (max 60 characters)
2. Email body (2-3 short paragraphs, professional Slovenian)

The email should:
- Be polite and respectful
- Clearly state what actions are needed
- Mention any upcoming deadlines if applicable
- End with an offer to help if they have questions

Format your response as JSON:
{
  "subject": "subject line here",
  "body": "full email body here"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const generated = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      subject: generated.subject,
      body: generated.body,
    });
  } catch (error: any) {
    console.error('AI reminder composition error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate reminder' },
      { status: 500 }
    );
  }
}
