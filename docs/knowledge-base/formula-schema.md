# Formula Documentation Schema

Each formula or rule must be documented in both human-readable Markdown and a machine-friendly JSON object following this schema.

Fields
- `id` (string): unique identifier, e.g., `loan.amortization.equal_payment`.
- `name` (string): short human name.
- `domain` (string): domain name, e.g., `loans`, `payroll`.
- `description` (string): plain language explanation.
- `inputs` (array): list of input parameters with `name`, `type`, `unit`, `description`.
- `outputs` (array): list of outputs with `name`, `type`, `unit`, `description`.
- `formula` (string): canonical formula expression and any assumptions.
- `implementation_notes` (string): numerical stability, rounding, conventions.
- `source` (string): URL or reference to legal text or authoritative doc.
- `testVectors` (array): example cases with `inputs` and `expectedOutputs`.

Example (JSON-like)

{
  "id": "loan.amortization.equal_payment",
  "name": "Loan - Equal Payment (French amortization)",
  "domain": "loans",
  "description": "Compute monthly payment for fixed-rate loan with equal installments.",
  "inputs": [ { "name": "principal", "type": "number", "unit": "EUR" }, { "name": "annualRate", "type": "number", "unit": "%" }, { "name": "periods", "type": "integer", "unit": "months" } ],
  "outputs": [ { "name": "payment", "type": "number", "unit": "EUR/month" } ],
  "formula": "payment = principal * r / (1 - (1+r)^-n) where r = monthlyRate",
  "source": "https://example-source.example",
  "testVectors": [ { "inputs": { "principal": 100000, "annualRate": 5, "periods": 240 }, "expectedOutputs": { "payment": 659.96 } } ]
}
