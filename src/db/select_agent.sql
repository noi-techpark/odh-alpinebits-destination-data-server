SELECT agents.id AS "id",
  COALESCE(resources.type) AS "type",
  COALESCE(resources.data_provider) AS "dataProvider",
  COALESCE(resources.last_update) AS "lastUpdate",
  COALESCE(agentAbstracts.abstract, 'null') AS "abstract",
  COALESCE(agentDescriptions.description, 'null') AS "description",
  COALESCE(agentNames.name, 'null') AS "name",
  COALESCE(agentShortNames."shortName", 'null') AS "shortName",
  COALESCE(
    to_json(resources.simple_url),
    agentUrls.url,
    'null'
  ) AS "url",
  COALESCE(agentContacts."contactPoints", 'null') AS "contactPoints",
  COALESCE(agentCategories."categories", 'null') AS "categories"
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
  ) agentCategories ON agentCategories.resource_id = agents.id
  LEFT JOIN (
    SELECT abstracts.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (
          WHERE abstracts.lang IS NOT NULL
        )
      )::json AS "abstract"
    FROM abstracts
    GROUP BY abstracts.resource_id
  ) AS agentAbstracts ON agentAbstracts.id = agents.id
  LEFT JOIN (
    SELECT descriptions.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (
          WHERE descriptions.lang IS NOT NULL
        )
      )::json AS "description"
    FROM descriptions
    GROUP BY descriptions.resource_id
  ) AS agentDescriptions ON agentDescriptions.id = agents.id
  LEFT JOIN (
    SELECT names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT names.lang, names.content) FILTER (
          WHERE names.lang IS NOT NULL
        )
      )::json AS "name"
    FROM names
    GROUP BY names.resource_id
  ) AS agentNames ON agentNames.id = agents.id
  LEFT JOIN (
    SELECT short_names.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (
          WHERE short_names.lang IS NOT NULL
        )
      )::json AS "shortName"
    FROM short_names
    GROUP BY short_names.resource_id
  ) AS agentShortNames ON agentShortNames.id = agents.id
  LEFT JOIN (
    SELECT urls.resource_id AS "id",
      COALESCE(
        json_object_agg(DISTINCT urls.lang, urls.content) FILTER (
          WHERE urls.lang IS NOT NULL
        )
      )::json AS "url"
    FROM urls
    GROUP BY urls.resource_id
  ) AS agentUrls ON agentUrls.id = agents.id
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
            contactAddress.city,
            'complement',
            contactAddress.complement,
            'country',
            contactAddress.country,
            'region',
            contactAddress.region,
            'street',
            contactAddress.street,
            'type',
            contactAddress.type,
            'zipcode',
            contactAddress.zipcode
          )
        )
      ) AS "contactPoints"
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
      ) AS contactAddress ON contactAddress.address_id = contact_points.address_id
    GROUP BY contact_points.agent_id
  ) AS agentContacts ON agentContacts.id = agents.id