# AI-Powered Template Pack Creation - Setup Instructions

This guide will help you set up the AI features for automatic template pack generation using Claude AI.

## Prerequisites

- Active Supabase project
- Anthropic API account (for Claude AI)
- Access to your `.env.local` file

## Step 1: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in to your Anthropic account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Give it a name like "Sortify AI Generation"
6. Copy the API key (it starts with `sk-ant-`)
7. **Important:** Save this key securely - you won't be able to see it again!

## Step 2: Add API Key to Environment Variables

1. Open your `.env.local` file in the Sortify project root
2. Add the following line:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
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

The AI generation feature uses the Anthropic SDK. Install it:

```bash
npm install @anthropic-ai/sdk
```

## Step 5: Deploy Environment Variable to Vercel (Production)

If you're deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (sk-ant-...)
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
2. **AI Processing:** Claude AI analyzes your input and generates 5-10 relevant tasks
3. **Task Structure:** Each task includes:
   - Title
   - Why it's needed (explanation)
   - Step-by-step instructions
   - Platform assignment (QuickBooks, Xero, Stripe, etc.)
   - Blocking status (critical or not)
4. **User Review:** You can edit, remove, or modify any generated task
5. **Save:** Tasks are saved to your database and linked to the pack

## Pricing Notes

- Anthropic Claude API pricing: https://www.anthropic.com/pricing
- Model used: Claude 3.5 Sonnet (latest)
- Approximate cost: $0.01-0.03 per pack generation
- Each generation uses ~2000 tokens maximum

## Troubleshooting

### "Failed to generate tasks with AI"

**Check:**
1. Is `ANTHROPIC_API_KEY` set correctly in `.env.local`?
2. Did you restart the dev server after adding the key?
3. Check your Anthropic account has available credits
4. Check browser console for detailed error messages

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

## Alternative: Use ChatGPT API Instead

If you prefer to use OpenAI's ChatGPT instead of Claude:

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Install OpenAI SDK: `npm install openai`
3. Replace the API call in `/app/api/ai/generate-tasks/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Replace the anthropic.messages.create() call with:
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

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Next.js server logs in your terminal
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly

---

**Note:** AI-generated tasks are suggestions and should always be reviewed before use. The AI may not always generate perfect tasks for every use case.
