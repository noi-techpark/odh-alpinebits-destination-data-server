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
