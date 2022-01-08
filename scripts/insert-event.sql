DELETE FROM resources
USING events
WHERE resources.resource_id = events.event_id;

DELETE FROM resources
USING agents
WHERE resources.resource_id = agents.agent_id;

-- events categories

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name)
    VALUES ('agents', 'https://www.example.com/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"Bob"}')
    RETURNING resource_id AS a_id
  ), ins2 AS (
    INSERT INTO agents (agent_id)
    SELECT a_id FROM ins1
  ), ins3 AS (
    INSERT INTO resources_categories (categorized_resource_id, category_id)
    SELECT a_id, 'alpinebits:person' FROM ins1
  ), ins4 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update)
    VALUES ('events', 'https://www.example.com/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING resource_id AS e_id
  ), ins5 AS (
    INSERT INTO events (event_id, capacity, end_date, start_date, status, publisher_id)
    SELECT ins4.e_id, NULL, '2022-01-01', '2022-01-31', 'published', ins1.a_id FROM ins1, ins4
  )
INSERT INTO resources_categories (categorized_resource_id, category_id)
SELECT e_id, 'schema:BusinessEvent' FROM ins4;

SELECT *
FROM resources
INNER JOIN events ON resources.resource_id = events.event_id;

SELECT * FROM resources_categories;