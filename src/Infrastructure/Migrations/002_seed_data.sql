-- Seed system info
INSERT INTO system_info (key, value)
VALUES ('version', jsonb_build_object('version', '0.1.0', 'initialized_at', now()))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed an admin user
INSERT INTO users (id, username, email, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@m-simulator.com', now())
ON CONFLICT (id) DO NOTHING;

-- Seed simple formulas
-- Insert formulas using the `metadata` jsonb column for description
INSERT INTO formulas (id, name, expression, metadata, created_at)
VALUES 
	('11111111-1111-1111-1111-111111111111', 'brut_to_net_estimate', 'Brut - (Brut * 0.217)', jsonb_build_object('description','Simple brut->net using non-cadre pct'), now()),
	('22222222-2222-2222-2222-222222222222', 'employer_cost_estimate', 'Brut * 1.45', jsonb_build_object('description','Simple employer cost estimate'), now()),
	('33333333-3333-3333-3333-333333333333', 'cdd_prime_pct', 'TotalBruts * 0.10', jsonb_build_object('description','CDD prime 10% default'), now())
ON CONFLICT (id) DO NOTHING;
