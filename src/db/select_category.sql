SELECT categories.id,
  namespace,
  resource_objects.type,
  resource_types_array.types AS "resourceTypes",
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.media AS "multimediaDescriptions",
  COALESCE(children_array.children) AS "children",
  COALESCE(parents_array.parents) AS "parents",
  COUNT(categories.id) OVER() AS total
FROM categories
  LEFT JOIN resource_objects ON resource_objects.id = categories.id
  LEFT JOIN (
    SELECT category_id AS "id",
      json_agg(to_json("type")) FILTER (WHERE "type" IS NOT NULL) AS "types"
    FROM category_covered_types
    GROUP BY category_id
  ) AS resource_types_array ON resource_types_array.id = categories.id
  LEFT JOIN (
    SELECT parent_id AS "id",
      json_agg(
        json_build_object(
          'id', child_id,
          'type', 'categories'
        )
      ) FILTER (WHERE child_id IS NOT NULL) AS "children"
    FROM category_specializations
    GROUP BY parent_id
  ) AS children_array ON children_array.id = categories.id
  LEFT JOIN (
    SELECT child_id AS "id",
      json_agg(
        json_build_object(
          'id', parent_id,
          'type', 'categories'
        )
      ) FILTER (WHERE parent_id IS NOT NULL) AS "parents"
    FROM category_specializations
    GROUP BY child_id
  ) AS parents_array ON parents_array.id = categories.id