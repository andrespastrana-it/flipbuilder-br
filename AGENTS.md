# AGENTS.md

## Cursor Cloud specific instructions

FlipBuilder BR is a single **Next.js 16 (App Router, Turbopack)** app for planning/pricing/advertising gaming-PC flips in Brazil. It uses **Firebase** (Google Auth + Firestore) on the client and the **Gemini API** in server-side route handlers under `app/api/gemini/*`. There is no separate backend service and no automated test suite.

### Package manager
Use **pnpm** (`pnpm-lock.yaml` + `pnpm-workspace.yaml` are the source of truth), even though `README.md` says npm. `package-lock.json` and `bun.lock` also exist but are not used here. Native build scripts (`sharp`, `@tailwindcss/oxide`, etc.) are auto-approved via the `allowBuilds` list in `pnpm-workspace.yaml`, so installs need no interactive approval.

### Commands
Scripts live in `package.json`: `pnpm run dev` (dev server, port 3000), `pnpm run lint` (eslint), `pnpm run build` / `pnpm run start` (production). There is no `test` script. Type-check with `pnpm exec tsc --noEmit` (the build enforces types — `ignoreBuildErrors: false`).

### Environment
`GEMINI_API_KEY` is required for every `app/api/gemini/*` route. It is provided as a Cloud secret (injected into the environment); the dev server also reads `.env.local`. `.env*` is gitignored, so recreate `.env.local` from the env var if needed (`printf 'GEMINI_API_KEY="%s"\n' "$GEMINI_API_KEY" > .env.local`). The Firebase web config is hardcoded in `lib/firebase.ts` (project `pcbuilder-a655a`); it is not env-driven.

### Non-obvious gotchas
- The entire UI is gated behind **Google sign-in** (`components/AuthProvider.tsx`). Headless/automated login against the third-party `pcbuilder-a655a` Firebase project is not feasible without a real allowed Google account, so the authenticated UI (builder, saved builds, admin seed, ad UI) generally can't be driven end-to-end in the VM. Test the **core AI features directly via the API routes** instead, e.g. `curl -X POST localhost:3000/api/gemini/ad-generator -H 'Content-Type: application/json' -d '{"build":"...","price":"5990"}'`.
- There are duplicate route trees: `app/api/*` and `app/api/gemini/*` implement the same handlers; the app calls the `gemini`-prefixed ones.
- `pnpm run lint` currently reports **5 pre-existing errors** (React 19 hooks-purity rules in `components/PartCard.tsx`, `components/BuildProvider.tsx`, `hooks/use-mobile.ts`). These are existing code issues, not setup problems.
- The `build-assistant` route can return HTTP 500 with `Unterminated string in JSON` when Gemini emits a very long response that overflows `JSON.parse`; this is existing model/parse behavior, not an environment fault. Gemini routes use `thinkingLevel: HIGH` and can take tens of seconds (search-grounded `price-search`/`estimator` are slower and hit the live web).
