SELECT ski_slopes.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  CASE
		WHEN difficulty_eu IS NOT NULL OR difficulty_us IS NOT NULL
		  THEN json_build_object(
        'eu', difficulty_eu,
        'us', difficulty_us
		  )
	END AS "difficulty",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  place_objects.address,
  place_objects.length,
  place_objects.geometries,
  place_objects.how_to_arrive AS "howToArrive",
  place_objects.max_altitude AS "maxAltitude",
  place_objects.min_altitude AS "minAltitude",
  place_objects.opening_hours AS "openingHours",
  snow_condition_objects.snow_condition AS "snowCondition",
  connections_arrays.connections,
  COUNT(ski_slopes.id) OVER() AS total
FROM ski_slopes
  LEFT JOIN resource_objects ON resource_objects.id = ski_slopes.id
  LEFT JOIN place_objects ON place_objects.id = ski_slopes.id
  LEFT JOIN snow_condition_objects ON snow_condition_objects.id = ski_slopes.id
  LEFT JOIN connections_arrays ON connections_arrays.id = ski_slopes.id