-- Create simulation_results table to store computed results for simulations (audit & analytics)
CREATE TABLE IF NOT EXISTS simulation_results (
  id uuid PRIMARY KEY,
  simulation_id uuid NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulation_results_simulation_id ON simulation_results(simulation_id);
