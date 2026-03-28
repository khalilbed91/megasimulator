-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create salaires table
CREATE TABLE IF NOT EXISTS salaires (
  id uuid PRIMARY KEY,
  employeeid uuid NOT NULL,
  basesalary numeric(18,2) NOT NULL,
  bonuses numeric(18,2) NOT NULL,
  effectivedate timestamptz NOT NULL
);

-- Create formulas table (store business formulas as JSON or text)
CREATE TABLE IF NOT EXISTS formulas (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  expression text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create system_info table
CREATE TABLE IF NOT EXISTS system_info (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_salaires_employeeid ON salaires(employeeid);

-- Create simulations table to store user simulation history
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY,
  userid uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_simulations_userid ON simulations(userid);
