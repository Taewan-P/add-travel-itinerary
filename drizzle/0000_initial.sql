CREATE TABLE IF NOT EXISTS itineraries (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('flight', 'hotel')),
  payload_json TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  provider_message_id TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by_google_sub TEXT NOT NULL,
  created_by_email TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS itineraries_created_by_email_idx ON itineraries(created_by_email);
CREATE INDEX IF NOT EXISTS itineraries_created_at_idx ON itineraries(created_at DESC);
