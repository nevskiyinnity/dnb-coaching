# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

- Install deps
  ```bash path=null start=null
  npm install
  ```
- Dev server (Vite on port 8080)
  ```bash path=null start=null
  npm run dev
  ```
- Build (production)
  ```bash path=null start=null
  npm run build
  ```
- Build (development mode)
  ```bash path=null start=null
  npm run build:dev
  ```
- Preview built app
  ```bash path=null start=null
  npm run preview
  ```
- Lint (ESLint flat config)
  ```bash path=null start=null
  npm run lint
  ```
- Type-check (no script provided, use tsc)
  ```bash path=null start=null
  npx tsc -p tsconfig.app.json --noEmit
  ```
- Tests
  - No test runner or test scripts are configured.

## Architecture overview

- Tooling
  - Build/dev: Vite + React SWC plugin (`vite.config.ts`). Dev server binds to host `::` and port `8080`. Path alias `@` → `src`.
  - Lint: ESLint (flat config via `eslint.config.js`) with `typescript-eslint`, React Hooks, and React Refresh plugins.
  - Styling: Tailwind CSS with design tokens in `src/index.css` and config in `tailwind.config.ts` (content globs include `src/**`, `components/**`, `pages/**`, `app/**`). PostCSS configured in `postcss.config.js`.
  - TypeScript: `tsconfig.json` with project refs to `tsconfig.app.json` (app) and `tsconfig.node.json` (Node/vite config). Path mapping `@/*` → `./src/*`.

- Frontend app flow
  - Entry: `index.html` → `src/main.tsx` mounts `<App />`.
  - App shell: `src/App.tsx` sets up providers and routing:
    - Providers: `QueryClientProvider` (TanStack Query), `TooltipProvider`, toast UIs (`@/components/ui/toaster` and `@/components/ui/sonner`).
    - Routing: React Router DOM with `/` → `src/pages/Index.tsx`; catch-all `*` → `src/pages/NotFound.tsx`.
  - UI system: Shadcn-style components in `src/components/ui/*` with utility `cn` in `src/lib/utils.ts`. Global design tokens (CSS variables) declared in `src/index.css`.
  - Feature composition: `src/pages/Index.tsx` composes section components from `src/components/*` (Hero, Features, RiskSection, ExpertiseSection, Services, WhoWeSeek, FAQ, ContactForm, FinalPromise, Footer).
  - Hooks/utilities: e.g., `src/hooks/use-mobile.tsx` responsive hook; shared utilities under `src/lib/*`.

- Forms and validation
  - Client-side: Zod schema in `src/components/ContactForm.tsx`; uses `useToast` for UX feedback and submits JSON to `/api/contact`.

- API (serverless)
  - Location: `api/contact.ts` (Vercel Functions convention via `@vercel/node`).
  - Behavior: Accepts `POST` with `{ name, email, message }`, validates with Zod, sends email via Resend SDK, returns JSON. Requires environment variable `VITE_RESEND_API_KEY`.
  - Local dev: The Vite dev server does not serve `api/*`. To exercise the API locally, run in an environment that supports Vercel Functions (e.g., `vercel dev`) or provide a mock/proxy; otherwise, client `fetch('/api/contact')` will 404 in plain Vite.

- Shadcn config
  - `components.json` sets aliases (`components`, `ui`, `lib`, `hooks`) and Tailwind integration targeting `tailwind.config.ts` and `src/index.css`.

## Environment

- Required env vars for runtime functionality
  - `VITE_RESEND_API_KEY` (used by `api/contact.ts` for Resend). Configure in your deployment platform (e.g., Vercel project settings) and your local function runtime as needed. Do not expose secrets in client code.
  - `OPENAI_API_KEY` (used by `api/chat.ts` to power the bot at `/bot`).

## Notes for the Bot

- Bot UI lives at route `/bot` (`src/pages/Bot.tsx`).
- Serverless endpoint: `api/chat.ts` (requires `OPENAI_API_KEY`).
- Local dev: `vite` alone won’t serve `api/*`. Use a Vercel-like runtime (e.g., `vercel dev`) to exercise the chat API locally, or proxy requests in dev.
