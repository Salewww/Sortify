# AI-Powered Template Pack Creation - Setup Instructions

This guide will help you set up the AI features for automatic template pack generation using Google Gemini AI.

## Prerequisites

- Active Supabase project
- Google AI Studio account (for Gemini API - Free tier available)
- Access to your `.env.local` file

## Step 1: Get Your Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **Get API Key** or **Create API Key**
4. Select **Create API key in new project** (or choose an existing project)
5. Copy the API key (it starts with `AIza...`)
6. **Important:** Save this key securely - you can always retrieve it from AI Studio later

**Note:** Google AI Studio offers a generous free tier perfect for MVP and early-stage usage. No credit card required to get started!

## Step 2: Add API Key to Environment Variables

1. Open your `.env.local` file in the Sortify project root
2. Add the following line:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. Save the file
4. Restart your Next.js development server:

```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

## Step 3: Update Supabase Database Schema

The AI features require the `tasks` table to have an `owner_user_id` column to support custom user-created tasks.

### Run this SQL in Supabase SQL Editor:

```sql
-- Add owner_user_id column to tasks table (if it doesn't exist)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_owner_user_id ON tasks(owner_user_id);

-- Update RLS policies to allow users to create their own tasks
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
USING (owner_user_id IS NULL OR auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
USING (auth.uid() = owner_user_id);
```

## Step 4: Install Required npm Package

The AI generation feature uses the Google Generative AI SDK. Install it:

```bash
npm install @google/generative-ai
```

## Step 5: Deploy Environment Variable to Vercel (Production)

If you're deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your Google Gemini API key (AIza...)
   - **Environments:** Select Production, Preview, and Development
4. Click **Save**
5. Redeploy your application

## Step 6: Test the AI Feature

1. Log into your Sortify dashboard
2. Go to **Templates** page
3. Click **+ Create Custom Pack**
4. Enter a pack name and description, for example:
   - **Name:** "Restaurant Onboarding"
   - **Description:** "Complete setup for restaurant clients including POS integration, inventory systems, and payroll"
5. Click **✨ Generate Tasks with AI**
6. Wait 3-5 seconds for AI to generate tasks
7. Review, edit, and modify the generated tasks as needed
8. Click **Create Pack with X Tasks**

## How It Works

1. **User Input:** You provide pack name and description
2. **AI Processing:** Google Gemini analyzes your input and generates 5-10 relevant tasks
3. **Task Structure:** Each task includes:
   - Title
   - Why it's needed (explanation)
   - Step-by-step instructions
   - Platform assignment (QuickBooks, Xero, Stripe, etc.)
   - Blocking status (critical or not)
4. **User Review:** You can edit, remove, or modify any generated task
5. **Save:** Tasks are saved to your database and linked to the pack

## AI Cost & Pricing Notes

- **Model Used:** Google Gemini 1.5 Flash (gemini-1.5-flash-002)
- **SDK Version:** @google/generative-ai v0.24+
- **Free Tier:** Google AI Studio provides generous free quota (15 requests per minute, 1 million tokens per minute, 1500 requests per day)
- **Cost During MVP:** $0 with free tier - perfect for early usage and testing
- **Paid Pricing:** After exceeding free tier: ~$0.01-0.02 per pack generation
- **Optimization:** Gemini 1.5 Flash is optimized for fast, lightweight tasks including structured JSON generation
- More info: https://ai.google.dev/pricing

**Provider-Agnostic Architecture:** Our implementation is designed to easily switch between AI providers (Gemini, Claude, ChatGPT) by simply swapping the API integration. The prompt engineering and task structure remain consistent.

## Troubleshooting

### "Failed to generate tasks with AI"

**Check:**
1. Is `GEMINI_API_KEY` set correctly in `.env.local`?
2. Did you restart the dev server after adding the key?
3. Check if you've exceeded Google AI Studio's free tier limits
4. Check browser console for detailed error messages
5. Verify your Google AI Studio API key is active at https://aistudio.google.com/app/apikey

### "Pack created but tasks failed to save"

**Check:**
1. Did you run the SQL migration to add `owner_user_id` column?
2. Check Supabase logs for permission errors
3. Verify RLS policies are created correctly

### Tasks not showing up in pack

**Check:**
1. Refresh the Templates page
2. Click on the newly created pack in the left sidebar
3. Check Supabase database directly: `SELECT * FROM pack_tasks WHERE pack_id = 'your-pack-id'`

### API Rate Limit Errors

**Check:**
1. Free tier limits: 15 RPM, 1M TPM, 1500 RPD
2. Wait a minute before retrying
3. Consider upgrading to paid tier if needed for higher volume

## Alternative: Use ChatGPT or Claude Instead

Our architecture is provider-agnostic, making it easy to switch AI providers.

### Option 1: Use OpenAI ChatGPT

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Install OpenAI SDK: `npm install openai`
3. Replace the API call in [/app/api/ai/generate-tasks/route.ts](app/api/ai/generate-tasks/route.ts):

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Replace the genAI.getGenerativeModel() call with:
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // or gpt-4o for better quality
  messages: [
    {
      role: 'system',
      content: 'You are an expert bookkeeping consultant...',
    },
    {
      role: 'user',
      content: prompt,
    },
  ],
});

const tasksText = completion.choices[0].message.content;
```

4. Update `.env.local` with `OPENAI_API_KEY` instead

### Option 2: Use Anthropic Claude

1. Get Anthropic API key from https://console.anthropic.com/
2. Install Anthropic SDK: `npm install @anthropic-ai/sdk`
3. Replace the API call in [/app/api/ai/generate-tasks/route.ts](app/api/ai/generate-tasks/route.ts):

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Replace the genAI.getGenerativeModel() call with:
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2000,
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
});

const tasksText = message.content[0].type === 'text'
  ? message.content[0].text
  : '';
```

4. Update `.env.local` with `ANTHROPIC_API_KEY` instead

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Next.js server logs in your terminal
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly
5. Check Google AI Studio dashboard for API usage and quota limits

---

**Note:** AI-generated tasks are suggestions and should always be reviewed before use. The AI may not always generate perfect tasks for every use case.
