const knex = require("./connect");
const dbFn = require("./functions");

knex
  .transaction(function (trx) {
    return (
      dbFn
        .selectAgentFromId(trx, "00000000-0000-0000-0000-000000000000")
        // .selectAgentFromId(trx, "00000000-0000-0000-0000-000000000000")
        .then((ret) => console.log(ret))
        .then(() => {
          console.log("transaction concluded");
          trx.commit();
        })
        .catch((err) => {
          console.error("transaction failed", err);
          trx.rollback();
        })
    );
  })
  .catch((err) => {
    // console.error(err)
  })
  .finally(() => knex.destroy());

// select agents.agent_id AS "id",
// json_object_agg(DISTINCT abstracts.lang, abstracts.content) AS "abstract",
// -- 	json_object_agg(DISTINCT descriptions.lang, descriptions.content) AS "description",
// -- 	json_object_agg(DISTINCT "names".lang, "names".content) AS "name",
// -- 	json_object_agg(DISTINCT short_names.lang, short_names.content) AS "shortName",
// -- 	COALESCE(json_object_agg(DISTINCT urls.lang, urls.content) FILTER (WHERE urls.lang IS NOT NULL), 'null')::json AS "url"
// json_agg(json_build_object('email', contact_points.email, 'address', json_build_object('country', addresses.country))) AS "contactPoints"
// from agents
// left join resources on resources.resource_id = agents.agent_id
// left join abstracts on abstracts.resource_id = agents.agent_id
// -- left join descriptions on descriptions.resource_id = agents.agent_id
// -- left join "names" on "names".resource_id = agents.agent_id
// -- left join short_names on short_names.resource_id = agents.agent_id
// -- left join urls on urls.resource_id = agents.agent_id
// left join contact_points on contact_points.agent_id = agents.agent_id
// left join addresses on addresses.address_id = contact_points.contact_point_id
// group by agents.agent_id
// ;
