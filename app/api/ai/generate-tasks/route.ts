import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { packName, packDescription } = await request.json();

    if (!packName) {
      return NextResponse.json(
        { error: 'Pack name is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert bookkeeping consultant helping to create onboarding task checklists for accounting clients.

Pack Name: ${packName}
Description: ${packDescription || 'Not provided'}

Generate a comprehensive list of 5-10 onboarding tasks for this template pack. Each task should help the bookkeeper get the necessary access, data, or documentation from the client.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "title": "Task title",
    "why": "Brief explanation of why this task is needed (1-2 sentences)",
    "instructions": "Step-by-step instructions as a multi-line string using \\n for line breaks",
    "platform": "quickbooks|xero|stripe|gusto|bill|shopify|bank|general",
    "isBlocking": true or false (true if critical for bookkeeping to begin)
  }
]

Guidelines:
- Focus on access setup, data gathering, and credential sharing
- Make instructions clear and actionable
- Use appropriate platform names (quickbooks, xero, stripe, gusto, bill, shopify, bank, general)
- Mark truly critical tasks as blocking
- Keep instructions practical and specific`;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tasksText = response.text().trim();

    let tasks;

    try {
      // Remove markdown code blocks if present
      const cleanedText = tasksText.replace(/```json\n?|\n?```/g, '').trim();
      tasks = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', tasksText);
      throw new Error('Failed to parse AI-generated tasks');
    }

    // Validate the structure
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('AI did not generate valid tasks array');
    }

    // Validate each task has required fields
    for (const task of tasks) {
      if (!task.title || !task.why || !task.instructions || !task.platform) {
        throw new Error('AI-generated tasks are missing required fields');
      }
    }

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error generating tasks with AI:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}
