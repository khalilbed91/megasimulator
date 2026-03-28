-- Add password_hash and roles to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash text;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['user'];

-- Set admin password and roles (password is bcrypt hash for '111aaa**')
-- Hash generated externally: $2a$12$YwzK1uYBzG1xZ6YzQp1UOuQz8wKpFhXrN0e5G/3QeKx9s1tKQhP6W
UPDATE users SET password_hash = '$2a$12$YwzK1uYBzG1xZ6YzQp1UOuQz8wKpFhXrN0e5G/3QeKx9s1tKQhP6W', roles = ARRAY['admin'] WHERE username = 'admin';

-- Ensure existing users have at least 'user' role
UPDATE users SET roles = ARRAY['user'] WHERE roles IS NULL;
