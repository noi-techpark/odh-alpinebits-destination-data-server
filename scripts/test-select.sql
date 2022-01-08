-- SELECT * FROM resources;
-- SELECT * FROM abstracts;
-- SELECT * FROM resource_types;
-- SELECT * FROM language_codes WHERE lang = 'eng' OR lang = 'ita' OR lang = 'deu';

-- SELECT DISTINCT resources.resource_id, abstracts.lang absl, abstracts.content abs, descriptions.lang descl, descriptions.content desc, names.lang naml, names.content nam, short_names.lang snaml, short_names.content snam
-- -- SELECT resources.resource_id, descriptions.lang descl, descriptions.content desc, names.lang naml, names.content nam
-- FROM resources
-- LEFT JOIN agents ON resources.resource_id = agents.resource_id
-- LEFT JOIN abstracts ON resources.resource_id = abstracts.resource_id
-- LEFT JOIN descriptions ON resources.resource_id = descriptions.resource_id
-- LEFT JOIN short_names ON resources.resource_id = short_names.resource_id
-- LEFT JOIN names ON resources.resource_id = names.resource_id;

-- SELECT test_id, array_to_json(array_agg(x))
-- FROM tests, json_array_elements(tests.content) x
-- WHERE
--   x ->> 'n' = '2'
-- GROUP BY test_id;

-- SELECT test_id, content
-- FROM tests
-- WHERE
--   content::jsonb  @? '$[*] ? (@.n < 2)'
--   OR json_array_length(content) = 0;

-- DELETE FROM resources
-- USING categories
-- WHERE
--   resources.resource_id = categories.resource_id
--   AND categories.resource_types @? '$[*] ? (@ == "lifts")';

-- SELECT *
-- FROM categories
-- LEFT JOIN resources ON resources.resource_id = categories.resource_id;

-- SELECT resource_types, resource_types @? '$[*] ? (@ == "lifts")'
-- FROM categories;

-- INSERT INTO resources_categories (categorized_resource_id, category_id)
-- VALUES ('99696cd1-17f8-4b67-b16e-3f3f3e3afa2a', 'schema:BusinessEvent')
-- RETURNING *;

-- INSERT INTO resources_categories (categorized_resource_id, category_id)
-- VALUES ('99696cd1-17f8-4b67-b16e-3f3f3e3afa2a', 'alpinebits:BusinessEvent')
-- RETURNING *;

-- SELECT * FROM resources WHERE type = 'events';
-- SELECT * FROM categories; -- WHERE category_id = 'schema:BusinessEvent';
-- SELECT * FROM categories WHERE category_id = 'alpinebits:BusinessEvent';

-- DELETE FROM events RETURNING *;
DELETE FROM resources WHERE resource_id = '493bfb50-e179-4dda-ab22-4e30bf9b2f3f' RETURNING *;
SELECT * FROM resources_categories;