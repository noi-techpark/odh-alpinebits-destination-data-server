DELETE FROM resources
USING categories
WHERE resources.resource_id = categories.resource_id;

-- lifts categories

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"cablecar"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'scablecar', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"chairlift"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:chairlift', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"funicular"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:funicular', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"gondola"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:gondola', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"magic-carpet"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:magic-carpet', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"skibus"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:skibus', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"skilift"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:skilift', rid, 'alpinebits', '["lifts"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"train"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:train', rid, 'alpinebits', '["lifts"]' FROM ins1;

-- skiSlopes categories

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"ski-slope"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:ski-slope', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"sledge-slope"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:sledge-slope', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"cross-country"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:cross-country', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"hiking"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:hiking', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

-- TODO: review categories that do not make sense on ski slopes but did with trails

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"mountain-bike"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:mountain-bike', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng":"climbing"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:climbing', rid, 'alpinebits', '["skiSlopes"]' FROM ins1;

-- agent categories

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"deu":"Organisation","ita":"Organizzazione","eng": "Organization"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:organization', rid, 'alpinebits', '["agents"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update,name)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"deu":"Person","ita":"Persona","eng": "Person"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'alpinebits:person', rid, 'alpinebits', '["agents"]' FROM ins1;

-- events categories
-- TODO: add descriptions
-- TODO: add relationships when possible

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Business Event"}', '{"eng":"https://schema.org/BusinessEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:BusinessEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Childrens Event"}', '{"eng":"https://schema.org/ChildrensEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:ChildrensEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Comedy Event"}', '{"eng":"https://schema.org/ComedyEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:ComedyEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Course Instance"}', '{"eng":"https://schema.org/CourseInstance"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:CourseInstance', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Dance Event"}', '{"eng":"https://schema.org/DanceEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:DanceEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Delivery Event"}', '{"eng":"https://schema.org/DeliveryEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:DeliveryEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Education Event"}', '{"eng":"https://schema.org/EducationEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:EducationEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Event Series"}', '{"eng":"https://schema.org/EventSeries"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:EventSeries', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Exhibition Event"}', '{"eng":"https://schema.org/ExhibitionEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:ExhibitionEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Festival"}', '{"eng":"https://schema.org/Festival"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:Festival', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Food Event"}', '{"eng":"https://schema.org/FoodEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:FoodEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Hackathon"}', '{"eng":"https://schema.org/Hackathon"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:Hackathon', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Literary Event"}', '{"eng":"https://schema.org/LiteraryEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:LiteraryEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Music Event"}', '{"eng":"https://schema.org/MusicEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:MusicEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Publication Event"}', '{"eng":"https://schema.org/PublicationEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:PublicationEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Sale Event"}', '{"eng":"https://schema.org/SaleEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:SaleEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Screening Event"}', '{"eng":"https://schema.org/ScreeningEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:ScreeningEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Social Event"}', '{"eng":"https://schema.org/SocialEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:SocialEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Sports Event"}', '{"eng":"https://schema.org/SportsEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:SportsEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Theater Event"}', '{"eng":"https://schema.org/TheaterEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:TheaterEvent', rid, 'alpinebits', '["events"]' FROM ins1;

WITH ins1 AS (
    INSERT INTO resources (type, data_provider, created_on, last_update, name, url)
    VALUES ('categories', 'https://www.alpinebits.org/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"eng": "Visual Arts Event"}', '{"eng":"https://schema.org/VisualArtsEvent"}')
    RETURNING resource_id AS rid
  )
INSERT INTO categories (category_id, resource_id, namespace, resource_types)
SELECT 'schema:VisualArtsEvent', rid, 'alpinebits', '["events"]' FROM ins1;

SELECT category_id, categories.resource_id, namespace, resource_types, name FROM categories LEFT JOIN resources ON resources.resource_id = categories.resource_id;
