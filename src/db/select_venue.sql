SELECT venues.id,
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
  place_objects.address,
  place_objects.geometries,
  place_objects.how_to_arrive AS "howToArrive"
FROM venues
  LEFT JOIN resource_objects ON resource_objects.id = venues.id
  LEFT JOIN place_objects ON place_objects.id = venues.id