-- -- -- -- -- -- setup -- -- -- -- -- --


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT uuid_generate_v4();


-- -- -- -- -- -- clean existing table -- -- -- -- -- --


DROP TABLE IF EXISTS tests CASCADE;

DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS media_objects CASCADE;
DROP TABLE IF EXISTS event_series CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS mountain_areas CASCADE;
DROP TABLE IF EXISTS lifts CASCADE;
DROP TABLE IF EXISTS ski_slopes CASCADE;
DROP TABLE IF EXISTS snowparks CASCADE;

DROP TABLE IF EXISTS multimedia_descriptions CASCADE;
DROP TABLE IF EXISTS resources_categories CASCADE;
DROP TABLE IF EXISTS snowpark_features CASCADE;
DROP TABLE IF EXISTS category_specializations CASCADE;
DROP TABLE IF EXISTS feature_specializations CASCADE;
DROP TABLE IF EXISTS events_contributors CASCADE;
DROP TABLE IF EXISTS events_organizers CASCADE;
DROP TABLE IF EXISTS events_sponsors CASCADE;
DROP TABLE IF EXISTS events_venues CASCADE;
DROP TABLE IF EXISTS place_connections CASCADE;


-- -- -- -- -- -- tests table -- -- -- -- -- --


CREATE TABLE tests (
  test_id SERIAL PRIMARY KEY,
  content JSONB
);


-- -- -- -- -- -- resources tables -- -- -- -- -- --
-- ordering picked by degree of generality and required precedence preceden (for referencing)


CREATE TABLE resources (
  resource_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  odh_id VARCHAR ( 50 ),
  type VARCHAR ( 50 ) NOT NULL,
  data_provider TEXT,
  created_on TIMESTAMP NOT NULL,
  last_update TIMESTAMP NOT NULL,
  abstract JSONB,
  description JSONB,
  name JSONB,
  short_name JSONB,
  url JSONB
);

-- TODO: is it better to rename the ID column depending on the resource type?

