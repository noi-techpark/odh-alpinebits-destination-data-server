SELECT events.id,
  capacity,
  end_date AS "endDate",
  start_date AS "startDate",
  status,
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
  COALESCE(sub_events_array.sub_events) AS "subEvents"
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