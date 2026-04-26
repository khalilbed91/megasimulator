# Payroll simulate endpoint

POST /api/payroll/simulate

Request JSON:

Minimal:

{
  "Brut": 3000.0,
  "Statut": "non-cadre"
}

Current payroll UI:

{
  "Brut": 3000.0,
  "BrutAnnuel": 36000.0,
  "Statut": "non-cadre",
  "Parts": 0,
  "RetenuePct": 7.5,
  "Persist": true
}

Response JSON:

{
  "Net": 2349.0,
  "EmployerCost": 4350.0,
  "SocialContribution": 651.0,
  "CsgBase": 2947.5,
  "CsgDeductible": 200.0,
  "CsgNonDeductible": 85.0,
  "AgircArrco": 236.1,
  "IsJeiEligible": true,
  "RetenuePct": 7.5,
  "RetenueAmount": 176.18
}

Notes:
- The endpoint uses parameterized calculations when `PayrollParams` are available.
- `RetenuePct` applies a direct withholding percentage.
- `Parts > 0` triggers the legacy PAS quotient-family fallback only when `RetenuePct = 0`; the current frontend sends `Parts = 0`.
- Simulations are persisted to the `simulations` table when persistence is configured.
- Per authenticated user, only the **10 most recent** saved simulations are kept; older rows are removed automatically (see `SimulationRepository.MaxSimulationsPerUser`).
