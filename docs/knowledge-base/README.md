# Knowledge Base — MegaSimulator

This folder contains formalized business rules, formulas, test vectors and source citations used by MegaSimulator. Each domain has a human-readable specification and machine-friendly formula entries.

Structure
- `loans.md` — loan product rules, amortization formulas, conventions.
- `payroll.md` — salary, social charges, gross↔net rules and cases.
- `insurance.md` — insurance premium rules, product-specific notes, and postal-code referential behavior.
- `retirement.md` — pension projection rules and assumptions.
- `formula-schema.md` — schema for documenting formulas (JSON/Markdown).

Guidelines
- **Production deploy & Postgres (tunnel SSH)** : see repository root **`deploy/DEPLOY.md`**.
- Saved **user simulations** (payroll / retirement / loans / savings / insurance) are stored in PostgreSQL with a **maximum of 10 rows per user** (oldest removed automatically). See `SimulationRepository` and `docs/knowledge-base/payroll-simulate.md`.
- Postal-code autocomplete for insurance uses PostgreSQL table `france_postal_codes`, seeded from the official La Poste CSV and cached by `PostalCodeService`.
- Public simulator pages include GEO-oriented quick answers (`FAQPage` JSON-LD + visible FAQ cards) so answer engines can extract concise responses.
- Some result pages include explicit external next-step links (official or non-sponsored) after simulation. These links must not imply a partnership or transmit user data unless a real integration is later built.
- Each formula entry must include: `id`, `name`, `domain`, `description`, `inputs`, `outputs`, `units`, `formula` (text + canonical form), `source` (link), and `testVectors`.
- Test vectors should cover edge cases and typical use cases with expected outputs.
- Changes require source citation and test updates.
