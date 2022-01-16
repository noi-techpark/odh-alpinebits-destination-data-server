SELECT events.id AS "id",
  events.capacity AS "capacity",
  events.end_date AS "endDate",
  events.start_date AS "startDate",
  events.status AS "status",
  CASE
    WHEN events.publisher_id ISNULL
      THEN 'null'
      ELSE json_build_object(
        'id',
        events.publisher_id,
        'type',
        'agents'
      )
  END AS "publisher",
  CASE
    WHEN events.series_id ISNULL
      THEN 'null'
      ELSE json_build_object(
        'id',
        events.series_id,
        'type',
        'eventSeries'
      )
  END AS "series",
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
  COALESCE(contributors_array.contributors) AS "contributors",
  COALESCE(organizers_array.organizers) AS "organizers",
  COALESCE(sponsors_array.sponsors) AS "sponsors",
  COALESCE(sub_events_array.sub_events) AS "subEvents"
FROM events
  LEFT JOIN (
      SELECT contributors.event_id AS "id",
        json_agg(
          json_build_object(
            'id',
            contributor_id,
            'type',
            'agents'
          )
        ) AS "contributors"
      FROM contributors
      GROUP BY event_id
    ) AS contributors_array ON contributors_array.id = events.id
  LEFT JOIN (
      SELECT organizers.event_id AS "id",
        json_agg(
          json_build_object(
            'id',
            organizer_id,
            'type',
            'agents'
          )
        ) AS "organizers"
      FROM organizers
      GROUP BY event_id
    ) AS organizers_array ON organizers_array.id = events.id
  LEFT JOIN (
      SELECT sponsors.event_id AS "id",
        json_agg(
          json_build_object(
            'id',
            sponsor_id,
            'type',
            'agents'
          )
        ) AS "sponsors"
      FROM sponsors
      GROUP BY event_id
    ) AS sponsors_array ON sponsors_array.id = events.id
  LEFT JOIN (
      SELECT events.id AS "id",
        json_agg(
          json_build_object(
            'id',
            parent_id,
            'type',
            'events'
          )
        ) AS "sub_events"
      FROM events
      GROUP BY id
    ) AS sub_events_array ON sub_events_array.id = events.id
  LEFT JOIN resources ON resources.id = events.id
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
  ) categories_array ON categories_array.resource_id = events.id
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
  ) AS multimedia_descriptions_array ON multimedia_descriptions_array.resource_id = events.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS abstract_obj ON abstract_obj.id = events.id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS description_obj ON description_obj.id = events.id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS name_obj ON name_obj.id = events.id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "short_name"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS short_name_obj ON short_name_obj.id = events.id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS url_obj ON url_obj.id = events.id