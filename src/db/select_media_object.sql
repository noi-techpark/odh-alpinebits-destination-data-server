SELECT media_objects.id,
  content_type AS "contentType",
  duration,
  height,
  media_objects.license,
  width,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.categories,
  CASE
    WHEN license_holder_id IS NOT NULL
      THEN json_build_object(
        'id', license_holder_id,
        'type', 'agents'
      )
  END AS "licenseHolder",
  COUNT(media_objects.id) OVER() AS total
FROM media_objects
  LEFT JOIN resource_objects ON resource_objects.id = media_objects.id