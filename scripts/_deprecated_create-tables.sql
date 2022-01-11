
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS language_codes CASCADE;
DROP TABLE IF EXISTS resource_types CASCADE;
-- DROP TABLE IF EXISTS abstracts CASCADE;
-- DROP TABLE IF EXISTS descriptions CASCADE;
-- DROP TABLE IF EXISTS names CASCADE;
-- DROP TABLE IF EXISTS short_names CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
-- DROP TABLE IF EXISTS contact_points CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- CREATE TABLE IF NOT EXISTS resource_types (
--   type VARCHAR ( 50 ) PRIMARY KEY
-- );

CREATE TABLE IF NOT EXISTS resources (
  resource_id UUID PRIMARY KEY,
  type VARCHAR ( 50 ) NOT NULL,
  data_provider TEXT,
  created_on TIMESTAMP NOT NULL,
  last_update TIMESTAMP NOT NULL,
  abstract JSONB,
  description JSONB,
  name JSONB,
  short_name JSONB,
  url JSONB
  -- FOREIGN KEY (type)
  --   REFERENCES resource_types (type)
  --   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS language_codes (
  lang CHAR ( 3 ) PRIMARY KEY,
  english_label VARCHAR ( 50 ) NOT NULL,
  german_label VARCHAR ( 50 ),
  italian_label VARCHAR ( 50 )
);

CREATE TABLE IF NOT EXISTS abstracts (
  resource_id UUID NOT NULL,
  lang CHAR ( 3 ) NOT NULL,
  content TEXT,
  PRIMARY KEY (resource_id, lang),
  FOREIGN KEY (resource_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (lang)
    REFERENCES language_codes (lang)
    ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS descriptions (
--   resource_id UUID NOT NULL,
--   lang CHAR ( 3 ) NOT NULL,
--   content TEXT,
--   PRIMARY KEY (resource_id, lang),
--   FOREIGN KEY (resource_id)
--     REFERENCES resources (resource_id)
--     ON DELETE CASCADE,
--   FOREIGN KEY (lang)
--     REFERENCES language_codes (lang)
--     ON DELETE CASCADE
-- );


-- CREATE TABLE IF NOT EXISTS names (
--   resource_id UUID NOT NULL,
--   lang CHAR ( 3 ) NOT NULL,
--   content TEXT,
--   PRIMARY KEY (resource_id, lang),
--   FOREIGN KEY (resource_id)
--     REFERENCES resources (resource_id)
--     ON DELETE CASCADE,
--   FOREIGN KEY (lang)
--     REFERENCES language_codes (lang)
--     ON DELETE CASCADE
-- );


-- CREATE TABLE IF NOT EXISTS short_names (
--   resource_id UUID NOT NULL,
--   lang CHAR ( 3 ) NOT NULL,
--   content TEXT,
--   PRIMARY KEY (resource_id, lang),
--   FOREIGN KEY (resource_id)
--     REFERENCES resources (resource_id)
--     ON DELETE CASCADE,
--   FOREIGN KEY (lang)
--     REFERENCES language_codes (lang)
--     ON DELETE CASCADE
-- );

-- TODO: is it better to rename the ID column depending on the resource type?

CREATE TABLE IF NOT EXISTS agents (
  agent_id UUID NOT NULL,
  contact_points JSONB,
  PRIMARY KEY (agent_id),
  FOREIGN KEY (agent_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS contact_points (
--   agent_id UUID NOT NULL,
--   email VARCHAR ( 255 ),
--   telephone VARCHAR ( 50 ),
--   available_hours JSON,
--   FOREIGN KEY (agent_id)
--     REFERENCES agents (agent_id)
--     ON DELETE CASCADE
-- );

CREATE TABLE IF NOT EXISTS tests (
  test_id SERIAL PRIMARY KEY,
  content JSONB
);