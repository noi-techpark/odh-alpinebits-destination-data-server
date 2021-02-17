// const shajs = require('sha.js')
// const utils = require('./utils');
// const { transformMediaObject } = require('./media-object.transform');

require("custom-env").env();
const utils = require('./utils');
const templates = require("./templates");
const mappings = require("./mappings");
const sourceCategories = require('../../../data/categories.data');

function eventTopicToCategory(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Category", request.apiVersion);

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

// function transformCategoryArray(odhData, request) {
//   let data = [];
//   let includedMap = {};

//   for (object of odhData) {
//     if (isEventTopic(object)) {
//       let resource = eventTopicToCategory(object, includedMap, request);
//       data.push(resource);

//       if (isSchemaOrgCategory(resource)) {
//         resource = getSchemaOrgCategoryCopy(resource, request);
//         data.push(resource);
//       }
//     }
//   }

//   data.sort((resourceA, resourceB) => (resourceA.id < resourceB.id ? -1 : 1));
//   selectFields(data, request);

//   let response = {
//     jsonapi: {
//       version: "1.0",
//     },
//     meta: {
//       count: data.length,
//       pages: 1,
//     },
//     links: {
//       self: request.selfUrl,
//     },
//     data: data.length > 0 ? data : null,
//   };

//   const included = createIncludedArray(data, includedMap, request);
//   if (included) {
//     selectFields(included, request);
//     response.included = included;
//   }

//   return response;
// }

function isSchemaCategoryRequest(request) {
  return request.selfUrl.includes("/schema:");
}

function isOdhCategoryRequest(request) {
  return request.selfUrl.includes("/odh:");
}

// function transformCategory(odhData, request) {
//   let data = null;
//   let includedMap = {};

//   if (isEventTopic(odhData)) {
//     if (isOdhCategoryRequest(request)) {
//       data = eventTopicToCategory(odhData, includedMap, request);
//     } else if (isSchemaCategoryRequest(request)) {
//       odhCategory = eventTopicToCategory(odhData, includedMap, request);
//       data = getSchemaOrgCategoryCopy(odhCategory, request);
//     }
//   }

//   selectFields(data, request);

//   let response = {
//     jsonapi: {
//       version: "1.0",
//     },
//     links: {
//       self: request.selfUrl,
//     },
//     data,
//   };

//   const included = createIncludedArray(data, includedMap, request);
//   if (included) {
//     selectFields(included, request);
//     response.included = included;
//   }

//   return response;
// }

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

function transformCategory(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject('Category', '2.0');

  processId(source, target, request);
  processMeta(source, target, request);
  processLinks(source, target, request);

  processBasicAttributes(source,target);

  processChildrenRelationship(source,target,included,request);
  processParentsRelationship(source,target,included,request);
  // processMultimediaDescriptionsRelationship(source,target,included,request);

  return target;
}

function processId(source, target, request) {
  // Try to retrieve the from each mapping and if it fails all, it must be a alpinebits one
  target.id = mappings.eventTopicIdToODHCategories[source.id];
  target.id = target.id ? target.id : mappings.activityTypeIdToODHCategories[source.id]
  target.id = target.id ? target.id : mappings.activitySmgTagToODHCategories[source.id]
  target.id = target.id ? target.id : mappings.skiAreaSmgTagToODHCategories[source.id]
  target.id = target.id ? target.id : source.id;
}

function processMeta(source, target, request) {
  const { meta } = target;
  meta.lastUpdate = new Date('2021-02-18').toISOString();
  meta.dataProvider = 'https://tourism.opendatahub.bz.it';
}

function processLinks(source, target, request) {
  const { links } = target;
  links.self = `${request.baseUrl}/categories/${target.id}`
  
  if(Array.isArray(source.resourceTypes)) {
    links.resources = {};
    source.resourceTypes.forEach(resourceType =>
      links.resources[resourceType] = `${request.baseUrl}/${resourceType}?filter[categories][any]=${target.id}`
    )
  } else {
    links.resources = null;
  }
}

function processBasicAttributes(source,target) {
  const { attributes } = target;
  attributes.abstract = source.abstract
  attributes.description = source.description
  attributes.name = source.name
  attributes.namespace = source.namespace
  attributes.resourceTypes = source.resourceTypes
  attributes.shortName = source.shortName
  attributes.url = source.url
}

function processChildrenRelationship(source,target,included,request) {
  const { relationships, links } = target;

  if(!Array.isArray(source.children))
    return ;

  for (const childSourceId of source.children) {
    const childSource = sourceCategories[childSourceId]
    const child = { type: 'categories', id: null };

    if(!childSource)
      continue ;

    processId(childSource, child, null);
    utils.addRelationshipToMany(relationships, 'children', child, links.self);
    // utils.addIncludedResource(included, child);
  }
}

function processParentsRelationship(source,target,included,request) {
  const { relationships, links } = target;

  if(!Array.isArray(source.parents))
    return ;

  for (const parentSourceId of source.parents) {
    const parentSource = sourceCategories[parentSourceId]
    const parent = { type: 'categories', id: null };

    if(!parentSource)
      continue ;

    processId(parentSource, parent, null);
    utils.addRelationshipToMany(relationships, 'parents', parent, links.self);
    // utils.addIncludedResource(included, parent);
  }
}

module.exports = {
  eventTopicToCategory,
  transformCategory,
  // transformCategoryArray,
};
