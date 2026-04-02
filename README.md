# MegaSimulator

MegaSimulator is a unified web and mobile platform for financial and personal simulations for people living in France. The product centralizes a large knowledge base of business rules, formulas and regulations to provide accurate and transparent simulations for loans, insurance, payroll, retirement and more.

## Vision

Provide a trustworthy, auditable, and extensible simulator suite that helps users make informed financial decisions by combining official rules, configurable assumptions, and clear explanations.

## Key Features

- **Simulation history**: signed-in users can review saved runs (payroll, retirement, loans); the API stores at most **10 recent simulations per user** and drops older ones automatically.
- Loan simulations: home, car, consumer — amortization schedules, total cost, APR comparisons.
- Insurance estimators: home, vehicle (car, moto, bicycle), mobile device — premiums, coverage comparison.
- Salary and payroll: convert gross ⇄ net, support for CDI/CDD, cadre/non-cadre, freelance/portage calculations.
- Retirement projection: years worked, contribution history, and estimated pension revenue.
- Centralized knowledge base: business rules, official formulas, assumptions, and sources.

## Knowledge Base & Business Rules

The knowledge base is the single source of truth for all calculations. It must contain:

- Formalized formulas and units (with provenance/source links).
- Country- and region-specific regulations (France-specific as initial scope).
- Assumptions and configurable parameters (e.g., interest conventions, tax brackets, social contribution rates).
- Tests and sample cases for each formula to validate correctness.

We'll keep a dedicated folder `docs/knowledge-base/` where each domain (loans, insurance, payroll, retirement) has:

- a human-readable specification (business rules),
- machine-readable formulas (JSON/Markdown + reference),
- test vectors and example cases.

## Architecture & Tech Stack (suggested)

- Monorepo structure to share logic across web and mobile.
- Web: Next.js + React for SSR and rich UI.
- Mobile: React Native or Flutter to reuse business logic and UI components where possible.
- Shared logic: TypeScript packages with well-tested calculation modules.
- Storage: Git for versioning formulas; optional DB (Postgres) for persisted scenarios.

## Project Layout (suggested)

- `/apps/web` — Next.js website
- `/apps/mobile` — React Native app
- `/packages/sim-core` — shared business logic, formulas, types, tests
- `/docs/knowledge-base` — business rules and data sources
- `/scripts` — helper scripts (data import, formula validation)

## Getting Started (developer)

### Backend (API)

Requires PostgreSQL (see connection string in `src/Api/Properties/launchSettings.json` profile `LocalWithDeps`).

```powershell
dotnet run --project src/Api --launch-profile LocalWithDeps
```

API listens on `http://localhost:5000` (Swagger when `ENABLE_SWAGGER=true`).

### Frontend (Vite + React)

```powershell
cd src/Frontend
npm install
npm run dev
```

App: `http://localhost:5173`. Requests to `/api` are proxied to the API on port 5000.

Each simulator has a **dedicated path** for sharing and SEO (e.g. `/simulateur-paie-brut-net`, `/simulation-retraite`, `/simulation-credit-pret`). For production builds, set **`VITE_PUBLIC_SITE_URL`** (public `https` origin, no trailing slash) so `npm run build` emits **`dist/sitemap.xml`** and **`dist/robots.txt`**. See `docs/frontend-guidelines.md` § 2.1.

Optional: copy `src/Frontend/.env.example` to `.env.local` and set `VITE_GOOGLE_CLIENT_ID` if you use a different OAuth client than the default in code.

### Google Sign-In (OAuth)

- **Sign-In with Google (GSI / ID token)** — used by the login page: only the **client ID** is needed on the server (`GOOGLE__CLIENTID` in launch profile or env). No client secret required for this flow.
- **Authorization code flow** (`/api/auth/google/callback`) — exchanging the code for tokens requires the **client secret**. Set it locally only, never commit it:
  - PowerShell for the current session: `$env:GOOGLE__CLIENTSECRET = "your-secret"`
  - Or .NET user secrets from `src/Api`:  
    `dotnet user-secrets set "GOOGLE:ClientSecret" "your-secret"`
  - Or add `GOOGLE__CLIENTSECRET` to your user-specific copy of environment variables (keep it out of git).

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), for a **Web application** client:

