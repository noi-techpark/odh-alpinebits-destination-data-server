// const shajs = require('sha.js')
// const utils = require('./utils');
// const { transformMediaObject } = require('./media-object.transform');

require("custom-env").env();
const templates = require("./templates");
const mappings = require("./mappings");

function eventTopicToCategory(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Category");

  target.id = mappings.eventTopicIdToODHCategories[source.Id];

  target.meta = {
    lastUpdate: new Date("2021-01-21").toISOString(),
    dataProvider: "http://tourism.opendatahub.bz.it/",
  };

  target.links = {
    self: request.selfUrl,
    resources: {
      events:
        process.env.REF_SERVER_URL +
        `${request.selfUrl.endsWith("/") ? "" : "/"}` +
        `1.0/events?filter[categories][any]=${target.id}`,
    },
  };

  target.attributes.namespace = mappings.eventCategoryToNamespace[target.id];
  target.attributes.resourceTypes = ["events"];
  target.attributes.url = mappings.eventCategoryToUrl[target.id];

  if (source.TypeDesc) {
    let name = (target.attributes.name = {});

    Object.entries(source.TypeDesc).forEach(([twoLetterLang, topicName]) => {
      let threeLetterLang = mappings.iso6391to6393[twoLetterLang];

      if (threeLetterLang) {
        name[threeLetterLang] = topicName;
      }
    });
  }

  if (mappings.eventCategoryInOdhToSchemaOrg[target.id]) {
    const parentCategory = mappings.eventCategoryInOdhToSchemaOrg[target.id];
    target.relationships.parents = {
      data: [
        {
          type: "categories",
          id: parentCategory,
        },
      ],
      links: {
        related: target.links.self + "/parents",
      },
    };
    console.log(`Creating resource ${target.id} with ${parentCategory} as parent`, target.relationships);
  }

  // The assignment of the "children" relationship is handled by the
  // "getSchemaOrgCategoryCopy" function when copying the "odh" category

  return target;
}

function isEventTopic(object) {
  return object && object.Type && object.Type === "EventTopic";
}

function isSchemaOrgCategory(categoryResource) {
  return !!mappings.eventCategoryInOdhToSchemaOrg[categoryResource.id];
}

function getSchemaOrgCategoryCopy(categoryResource, request) {
  console.log("Copying ", categoryResource.id);

  const copy = JSON.parse(JSON.stringify(categoryResource));

  copy.id = mappings.eventCategoryInOdhToSchemaOrg[categoryResource.id];
  copy.links.self = copy.links.self.replace(categoryResource.id, copy.id);
  copy.links.resources.events = copy.links.resources.events.replace(categoryResource.id, copy.id);
  copy.attributes.url = mappings.eventCategoryToUrl[copy.id];

  console.log("Updating id: ", copy.id);

  if (categoryResource.relationships.parents) {
    console.log(
      "Transforming parents relationship to children: ",
      categoryResource.relationships
    );

    copy.relationships.parents = null;
    copy.relationships.children = {
      data: [
        {
          type: "categories",
          id: categoryResource.id,
        },
      ],
      links: {
        related: copy.links.self + "/children",
      },
    };
  }

  return copy;
}

function transformCategoryArray(odhData, request) {
  let data = [];
  let includedMap = {};

  for (object of odhData) {
    if (isEventTopic(object)) {
      let resource = eventTopicToCategory(object, includedMap, request);
      data.push(resource);

      if (isSchemaOrgCategory(resource)) {
        resource = getSchemaOrgCategoryCopy(resource, request);
        data.push(resource);
      }
    }
  }

  data.sort((resourceA, resourceB) => (resourceA.id < resourceB.id ? -1 : 1));
  selectFields(data, request);

  let response = {
    jsonapi: {
      version: "1.0",
    },
    meta: {
      count: data.length,
      pages: 1,
    },
    links: {
      self: request.selfUrl,
    },
    data: data.length > 0 ? data : null,
  };

  const included = createIncludedArray(data, includedMap, request);
  if (included) {
    selectFields(included, request);
    response.included = included;
  }

  return response;
}

function isSchemaCategoryRequest(request) {
  return request.selfUrl.includes("/schema:");
}

function isOdhCategoryRequest(request) {
  return request.selfUrl.includes("/odh:");
}

function transformCategory(odhData, request) {
  let data = null;
  let includedMap = {};

  if (isEventTopic(odhData)) {
    if (isOdhCategoryRequest(request)) {
      data = eventTopicToCategory(odhData, includedMap, request);
    } else if (isSchemaCategoryRequest(request)) {
      odhCategory = eventTopicToCategory(odhData, includedMap, request);
      data = getSchemaOrgCategoryCopy(odhCategory, request);
    }
  }

  selectFields(data, request);

  let response = {
    jsonapi: {
      version: "1.0",
    },
    links: {
      self: request.selfUrl,
    },
    data,
  };

  const included = createIncludedArray(data, includedMap, request);
  if (included) {
    selectFields(included, request);
    response.included = included;
  }

  return response;
}

function selectFields(data, request) {
  const fields = request.query.fields;

  if (!Object.keys(fields).length === 0) return;

  if (Array.isArray(data))
    data.forEach((resource) => selectFieldsOnResource(resource, fields));
  else selectFieldsOnResource(data, fields);
}

function selectFieldsOnResource(resource, fields) {
  let selectedFields = fields[resource.type];
  if (!selectedFields) return;

  let attributes = resource.attributes;
  Object.keys(attributes).forEach((attrName) => {
    if (!selectedFields.includes(attrName)) delete attributes[attrName];
  });

  let relationships = resource.relationships;
  Object.keys(relationships).forEach((attrName) => {
    if (!selectedFields.includes(attrName)) delete relationships[attrName];
  });
}

function createIncludedArray(data, includedMap, request) {
  if (!data || !request || !request.query || !request.query.include) return;

  const include = request.query.include;

  if (Object.keys(include).length === 0) return;

  let filteredMap = {};
  Object.keys(includedMap).forEach((field) => (filteredMap[field] = {}));

  if (Array.isArray(data))
    data.forEach((resource) =>
      getIncludedOnResource(resource, request, includedMap, filteredMap)
    );
  else getIncludedOnResource(data, request, includedMap, filteredMap);

  let included = [];

  Object.values(filteredMap).forEach(
    (resourceMap) => (included = included.concat(Object.values(resourceMap)))
  );

  return included.length > 0 ? included : null;
}

module.exports = {
  eventTopicToCategory,
  transformCategory,
  transformCategoryArray,
};
