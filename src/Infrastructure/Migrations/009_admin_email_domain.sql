-- Use production domain for seeded admin email (no fake m-simulator.com mailbox).
UPDATE users
SET email = 'admin@megasimulateur.org'
WHERE username = 'admin' AND (email = 'admin@m-simulator.com' OR email ILIKE '%@m-simulator.com');