CREATE TABLE agents (
  agent_id UUID NOT NULL,
  contact_points JSONB,
  PRIMARY KEY (agent_id),
  FOREIGN KEY (agent_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE
);

-- TODO: review it is better to keep a table of resource types; this may facilitate some queries like "what categories apply to some resource type?"; the same question applies to features

CREATE TABLE categories (
  category_id VARCHAR ( 100 ) PRIMARY KEY,
  resource_id UUID NOT NULL,
  namespace VARCHAR ( 50 ) NOT NULL,
  resource_types JSONB,
  FOREIGN KEY (resource_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE
);

CREATE TABLE features (
  feature_id VARCHAR ( 100 ) PRIMARY KEY,
  resource_id UUID NOT NULL,
  namespace VARCHAR ( 50 ) NOT NULL,
  resource_types JSONB,
  FOREIGN KEY (resource_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE
);

-- TODO: review whether we should use TEXT as data type on content_type instead
-- TODO: review the choice of setting the copyright owner column to null when the copyright owner agent is deleted

CREATE TABLE media_objects (
  media_object_id UUID NOT NULL,
  content_type VARCHAR ( 255 ),
  duration INT,
  height INT,
  license VARCHAR ( 50 ),
  width INT,
  copyright_owner_id UUID,
  PRIMARY KEY (media_object_id),
  FOREIGN KEY (media_object_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (copyright_owner_id)
    REFERENCES agents (agent_id)
    ON DELETE SET NULL
);

CREATE TABLE event_series (
  series_id UUID NOT NULL,
  frequency VARCHAR ( 50 ),
  PRIMARY KEY (series_id),
  FOREIGN KEY (series_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE
);

-- TODO: review how to represent geometries with PostgreSQL

CREATE TABLE places (
  place_id UUID PRIMARY KEY,
  address JSONB,
  geometries JSONB,
  how_to_arrive JSONB,
  length INT,
  max_altitude INT,
  min_altitude INT,
  opening_hours JSONB,
  snow_condition JSONB
);

CREATE TABLE venues (
  venue_id UUID NOT NULL,
  place_id UUID NOT NULL,
  PRIMARY KEY (venue_id),
  FOREIGN KEY (venue_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE
);

-- TODO: review the choice of setting the event series column to null when the event series is deleted
-- TODO: review the choice for representing events' status; should we consider an enumeration or an additional table instead?

CREATE TABLE events (
  event_id UUID NOT NULL,
  capacity INT,
  end_date TIMESTAMP,
  start_date TIMESTAMP,
  status VARCHAR ( 10 ),
  series_id UUID,
  publisher_id UUID NOT NULL,
  parent_event_id UUID,
  PRIMARY KEY (event_id),
  FOREIGN KEY (event_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (series_id)
    REFERENCES event_series (series_id)
    ON DELETE SET NULL,
  FOREIGN KEY (publisher_id)
    REFERENCES agents (agent_id)
    ON DELETE CASCADE,
  FOREIGN KEY (parent_event_id)
    REFERENCES events (event_id)
    ON DELETE CASCADE
);

CREATE TABLE mountain_areas (
  mountain_area_id UUID NOT NULL,
  place_id UUID NOT NULL,
  area_owner_id UUID,
  area INT,
  total_park_length INT,
  total_slope_length INT,
  PRIMARY KEY (mountain_area_id),
  FOREIGN KEY (mountain_area_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE,
  FOREIGN KEY (area_owner_id)
    REFERENCES agents (agent_id)
    ON DELETE SET NULL
);

CREATE TABLE lifts (
  lift_id UUID NOT NULL,
  place_id UUID NOT NULL,
  mountain_area_id UUID,
  capacity INT,
  persons_per_chair INT,
  PRIMARY KEY (lift_id),
  FOREIGN KEY (lift_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE,
  FOREIGN KEY (mountain_area_id)
    REFERENCES mountain_areas (mountain_area_id)
    ON DELETE SET NULL
);

CREATE TABLE ski_slopes (
  ski_slope_id UUID NOT NULL,
  place_id UUID NOT NULL,
  mountain_area_id UUID,
  difficulty_eu VARCHAR ( 20 ),
  difficulty_us VARCHAR ( 20 ),
  PRIMARY KEY (ski_slope_id),
  FOREIGN KEY (ski_slope_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE,
  FOREIGN KEY (mountain_area_id)
    REFERENCES mountain_areas (mountain_area_id)
    ON DELETE SET NULL
);

CREATE TABLE snowparks (
  snowpark_id UUID NOT NULL,
  place_id UUID NOT NULL,
  mountain_area_id UUID,
  difficulty VARCHAR ( 20 ),
  PRIMARY KEY (snowpark_id),
  FOREIGN KEY (snowpark_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE,
  FOREIGN KEY (mountain_area_id)
    REFERENCES mountain_areas (mountain_area_id)
    ON DELETE CASCADE
);


-- -- -- -- -- -- relationship tables -- -- -- -- -- --


CREATE TABLE resources_categories (
  categorized_resource_id UUID NOT NULL,
  category_id VARCHAR ( 100 ) NOT NULL,
  PRIMARY KEY (categorized_resource_id, category_id),
  FOREIGN KEY (categorized_resource_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (category_id)
    REFERENCES categories (category_id)
    ON DELETE CASCADE
);

CREATE TABLE snowpark_features (
  snowpark_id UUID NOT NULL,
  feature_id VARCHAR ( 100 ) NOT NULL,
  PRIMARY KEY (snowpark_id, feature_id),
  FOREIGN KEY (snowpark_id)
    REFERENCES snowparks (snowpark_id)
    ON DELETE CASCADE,
  FOREIGN KEY (feature_id)
    REFERENCES features (feature_id)
    ON DELETE CASCADE
);

CREATE TABLE multimedia_descriptions (
  resource_id UUID NOT NULL,
  media_object_id UUID NOT NULL,
  PRIMARY KEY (resource_id, media_object_id),
  FOREIGN KEY (resource_id)
    REFERENCES resources (resource_id)
    ON DELETE CASCADE,
  FOREIGN KEY (media_object_id)
    REFERENCES media_objects (media_object_id)
    ON DELETE CASCADE
);

CREATE TABLE category_specializations (
  parent_id VARCHAR ( 100 ) NOT NULL,
  child_id VARCHAR ( 100 ) NOT NULL,
  PRIMARY KEY (parent_id, child_id),
  FOREIGN KEY (parent_id)
    REFERENCES categories (category_id)
    ON DELETE CASCADE,
  FOREIGN KEY (child_id)
    REFERENCES categories (category_id)
    ON DELETE CASCADE
);

CREATE TABLE feature_specializations (
  parent_id VARCHAR ( 100 ) NOT NULL,
  child_id VARCHAR ( 100 ) NOT NULL,
  PRIMARY KEY (parent_id, child_id),
  FOREIGN KEY (parent_id)
    REFERENCES features (feature_id)
    ON DELETE CASCADE,
  FOREIGN KEY (child_id)
    REFERENCES features (feature_id)
    ON DELETE CASCADE
);

CREATE TABLE events_contributors (
  event_id UUID NOT NULL,
  contributor_id UUID NOT NULL,
  PRIMARY KEY (event_id, contributor_id),
  FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON DELETE CASCADE,
  FOREIGN KEY (contributor_id)
    REFERENCES agents (agent_id)
    ON DELETE CASCADE
);

CREATE TABLE events_organizers (
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  PRIMARY KEY (event_id, organizer_id),
  FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON DELETE CASCADE,
  FOREIGN KEY (organizer_id)
    REFERENCES agents (agent_id)
    ON DELETE CASCADE
);

CREATE TABLE events_sponsors (
  event_id UUID NOT NULL,
  sponsor_id UUID NOT NULL,
  PRIMARY KEY (event_id, sponsor_id),
  FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON DELETE CASCADE,
  FOREIGN KEY (sponsor_id)
    REFERENCES agents (agent_id)
    ON DELETE CASCADE
);

CREATE TABLE events_venues (
  event_id UUID NOT NULL,
  venue_id UUID NOT NULL,
  PRIMARY KEY (event_id, venue_id),
  FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON DELETE CASCADE,
  FOREIGN KEY (venue_id)
    REFERENCES venues (venue_id)
    ON DELETE CASCADE
);

CREATE TABLE place_connections (
  place_a_id UUID NOT NULL,
  place_b_id UUID NOT NULL,
  PRIMARY KEY (place_a_id, place_b_id),
  FOREIGN KEY (place_a_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_b_id)
    REFERENCES places (place_id)
    ON DELETE CASCADE
);
