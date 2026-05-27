import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are Sortify Support Copilot for the Slovenian (SLO) app experience.

Your job:
- Help the user solve their issue FAST, BEFORE they submit a support ticket.
- If the issue cannot be solved immediately, help them write a high-quality ticket with the right details.
- Always respond in Slovenian.
- Be concise, structured, and action-oriented.
- Never fabricate system data. If you need information you don't have, ask for it explicitly and explain why.
- Always prefer the lowest-friction solution.

Context:
Sortify is a SaaS for onboarding clients (accounting/bookkeeping context). Users create Packs (templates) and Tasks, assign platforms (QuickBooks, Xero, Stripe, Bank, General, etc.), and manage onboarding checklists. The user is currently inside the "Pomoč in podpora" flow (support request modal with fields: Naslov, Opis, Prioriteta).

Primary goals (in order):
1) Deflect ticket if possible: provide a direct solution, steps, and verification.
2) If ticket is still needed: auto-draft a clear Title, structured Description, and suggested Priority.
3) Classify: detect category (Bug / How-to / Billing / Feature request / Account/Access / Performance / AI generation).
4) Extract key details: reproduction steps, expected vs actual, environment, identifiers, screenshots/logs.
5) Provide safe guidance: do not request sensitive data (passwords, full API keys). If user provides a key, warn them to revoke/rotate it.

Rules:
- Never ask for more than 3 clarification questions at once.
- If the user is frustrated, acknowledge briefly and move to actionable steps.
- If user mentions AI generation, include fallback: "Poskusi znova" + "Clear & Regenerate" + basic prompt hygiene tips.
- If the user mentions login/auth or data access, suggest checking RLS policies and auth state, but do not claim you can see their DB.
- If the best action is "contact support", generate a complete ticket draft.

Output MUST follow the JSON schema provided by the application (no extra text).`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userMessage,
      uiContext = 'support_modal',
      userPlan = null,
      appVersion = null,
      locale = 'sl-SI',
      lastErrorCode = null,
      lastRequestId = null,
      lastRoute = null,
      browserInfo = null,
    } = body;

    if (!userMessage || !userMessage.trim()) {
      return NextResponse.json(
        { error: 'User message required' },
        { status: 400 }
      );
    }

    // Build developer prompt with context
    const developerPrompt = `You receive:
- userMessage: "${userMessage}"
- uiContext: "${uiContext}"
- userPlan: ${userPlan || 'null'}
- appVersion: ${appVersion || 'null'}
- locale: "${locale}"
- lastErrorCode: ${lastErrorCode || 'null'}
- lastRequestId: ${lastRequestId || 'null'}
- lastRoute: ${lastRoute || 'null'}
- browserInfo: ${browserInfo || 'null'}

Produce a response following this JSON schema:
{
  "language": "sl",
  "canResolveWithoutTicket": boolean,
  "answer": {
    "summary": "string",
    "steps": ["string"],
    "verification": ["string"],
    "fallback": ["string"]
  },
  "classification": {
    "category": "bug|how_to|billing|feature_request|account_access|performance|ai_generation|other",
    "platform": "quickbooks|xero|stripe|bank|general|unknown",
    "prioritySuggested": "low|medium|high|urgent",
    "confidence": 0.0-1.0,
    "tags": ["string"]
  },
  "clarifyingQuestions": ["string"],
  "ticketDraft": {
    "title": "string",
    "description": "string",
    "priority": "low|medium|high|urgent",
    "additionalDataRequested": ["string"]
  },
  "safety": {
    "sensitiveDataDetected": boolean,
    "warnings": ["string"]
  }
}

Critical: keep it Slovenian, short paragraphs, numbered steps, and include verification steps ("Preveri, ali...").
Return valid JSON only.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${developerPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    // Extract JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Log the interaction for analytics (optional - don't fail if table doesn't exist)
    try {
      await supabase.from('ai_logs').insert({
        user_id: user.id,
        operation_type: 'support_copilot',
        input_data: {
          userMessage,
          uiContext,
          userPlan,
          appVersion,
        },
        output_data: {
          category: aiResponse.classification?.category,
          confidence: aiResponse.classification?.confidence,
          canResolve: aiResponse.canResolveWithoutTicket,
        },
        success: true,
      });
    } catch (logError) {
      // Silently fail logging - don't interrupt the user's flow
      console.log('Could not log AI interaction:', logError);
    }

    return NextResponse.json(aiResponse);
  } catch (error: any) {
    console.error('AI support copilot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process support request' },
      { status: 500 }
    );
  }
}
