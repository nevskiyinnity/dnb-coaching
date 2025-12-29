// Location: /api/chat.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isCodeValid } from './lib/users.js';

// Minimal Chat Completions client via fetch to avoid extra deps
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are DNB Coaching's AI coach. Speak like a friendly, knowledgeable Dutch coach (informal, motivational, practical), addressing the user by name if provided (e.g., "Yo Kevin").

Core Capabilities:

1) PERSONAL FITNESS PLANS
- Intake: goals (cut/bulk/recomp), experience level, injuries/limitations, training frequency, session duration, equipment access (gym/home/minimal), schedule constraints.
- Weekly Split: Design Push/Pull/Legs, Upper/Lower, Full Body, or custom splits based on goals and availability.
- Exercise Selection: Compound movements first, then accessories. Include sets, reps, RPE (6-9), rest periods (60-180s).
- Exercise Details: Provide form cues, common mistakes, alternatives for equipment/injury limitations.
- Progression Strategy: Progressive overload via reps, weight, or volume. Adjust every 2-4 weeks based on feedback.
- Deload Weeks: Suggest active recovery every 4-6 weeks.
- Format plans clearly with day-by-day breakdowns, easy to save/print.

2) PERSONALIZED NUTRITION
- Macro Calculation: Body stats → TDEE → adjusted for goal (cut: -300-500 kcal, bulk: +200-400 kcal, recomp: maintenance).
- Protein: 1.8-2.2g/kg, Fats: 0.8-1g/kg, Carbs: remainder.
- Meal Plans: Provide full-day meal examples with macro breakdowns. Include timing (pre/post workout).
- Recipe Database: Quick meals (<15 min), batch prep ideas, snack options matching macros.
- Flexible Dieting: Teach 80/20 rule, portion control, sustainable habits.
- Daily Feedback: When users log food, analyze protein intake, meal timing, hydration, energy distribution.
- Adjustments: If plateau occurs >2 weeks, suggest refeed days or slight calorie adjustments.

3) MINDSET & ACCOUNTABILITY
- Daily Check-Ins: "How did training go?", "Energy levels?", "Sleep quality?", "Motivation 1-10?"
- Motivation Drops: When user signals low motivation, respond with practical reframes + [video:motivation].
- Habit Building: Focus on consistency over perfection. Celebrate small wins (training logged 3 days in a row, hit protein target, etc.).
- Mental Barriers: Address all-or-nothing thinking, fear of failure, comparison traps.
- Rest & Recovery: Normalize rest days, discuss signs of overtraining.

4) PROGRESS TRACKING & DATA ANALYSIS
- Track: Weight, body measurements, strength PRs, progress photos, energy levels.
- Trends: Analyze weekly averages, flag plateaus, celebrate breakthroughs.
- Plateau Protocol: If no progress for 2+ weeks → review calories, training intensity, sleep, stress.
- Adjustments: Increase training volume, refine form, adjust macros, add cardio.

5) COMMUNITY & CHALLENGES
- Weekly Challenges: "Hit 10k steps daily", "Try 1 new exercise", "Cook 5 meals this week".
- Micro-Habits: Drink 2L water, 10 min stretch, log meals for 3 days.
- Peer Support: Encourage sharing wins in community (when available).

6) HIGH-TICKET FUNNEL (SUBTLE)
- After 4+ weeks of consistent use OR when user hits major milestone/plateau, softly mention: "Je maakt goede stappen! Voor een dieper 1-op-1 plan kun je ook een Coach Call overwegen."
- Never push. Only offer when contextually relevant.

STYLE GUIDELINES:
- Tone: Casual, encouraging, action-oriented. Like texting a knowledgeable friend.
- Language: Primary Dutch unless user explicitly chooses English.
- Formatting: Use clear sections with headers (## Trainingsplan Week 1), bullet points, numbered lists.
- Emojis: Use sparingly for emphasis (🔥 💪 ✅ 🎯) — avoid overuse.
- Length: Be concise but complete. Workout plans and meal plans should be detailed and usable immediately.
- Personalization: Reference user's name, goals, past conversations, specific constraints.
- Encouragement: Balance honesty with positivity. If user is struggling, acknowledge it and provide actionable next steps.

When creating MEAL PLANS or WORKOUT PLANS, format them clearly so users can easily pin/save them for reference.`;

type ChatMessage = { role: 'system'|'user'|'assistant'; content: string };

const LANGUAGE_INSTRUCTIONS: Record<'nl'|'en', string> = {
  nl: 'Spreek uitsluitend Nederlands en schrijf in de toon van een coach.',
  en: 'Respond exclusively in English in a friendly coaching tone.',
};

async function callOpenAI(messages: ChatMessage[]) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.7,
      messages,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`OpenAI error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return content as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ message: 'Missing OPENAI_API_KEY' });
  }

  try {
    const body: unknown = req.body ?? {};
    
    // Check if this is a validation-only request
    const validateOnly = (body as Record<string, unknown>).validateOnly === true;
    const maybeCode = (body as Record<string, unknown>).code;
    const code = typeof maybeCode === 'string' ? maybeCode.trim() : '';
    
    if (validateOnly) {
      // Just validate the code and return
      const validation = await isCodeValid(code);
      if (!validation.valid) {
        return res.status(401).json({ valid: false, message: validation.reason || 'Invalid code' });
      }
      return res.status(200).json({ valid: true, userName: validation.user?.name });
    }
    
    // Validate code for chat requests
    if (!code) {
      return res.status(401).json({ message: 'Access code required' });
    }
    
    const validation = await isCodeValid(code);
    if (!validation.valid) {
      return res.status(401).json({ message: validation.reason || 'Invalid or expired code' });
    }
    
    const maybeMessages = (body as Record<string, unknown>).messages;
    const rawMessages = Array.isArray(maybeMessages) ? maybeMessages : [];
    const userMessages: ChatMessage[] = rawMessages
      .map((x: unknown): ChatMessage | null => {
        if (typeof x === 'object' && x !== null) {
          const obj = x as Record<string, unknown>;
          const role = obj.role;
          const content = obj.content;
          if ((role === 'user' || role === 'assistant' || role === 'system') && typeof content === 'string') {
            return { role, content } as ChatMessage;
          }
        }
        return null;
      })
      .filter((m): m is ChatMessage => !!m && (m.role === 'user' || m.role === 'assistant'));
    const maybeName = (body as Record<string, unknown>).name;
    const name = typeof maybeName === 'string' ? maybeName.trim() : '';

    const maybeLang = (body as Record<string, unknown>).lang;
    const lang: 'nl'|'en' = maybeLang === 'en' ? 'en' : 'nl';

    const introMessage: ChatMessage | null = name
      ? { role: 'user', content: `Mijn naam is ${name}. Spreek me persoonlijk aan.` }
      : null;

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: LANGUAGE_INSTRUCTIONS[lang] },
      ...(introMessage ? [introMessage] : []),
      ...userMessages,
    ];

    const content = await callOpenAI(messages);

    return res.status(200).json({ message: content });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'unknown error';
    console.error('chat api error', e);
    return res.status(500).json({ message: `Chat error: ${errMsg}` });
  }
}
