SELECT categories.id AS "id",
  categories.resource_id AS "resource_id",
  categories.namespace AS "namespace",
  COALESCE(data_provider) AS "dataProvider",
  COALESCE(last_update) AS "lastUpdate",
  COALESCE(type) AS "type",
  COALESCE(categoryAbstracts.abstract, 'null') AS "abstract",
  COALESCE(categoryDescriptions.description, 'null') AS "description",
  COALESCE(categoryNames.name, 'null') AS "name",
  COALESCE(coveredTypes."resourceTypes") AS "resourceTypes",
  COALESCE(categoryShortNames."shortName", 'null') AS "shortName",
  COALESCE(
    to_json(resources.simple_url),
    categoryUrls.url,
    'null'
  ) AS "url",
  COALESCE(childrenCategories.children) AS "children",
  COALESCE(parentCategories.parents) AS "parents"
FROM categories
  LEFT JOIN resources ON resources.id = categories.resource_id
  LEFT JOIN (
    SELECT category_id,
      json_agg(to_json("type")) AS "resourceTypes"
    FROM category_covered_types
    GROUP BY category_id
  ) AS coveredTypes ON coveredTypes.category_id = categories.id
  LEFT JOIN (
    SELECT parent_id AS "parent_id",
      json_agg(
        json_build_object(
          'id',
          child_id,
          'type',
          'categories'
        )
      ) AS "children"
    FROM category_specializations
    GROUP BY parent_id
  ) AS childrenCategories ON childrenCategories.parent_id = categories.id
  LEFT JOIN (
    SELECT child_id AS "child_id",
      json_agg(
        json_build_object(
          'id',
          parent_id,
          'type',
          'categories'
        )
      ) AS "parents"
    FROM category_specializations
    GROUP BY child_id
  ) AS parentCategories ON parentCategories.child_id = categories.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS categoryAbstracts ON categoryAbstracts.id = categories.resource_id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS categoryDescriptions ON categoryDescriptions.id = categories.resource_id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS categoryNames ON categoryNames.id = categories.resource_id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "shortName"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS categoryShortNames ON categoryShortNames.id = categories.resource_id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS categoryUrls ON categoryUrls.id = categories.resource_id