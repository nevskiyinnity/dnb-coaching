import express from 'express';
import cors from 'cors'; // Added cors for development/testing flexibility
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Load .env file
import { Resend } from 'resend';
import { getAllUsers, addUser, updateUser, deleteUser, generateCode, isCodeValid } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'DNBCoach';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Helper for admin auth
const checkAdminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.replace('Bearer ', '');
    if (token !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Unauthorized' });
    next();
};

// --- API Routes ---

// Admin Auth
app.post('/api/admin/auth', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid password' });
});

// Admin Users CRUD
app.get('/api/admin/users', checkAdminAuth, (req, res) => {
    try {
        const users = getAllUsers();
        res.json({ users });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.post('/api/admin/users', checkAdminAuth, (req, res) => {
    try {
        const { name, expiryDate } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

        const code = generateCode();
        const newUser = {
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            name: name.trim(),
            code,
            expiryDate: expiryDate || null,
            createdAt: new Date().toISOString(),
        };

        addUser(newUser);
        res.status(201).json({ user: newUser });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.put('/api/admin/users', checkAdminAuth, (req, res) => {
    try {
        const { id, name, expiryDate } = req.body;
        if (!id) return res.status(400).json({ message: 'User ID is required' });

        const success = updateUser(id, { name: name?.trim(), expiryDate });
        if (!success) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete('/api/admin/users', checkAdminAuth, (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: 'User ID is required' });

        const success = deleteUser(id);
        if (!success) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation locally
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!RESEND_API_KEY) {
        console.error('VITE_RESEND_API_KEY is not set');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const resend = new Resend(RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'site@dnbcoaching.com',
            to: ['info@dnbcoaching.com'], // Ensure this is configured
            subject: `New message from ${name}`,
            replyTo: email,
            html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ message: 'Error sending email', error });
        }

        res.json({ message: 'Message sent successfully!', data });
    } catch (e) {
        console.error('Contact error:', e);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

// Chat API
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

const LANGUAGE_INSTRUCTIONS = {
    nl: 'Spreek uitsluitend Nederlands en schrijf in de toon van een coach.',
    en: 'Respond exclusively in English in a friendly coaching tone.',
};

app.post('/api/chat', async (req, res) => {
    if (!OPENAI_API_KEY) return res.status(500).json({ message: 'Missing OPENAI_API_KEY' });

    try {
        const { messages: rawMessages, code, name, lang, validateOnly } = req.body;

        // Validation
        const codestr = (code || '').trim();
        if (validateOnly) {
            const v = isCodeValid(codestr);
            if (!v.valid) return res.status(401).json({ valid: false, message: v.reason || 'Invalid code' });
            return res.status(200).json({ valid: true, userName: v.user?.name });
        }

        if (!codestr) return res.status(401).json({ message: 'Access code required' });
        const validation = isCodeValid(codestr);
        if (!validation.valid) return res.status(401).json({ message: validation.reason });

        // Format Messages
        const userMessages = Array.isArray(rawMessages)
            ? rawMessages.filter(m => m && (m.role === 'user' || m.role === 'assistant')).map(m => ({ role: m.role, content: m.content }))
            : [];

        const language = lang === 'en' ? 'en' : 'nl';
        const intro = name ? { role: 'user', content: `Mijn naam is ${name}. Spreek me persoonlijk aan.` } : null;

        const chatMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: LANGUAGE_INSTRUCTIONS[language] },
            ...(intro ? [intro] : []),
            ...userMessages
        ];

        // OpenAI Call
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                temperature: 0.7,
                messages: chatMessages,
            }),
        });

        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new Error(`OpenAI error: ${resp.status} ${text}`);
        }

        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content ?? '';
        res.json({ message: content });

    } catch (e) {
        console.error('Chat error:', e);
        res.status(500).json({ message: `Chat error: ${e.message}` });
    }
});


// Catch-all for SPA handling
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
