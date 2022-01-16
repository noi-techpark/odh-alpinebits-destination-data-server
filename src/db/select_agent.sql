SELECT agents.id AS "id",
  COALESCE(resources.type) AS "type",
  COALESCE(resources.data_provider) AS "dataProvider",
  COALESCE(resources.last_update) AS "lastUpdate",
  COALESCE(abstract_obj.abstract, 'null') AS "abstract",
  COALESCE(description_obj.description, 'null') AS "description",
  COALESCE(name_obj.name, 'null') AS "name",
  COALESCE(short_name_obj.short_name, 'null') AS "shortName",
  COALESCE(
    to_json(resources.simple_url),
    url_obj.url,
    'null'
  ) AS "url",
  COALESCE(contacts_array.contacts, 'null') AS "contactPoints",
  COALESCE(categories_array.categories, 'null') AS "categories",
  COALESCE(multimedia_descriptions_array.media) AS "multimediaDescriptions"
FROM agents
  LEFT JOIN resources ON resources.id = agents.id
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
  ) categories_array ON categories_array.resource_id = agents.id
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
  ) AS multimedia_descriptions_array ON multimedia_descriptions_array.resource_id = agents.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS abstract_obj ON abstract_obj.id = agents.id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS description_obj ON description_obj.id = agents.id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS name_obj ON name_obj.id = agents.id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "short_name"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS short_name_obj ON short_name_obj.id = agents.id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS url_obj ON url_obj.id = agents.id
  LEFT JOIN (
    SELECT contact_points.agent_id AS "id",
      json_agg(
        json_build_object(
          'availableHours',
          contact_points.available_hours,
          'email',
          contact_points.email,
          'telephone',
          contact_points.telephone,
          'address',
          json_build_object(
            'city',
            address_obj.city,
            'complement',
            address_obj.complement,
            'country',
            address_obj.country,
            'region',
            address_obj.region,
            'street',
            address_obj.street,
            'type',
            address_obj.type,
            'zipcode',
            address_obj.zipcode
          )
        )
      ) AS contacts
    FROM contact_points
      LEFT JOIN (
        SELECT addresses.id AS "address_id",
          addresses.type AS "type",
          addresses.country AS "country",
          addresses.zipcode AS "zipcode",
          COALESCE(
            JSON_OBJECT_AGG(DISTINCT CITIES.LANG, CITIES.CONTENT) FILTER (
              WHERE CITIES.LANG IS NOT NULL
            )
          )::JSON AS "city",
          COALESCE(
            JSON_OBJECT_AGG(DISTINCT complements.LANG, complements.CONTENT) FILTER (
              WHERE complements.LANG IS NOT NULL
            )
          )::JSON AS "complement",
          COALESCE(
            JSON_OBJECT_AGG(DISTINCT regions.LANG, regions.CONTENT) FILTER (
              WHERE regions.LANG IS NOT NULL
            )
          )::JSON AS "region",
          COALESCE(
            JSON_OBJECT_AGG(DISTINCT streets.LANG, streets.CONTENT) FILTER (
              WHERE streets.LANG IS NOT NULL
            )
          )::JSON AS "street"
        FROM addresses
          LEFT JOIN cities ON cities.address_id = addresses.id
          LEFT JOIN complements ON complements.address_id = addresses.id
          LEFT JOIN regions ON regions.address_id = addresses.id
          LEFT JOIN streets ON streets.address_id = addresses.id
        GROUP BY addresses.id
      ) AS address_obj ON address_obj.address_id = contact_points.address_id
    GROUP BY contact_points.agent_id
  ) AS contacts_array ON contacts_array.id = agents.id