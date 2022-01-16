SELECT media_objects.id AS "id",
  media_objects.content_type AS "contentType",
  media_objects.duration AS "duration",
  media_objects.height AS "height",
  media_objects.license AS "license",
  media_objects.width AS "width",
  COALESCE(
    json_build_object(
      'id',
      media_objects.copyright_owner_id,
      'type',
      'agents'
    )
  ) AS "copyrightOwnerId",
  resources.type AS "type",
  resources.data_provider AS "dataProvider",
  resources.last_update AS "lastUpdate",
  COALESCE(mediaAbstracts.abstract, 'null') AS "abstract",
  COALESCE(mediaDescriptions.description, 'null') AS "description",
  COALESCE(mediaNames.name, 'null') AS "name",
  COALESCE(mediaShortNames."shortName", 'null') AS "shortName",
  COALESCE(
    to_json(resources.simple_url),
    mediaUrls.url,
    'null'
  ) AS "url",
  COALESCE(mediaCategories."categories", 'null') AS "categories"
FROM media_objects
  LEFT JOIN resources ON resources.id = media_objects.id
  LEFT JOIN (
    SELECT categorized_resource_id AS "resource_id",
      json_agg(
        json_build_object(
          'id',
          category_id,
          'type',
          'categories'
        )
      ) AS "categories"
    FROM resource_categories
    GROUP BY resource_id
  ) mediaCategories ON mediaCategories.resource_id = media_objects.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS mediaAbstracts ON mediaAbstracts.id = media_objects.id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS mediaDescriptions ON mediaDescriptions.id = media_objects.id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS mediaNames ON mediaNames.id = media_objects.id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "shortName"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS mediaShortNames ON mediaShortNames.id = media_objects.id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS mediaUrls ON mediaUrls.id = media_objects.id