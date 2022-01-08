-- INSERT INTO resources (resource_id, type, data_provider, created_on, last_update, url)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'agents', 'Claudenir', current_timestamp, current_timestamp, 'github.com/claudenirmf'),
--   ('61422793-9b87-4b28-8bea-ff50f5d221c7', 'agents', 'Claudenir', current_timestamp, current_timestamp, 'github.com/claudenirmf')
-- RETURNING *;

-- INSERT INTO abstracts (resource_id, lang, content)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'eng', 'Claudenir is not a robot'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'por', 'Claudenir não é um robô')
-- RETURNING *;

-- INSERT INTO descriptions (resource_id, lang, content)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'eng', 'Claudenir is not a robot because he passed a captcha check'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'por', 'Claudenir não é um robô pois passou por um teste captcha'),
--   ('61422793-9b87-4b28-8bea-ff50f5d221c7', 'deu', 'Danke')
-- RETURNING *;

-- INSERT INTO names (resource_id, lang, content)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'eng', 'Claudenir M. F.'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'ita', 'M. F., Claudenir'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'deu', 'M. F., Claudenir'),
--   ('61422793-9b87-4b28-8bea-ff50f5d221c7', 'deu', 'Gustav')
-- RETURNING *;

-- INSERT INTO short_names (resource_id, lang, content)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'eng', 'Claudenir'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'ita', 'Claudenir'),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'deu', 'Claudenir')
-- RETURNING *;

-- INSERT INTO agents (agent_id)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6')
-- RETURNING *;

-- INSERT INTO contact_points (agent_id, email, telephone, available_hours)
-- VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'claudennir@email.com', DEFAULT, DEFAULT),
--   ('71422793-9b87-4b28-8bea-ff50f5d221c6', DEFAULT, '+1 555 54321', '[]')
-- RETURNING *;

INSERT INTO resources (resource_id, type, data_provider, created_on, last_update, url)
VALUES ('71422793-9b87-4b28-8bea-ff50f5d221c6', 'agents', 'Claudenir', current_timestamp, current_timestamp, '"github.com/claudenirmf"'),
  ('61422793-9b87-4b28-8bea-ff50f5d221c7', 'agents', 'Claudenir', current_timestamp, current_timestamp, '"github.com/claudenirmf"')
RETURNING *;

INSERT INTO tests (content)
VALUES ('[ { "n": 1 }, { "n": 2 }, { "n": 3 }, { "n": 4 } ]'),
  ('[  ]'),
  ('[ { "n": 1 }, { "n": 2 } ]'),
  ('[ { "n": 3 }, { "n": 4 } ]'),
  ('"www.example.com"'),
  ('{ "eng": "www.example.com" }')
RETURNING *;
