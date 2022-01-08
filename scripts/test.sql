
CREATE TABLE IF NOT EXISTS resources (
  resource_id AUTOINCREMENT PRIMARY KEY,
  data_provider VARCHAR ( 50 ),
  created_on TIMESTAMP NOT NULL,
  last_update TIMESTAMP NOT NULL,
  url VARCHAR ( 255 )
);

ALTER TABLE resources (
  resource_id AUTOINCREMENT PRIMARY KEY,
  data_provider VARCHAR ( 50 ),
  created_on TIMESTAMP NOT NULL,
  last_update TIMESTAMP NOT NULL,
  url VARCHAR ( 255 )
);

SELECT * FROM resources;

INSERT INTO resources (resource_id, data_provider, created_on, last_update, url)
VALUES (DEFAULT, 'Claudenir', current_timestamp, current_timestamp, 'github.com/claudenirmf')
RETURNING *;

-- Adopted style guide:
--   PostgreSQL Documentation's examples
--   https://www.sqlstyle.guide/#naming-conventions