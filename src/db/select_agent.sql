SELECT agents.id,
  resource_objects.type,
  data_provider AS "dataProvider",
  last_update AS "lastUpdate",
  abstract,
  resource_objects.description,
  resource_objects.name,
  short_name AS "shortName",
  resource_objects.url,
  resource_objects.categories,
  resource_objects.media AS "multimediaDescriptions",
  COALESCE(contact_points_array.contacts, 'null') AS "contactPoints"
FROM agents
  LEFT JOIN resource_objects ON resource_objects.id = agents.id
  LEFT JOIN (
    SELECT agent_id AS "id",
      json_agg(
        json_build_object(
          'availableHours', available_hours,
          'email', email,
          'telephone', telephone,
          'address', address_objects.address
        )
      ) AS contacts
    FROM contact_points
      LEFT JOIN address_objects ON address_objects.id = contact_points.address_id
    GROUP BY contact_points.agent_id
  ) AS contact_points_array ON contact_points_array.id = agents.id