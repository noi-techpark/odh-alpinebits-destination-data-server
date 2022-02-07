SELECT event_series.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  event_series.frequency,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  COALESCE(editions_array.editions) AS "editions"
FROM event_series
  LEFT JOIN resource_objects ON resource_objects.id = event_series.id
  LEFT JOIN (
      SELECT events.series_id AS "id",
        json_agg(
          json_build_object(
            'id',
            id,
            'type',
            'events'
          )
        ) AS "editions"
      FROM events
      GROUP BY series_id
    ) AS editions_array ON editions_array.id = event_series.id