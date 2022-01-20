SELECT media_objects.id,
  content_type AS "contentType",
  duration,
  height,
  media_objects.license,
  width,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  -- license, -- TODO: re-enable license information on meta
  license_holder AS "licenseHolder",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.categories,
  CASE
    WHEN copyright_owner_id IS NOT NULL
      THEN json_build_object(
        'id', copyright_owner_id,
        'type', 'agents'
      )
  END AS "copyrightOwner"
FROM media_objects
  LEFT JOIN resource_objects ON resource_objects.id = media_objects.id