- **Authorized JavaScript origins:** `http://localhost:5173`
- **Authorized redirect URIs:** `http://localhost:5000/api/auth/google/callback`

Set `FRONTEND__URL` to the Vite origin (e.g. `http://localhost:5173`) so OAuth redirects back correctly.

If a client secret was ever exposed, **rotate it** in the console and update your local configuration.

#### Sign-In button shows `401 invalid_client` / `GeneralOAuthLite`

This comes from **Google** (before our API runs). Check, in order:

1. **Client type** — Create an OAuth client **“Application Web”**, not “Application de bureau / Desktop” or “TV”. The Sign-In with Google (GIS) button only works with a **Web** client ID.

2. **Authorized JavaScript origins** — Under that client, add **exactly** the origin you use in the browser (scheme + host + port, **no path**, **no trailing slash**), for example:
   - `http://localhost:5173` if you open `http://localhost:5173/...`
   - `http://127.0.0.1:5173` if you open `http://127.0.0.1:5173/...`  
   `localhost` and `127.0.0.1` are **different** origins; add both if you switch.

3. **Same client ID everywhere** — Copy the **Client ID** (ends with `.apps.googleusercontent.com`) into:
   - `VITE_GOOGLE_CLIENT_ID` in `src/Frontend/.env.local` (then restart `npm run dev`)
   - `GOOGLE__CLIENTID` for the API (launch profile or environment)  
   The ID token’s audience must match the server’s `GOOGLE__CLIENTID` when `/api/auth/google/token` verifies it.

4. **OAuth consent screen** — Configure the consent screen for the project. If the app is in **Testing**, add your Google account under **Test users**.

5. After changing `.env.local`, always restart the Vite dev server.

### Loan simulator

```powershell
# POST /api/loan/simulate — JSON body (category: immo | auto | perso, rates, optional PTZ/PAL for immo)
dotnet run --project src/Api --launch-profile LocalWithDeps
# Frontend: onglet « Prêts » après npm run dev
```

### Guest usage

Users can open the app without signing in and run payroll, retirement, loan, and savings simulations. **History** and **My account** are always reachable from the sidebar: guests see the same short “not signed in” card with **Sign in** / **Create account** (no forced redirect to payroll). Contact works for everyone.

### Production deployment (Docker / VPS)

Operational runbook: **[`deploy/DEPLOY.md`](deploy/DEPLOY.md)** — Compose stack, host Nginx, Cloudflare, environment variables, **PostgreSQL access via SSH tunnel** (pgAdmin), Google OAuth rebuild notes, and known pitfalls.

Short checklist: [`docs/planning/2026-03-31-deployment-and-domain.md`](docs/planning/2026-03-31-deployment-and-domain.md).

There is **no** public `support@m-simulator.com` or `m-simulator.com` mailbox in the product; contact goes through the in-app **Contact** form (`POST /api/contact`). The seeded **admin** profile uses **`admin@megasimulateur.org`** as its stored email (not guaranteed to be a working inbox).

## Contribution & Governance

- All formula changes must include source links and test vectors.
- Changes to business rules require review by a product owner or domain expert.

## Roadmap (first milestones)

1. Build the `sim-core` with loan and salary calculators and tests.
2. Seed the knowledge base with official sources and example vectors.
3. Create a minimal Next.js web UI to run and display simulations.
4. Create a mobile app prototype that reuses `sim-core`.

## Next Steps (now)

1. Initialize repository and commit this README.
2. Create `docs/knowledge-base/` and begin formalizing formulas for loans and payroll.

---

If you'd like, I can now initialize git, create the initial commit, and then scaffold the `packages/sim-core` and `docs/knowledge-base` folders with starter files and tests.
