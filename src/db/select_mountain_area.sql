SELECT mountain_areas.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  area,
  total_park_area AS "totalParkArea",
  total_slope_length AS "totalSlopeLength",
  CASE
    WHEN area_owner_id IS NOT NULL
      THEN json_build_object(
        'id', area_owner_id,
        'type', 'agents'
      )
  END AS "areaOwner",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  place_objects.geometries,
  place_objects.how_to_arrive AS "howToArrive",
  place_objects.max_altitude AS "maxAltitude",
  place_objects.min_altitude AS "minAltitude",
  place_objects.opening_hours AS "openingHours",
  snow_condition_objects.snow_condition AS "snowCondition",
  connections_arrays.connections,
  area_lifts_arrays.lifts,
  area_ski_slopes_arrays.ski_slopes AS "skiSlopes",
  area_snowparks_arrays.snowparks,
  sub_areas_arrays.sub_areas AS "subAreas",
  COUNT(mountain_areas.id) OVER() AS total
FROM mountain_areas
  LEFT JOIN resource_objects ON resource_objects.id = mountain_areas.id
  LEFT JOIN place_objects ON place_objects.id = mountain_areas.id
  LEFT JOIN snow_condition_objects ON snow_condition_objects.id = mountain_areas.id
  LEFT JOIN connections_arrays ON connections_arrays.id = mountain_areas.id
  LEFT JOIN area_lifts_arrays ON area_lifts_arrays.id = mountain_areas.id
  LEFT JOIN area_ski_slopes_arrays ON area_ski_slopes_arrays.id = mountain_areas.id
  LEFT JOIN area_snowparks_arrays ON area_snowparks_arrays.id = mountain_areas.id
  LEFT JOIN sub_areas_arrays ON sub_areas_arrays.id = mountain_areas.id