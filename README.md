# MegaSimulator

MegaSimulator is a unified web and mobile platform for financial and personal simulations for people living in France. The product centralizes a large knowledge base of business rules, formulas and regulations to provide accurate and transparent simulations for loans, insurance, payroll, retirement and more.

## Vision

Provide a trustworthy, auditable, and extensible simulator suite that helps users make informed financial decisions by combining official rules, configurable assumptions, and clear explanations.

## Key Features

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

1. Clone the repo.
2. Install dependencies (per-app instructions will follow).
3. Run unit tests for `packages/sim-core`.

Or use the provided launch profile (sets local Postgres/Redis connection strings and enables Swagger):

```powershell
dotnet run --project src/Api --launch-profile LocalWithDeps
```
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
