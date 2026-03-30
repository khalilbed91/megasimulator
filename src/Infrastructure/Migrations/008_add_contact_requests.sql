-- Contact form submissions (stored in DB for MVP)
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY,
  userid uuid,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_userid ON contact_requests(userid);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);

