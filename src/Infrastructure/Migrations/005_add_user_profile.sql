-- Add first_name, last_name, phone to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name text;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_name text;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone text;

-- Update admin seed with display name
UPDATE users SET first_name = 'Admin', last_name = 'User', phone = '' WHERE username = 'admin';
