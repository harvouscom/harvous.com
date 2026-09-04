-- Church interest submissions from the marketing site's one form.
--
-- Replaces Netlify Forms, which has no Cloudflare equivalent. Only what the
-- visitor typed is stored: no IP, no user agent, no fingerprinting.
--
-- Read them with:
--   wrangler d1 execute harvous-com --remote \
--     --command "select created_at, name, email, church_name, interests from church_interest order by created_at desc limit 20"

CREATE TABLE IF NOT EXISTS church_interest (
  id                     TEXT PRIMARY KEY,
  -- ISO 8601 UTC, set by the Worker.
  created_at             TEXT NOT NULL,

  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  role                   TEXT NOT NULL,
  role_other             TEXT,
  -- Comma-separated; every value comes from the form's fixed checkbox set.
  interests              TEXT NOT NULL,

  church_name            TEXT NOT NULL,
  church_city            TEXT,
  church_state           TEXT,
  -- An HMC country code, or the literal 'OTHER' with the name in the next column.
  church_country         TEXT NOT NULL,
  church_country_other   TEXT,
  church_denomination    TEXT,

  -- Set when the visitor picked a real church from the Here's My Church
  -- typeahead rather than typing a name — the join back to the directory.
  hmc_church_id          TEXT,
  hmc_short_id           TEXT
);

-- Newest first is the only way anyone reads this table.
CREATE INDEX IF NOT EXISTS church_interest_created_at
  ON church_interest (created_at DESC);

-- Someone submitting twice is signal, not an error, so this is not unique.
CREATE INDEX IF NOT EXISTS church_interest_email
  ON church_interest (email);
