SELECT event_series.id AS "id",
  event_series.frequency AS "frequency",
  resources.type AS "type",
  resources.data_provider AS "dataProvider",
  resources.last_update AS "lastUpdate",
  COALESCE(abstract_obj.abstract, 'null') AS "abstract",
  COALESCE(description_obj.description, 'null') AS "description",
  COALESCE(name_obj.name, 'null') AS "name",
  COALESCE(short_name_obj.short_name, 'null') AS "shortName",
  COALESCE(
    to_json(resources.simple_url),
    url_obj.url,
    'null'
  ) AS "url",
  COALESCE(categories_array.categories, 'null') AS "categories",
  COALESCE(multimedia_descriptions_array.media) AS "multimediaDescriptions",
  COALESCE(editions_array.editions) AS "editions"
FROM event_series
  LEFT JOIN (
      SELECT events.series_id AS "id",
        json_agg(
          json_build_object(
            'id',
            id,
            'type',
            'eventSeries'
          )
        ) AS "editions"
      FROM events
      GROUP BY series_id
    ) AS editions_array ON editions_array.id = event_series.id
  LEFT JOIN resources ON resources.id = event_series.id
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
  ) categories_array ON categories_array.resource_id = event_series.id
  LEFT JOIN (
    SELECT resource_id AS "resource_id",
      json_agg(
        json_build_object(
          'id',
          media_object_id,
          'type',
          'mediaObjects'
        )
      ) AS "media"
    FROM multimedia_descriptions
    GROUP BY resource_id
  ) AS multimedia_descriptions_array ON multimedia_descriptions_array.resource_id = event_series.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS abstract_obj ON abstract_obj.id = event_series.id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS description_obj ON description_obj.id = event_series.id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS name_obj ON name_obj.id = event_series.id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "short_name"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS short_name_obj ON short_name_obj.id = event_series.id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS url_obj ON url_obj.id = event_series.id