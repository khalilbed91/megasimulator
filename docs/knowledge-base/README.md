# Knowledge Base — MegaSimulator

This folder contains formalized business rules, formulas, test vectors and source citations used by MegaSimulator. Each domain has a human-readable specification and machine-friendly formula entries.

Structure
- `loans.md` — loan product rules, amortization formulas, conventions.
- `payroll.md` — salary, social charges, gross↔net rules and cases.
- `insurance.md` — insurance premium rules and product-specific notes.
- `retirement.md` — pension projection rules and assumptions.
- `formula-schema.md` — schema for documenting formulas (JSON/Markdown).

Guidelines
- **Production deploy & Postgres (tunnel SSH)** : see repository root **`deploy/DEPLOY.md`**.
- Saved **user simulations** (payroll / retirement / loans) are stored in PostgreSQL with a **maximum of 10 rows per user** (oldest removed automatically). See `SimulationRepository` and `docs/knowledge-base/payroll-simulate.md`.
- Each formula entry must include: `id`, `name`, `domain`, `description`, `inputs`, `outputs`, `units`, `formula` (text + canonical form), `source` (link), and `testVectors`.
- Test vectors should cover edge cases and typical use cases with expected outputs.
- Changes require source citation and test updates.
