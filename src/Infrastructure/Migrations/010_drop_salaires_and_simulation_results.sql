-- Remove legacy tables: no product usage (salaires API unused; payroll outputs stay in simulations.payload).
DROP TABLE IF EXISTS simulation_results;
DROP TABLE IF EXISTS salaires;
