SELECT events.id,
  in_person_capacity AS "inPersonCapacity",
  online_capacity AS "onlineCapacity",
  end_date AS "endDate",
  recorded,
  start_date AS "startDate",
  status,
  COALESCE(to_json(events.simple_participation_url), participation_url_objects.participation_url) AS "participationUrl",
  COALESCE(to_json(events.simple_registration_url), registration_url_objects.registration_url) AS "registrationUrl",
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  COALESCE(contributors_array.contributors) AS "contributors",
  COALESCE(organizers_array.organizers) AS "organizers",
  CASE
    WHEN publisher_id IS NOT NULL
      THEN json_build_object(
        'id', publisher_id,
        'type', 'agents'
      )
  END AS "publisher",
  CASE
    WHEN series_id IS NOT NULL
      THEN json_build_object(
        'id', series_id,
        'type', 'eventSeries'
      )
  END AS "series",
  COALESCE(sponsors_array.sponsors) AS "sponsors",
  COALESCE(sub_events_array.sub_events) AS "subEvents",
  COALESCE(event_venues_array.venues) AS "venues",
  COUNT(events.id) OVER() AS total
FROM events
  LEFT JOIN resource_objects ON resource_objects.id = events.id
  LEFT JOIN (
    SELECT event_id AS "id",
      json_agg(
        json_build_object(
          'id', contributor_id,
          'type', 'agents'
        )
      ) AS "contributors"
    FROM contributors
    GROUP BY event_id
  ) AS contributors_array ON contributors_array.id = events.id
  LEFT JOIN (
    SELECT event_id AS "id",
      json_agg(
        json_build_object(
          'id', organizer_id,
          'type', 'agents'
        )
      ) AS "organizers"
    FROM organizers
    GROUP BY event_id
  ) AS organizers_array ON organizers_array.id = events.id
  LEFT JOIN (
    SELECT event_id AS "id",
      json_agg(
        json_build_object(
          'id', sponsor_id,
          'type', 'agents'
        )
      ) AS "sponsors"
    FROM sponsors
    GROUP BY event_id
  ) AS sponsors_array ON sponsors_array.id = events.id
  LEFT JOIN (
    SELECT events.id AS "id",
      json_agg(
        json_build_object(
          'id', parent_id,
          'type', 'events'
        )
      ) FILTER (WHERE parent_id IS NOT NULL) AS "sub_events"
    FROM events
    GROUP BY id
  ) AS sub_events_array ON sub_events_array.id = events.id
  LEFT JOIN (
    SELECT event_id AS "id",
      json_agg(
        json_build_object(
          'id', venue_id,
          'type', 'venues'
        )
      ) FILTER (WHERE venue_id IS NOT NULL) AS "venues",
      postgis_geography
    FROM (
      SELECT
        event_id,
        venue_id,
        CASE
          WHEN places.geometries IS NOT NULL
            THEN ST_GeomFromGeoJSON(places.geometries->0) ::geography
        END AS "postgis_geography"
      FROM event_venues
      LEFT JOIN places ON places.id = event_venues.venue_id
      GROUP BY venue_id, event_id, places.geometries
    ) AS "event_venues_plus"
    GROUP BY event_id, event_venues_plus.postgis_geography
  ) AS event_venues_array ON event_venues_array.id = events.id
  LEFT JOIN participation_url_objects ON participation_url_objects.id = events.id
  LEFT JOIN registration_url_objects ON registration_url_objects.id = events.id