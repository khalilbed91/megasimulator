# Payroll simulate endpoint

POST /api/payroll/simulate

Request JSON:

{
  "Brut": 3000.0,
  "Statut": "non-cadre"
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
  "IsJeiEligible": true
}

Notes:
- The endpoint uses parameterized calculations when `PayrollParams` are available.
- Simulations are persisted to the `simulations` table when persistence is configured.
- Per authenticated user, only the **10 most recent** saved simulations are kept; older rows are removed automatically (see `SimulationRepository.MaxSimulationsPerUser`).
