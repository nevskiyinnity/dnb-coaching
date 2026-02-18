# DNB Coaching

AI-powered coaching chatbot for DNB Coaching. Access-code gated chat with GPT-4o-mini, gamification (streaks, badges, XP), weight progress tracking, admin panel for user management, and a marketing landing page.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **UI:** Tailwind CSS + Radix UI (shadcn/ui)
- **Backend:** Express 5 (Node.js 20)
- **Database:** SQLite (better-sqlite3)
- **AI:** OpenAI GPT-4o-mini
- **Email:** Resend
- **Charts:** Recharts
- **Deployment:** PM2 + Nginx on Ubuntu VPS

## Getting Started

```bash
npm install
cp .env.example .env  # fill in values below

npm run dev            # Express :3000 + Vite :8080 (concurrent)
```

Vite proxies all `/api/*` requests to Express during development.

### Production

```bash
npm run build
npm start              # Express serves dist/ on :3000
```

See `DEPLOY_UBUNTU.md` for full Ubuntu + PM2 + Nginx + SSL setup.

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | GPT-4o-mini chat |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Override AI model |
| `ADMIN_PASSWORD` | Recommended | `DNBCoach` | Admin panel password |
| `VITE_RESEND_API_KEY` | Yes | — | Contact form emails via Resend |
| `PORT` | No | `3000` | Express listen port |

## Features

- **Access-code chat** — users enter an 8-character code to start a coaching session. Codes have expiry dates and are managed via the admin panel.
- **AI coaching persona** — Dutch-primary fitness coaching bot (mirrors user's language). Strict scope: fitness, nutrition, mindset, progress tracking. Includes detailed PPL splits, TDEE macros, and progressive overload guidance.
- **Image support** — multimodal chat with image uploads analyzed by the AI.
- **Gamification** — streak counter, PR badges, and weekly XP score displayed in a sidebar.
- **Weight tracking** — `/progress` page with Recharts line chart of logged weight entries.
- **Cross-device sync** — per-user JSON blob sync via SQLite for chat state persistence.
- **Contact form** — sends email via Resend.
- **Admin panel** — password-protected user CRUD (name, expiry, auto-generated codes) and session management.
- **Marketing landing page** — hero, features, services, expertise, FAQ sections.

## Project Structure

```
├── server/
│   ├── index.js               # Express: all API routes
│   └── db.js                  # SQLite setup (users + settings)
├── config/
│   └── constants.js           # AI system prompt and coaching rules
├── src/
│   ├── App.tsx                # React router
│   ├── pages/
│   │   ├── Index.tsx          # Marketing landing page
│   │   ├── Bot.tsx            # Chat interface
│   │   ├── Progress.tsx       # Weight tracking + charts
│   │   └── Admin.tsx          # User management panel
│   ├── components/
│   │   ├── chat/              # ChatBubble, ChatInput, LoginScreen
│   │   └── ...                # Landing page sections
│   └── hooks/
│       ├── useBotAuth.ts      # Auth state management
│       └── useChat.ts         # Message state, send, sync
├── vite.config.ts             # Port 8080, proxy /api to :3000
├── ADMIN_SETUP.md             # Admin panel API docs
└── DEPLOY_UBUNTU.md           # Ubuntu deployment guide
```
