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
    const { helpRequestId } = body;

    if (!helpRequestId) {
      return NextResponse.json(
        { error: 'Help request ID required' },
        { status: 400 }
      );
    }

    // Get help request details
    const { data: helpRequest } = await supabase
      .from('help_requests')
      .select('*')
      .eq('id', helpRequestId)
      .single();

    if (!helpRequest) {
      return NextResponse.json({ error: 'Help request not found' }, { status: 404 });
    }

    // Use AI to triage and suggest solution
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an AI assistant helping triage accounting-related support requests in Slovenia.

Request Title: ${helpRequest.title}
Description: ${helpRequest.description}

Analyze this support request and provide:
1. Suggested priority (low, medium, high, urgent)
2. Category (technical, accounting, document_related, general_question, urgent_issue)
3. A brief suggested solution or next steps in Slovenian (2-3 sentences)

Format your response as JSON:
{
  "priority": "medium",
  "category": "accounting",
  "suggestedSolution": "solution text in Slovenian here"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Update help request with AI insights
    await supabase
      .from('help_requests')
      .update({
        ai_triaged: true,
        ai_suggested_solution: analysis.suggestedSolution,
        priority: analysis.priority,
      })
      .eq('id', helpRequestId);

    return NextResponse.json({
      priority: analysis.priority,
      category: analysis.category,
      suggestedSolution: analysis.suggestedSolution,
    });
  } catch (error: any) {
    console.error('AI triage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to triage request' },
      { status: 500 }
    );
  }
}
