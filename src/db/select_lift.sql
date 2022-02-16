SELECT lifts.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  capacity,
  persons_per_chair AS "personsPerChair",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  place_objects.address,
  place_objects.geometries,
  place_objects.how_to_arrive AS "howToArrive",
  place_objects.length,
  place_objects.max_altitude AS "maxAltitude",
  place_objects.min_altitude AS "minAltitude",
  place_objects.opening_hours AS "openingHours",
  connections_arrays.connections
FROM lifts
  LEFT JOIN resource_objects ON resource_objects.id = lifts.id
  LEFT JOIN place_objects ON place_objects.id = lifts.id
  LEFT JOIN connections_arrays ON connections_arrays.id = lifts.id