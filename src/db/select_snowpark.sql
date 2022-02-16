SELECT snowparks.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  difficulty,
  resource_objects.url,
  resource_objects.categories,
  resource_objects.features,
  resource_objects.media AS "multimediaDescriptions",
  place_objects.address,
  place_objects.length,
  place_objects.geometries,
  place_objects.how_to_arrive AS "howToArrive",
  place_objects.max_altitude AS "maxAltitude",
  place_objects.min_altitude AS "minAltitude",
  place_objects.opening_hours AS "openingHours",
  snow_condition_objects.snow_condition AS "snowCondition",
  connections_arrays.connections
FROM snowparks
  LEFT JOIN resource_objects ON resource_objects.id = snowparks.id
  LEFT JOIN place_objects ON place_objects.id = snowparks.id
  LEFT JOIN snow_condition_objects ON snow_condition_objects.id = snowparks.id
  LEFT JOIN connections_arrays ON connections_arrays.id = snowparks.id