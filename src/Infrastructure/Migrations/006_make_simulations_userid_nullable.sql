-- Ensure simulations table has a nullable userid column (handles different table naming)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations') THEN
    ALTER TABLE simulations ADD COLUMN IF NOT EXISTS userid uuid;
    ALTER TABLE simulations ALTER COLUMN userid DROP NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_simulations_userid ON simulations(userid);
  END IF;

  -- In case a localized table name was used (e.g. 'simulateur'), try to alter it too
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulateur') THEN
    ALTER TABLE simulateur ADD COLUMN IF NOT EXISTS userid uuid;
    ALTER TABLE simulateur ALTER COLUMN userid DROP NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_simulateur_userid ON simulateur(userid);
  END IF;
END$$;
