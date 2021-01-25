const errors = require("../../errors");

const transformEvent = require('./event.transform');
const { transformOrganizersRelationship } = require('./organizer.transform');
const { transformPublisherRelationship } = require('./publisher.transform');
const { transformVenuesRelationship } = require('./venue.transform');
const { transformMockMultimediaDescriptionsRelationship, transformMultimediaDescriptionsRelationship } = require('./media-object.transform');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');
const { transformAreaMultimedDescriptionsRelationship, transformMountainArea, transformAreaOwnerRelationship } = require('./mountainarea.transform');
const transformEventSeries = require('./event-series.transform');
const { transformCategory, transformCategoryArray } = require('./category.transform');

function transformArray(odhData, request, transformFn) {
  let data = [];
  let includedMap = {};
  
  for (object of odhData.Items){
    let resource = transformFn(object, includedMap, request);
    data.push(resource);
  }
  selectFields(data, request);

  const { meta, links } = createPaginationObjects(odhData, request);
  
  let response = {
    jsonapi: {
      version: "1.0"
    },
    meta: meta && meta!=={} ? meta : undefined,
    links: links && links!=={} ? links : undefined,
    data: data.length>0 ? data : null,
  }

  const included = createIncludedArray(data, includedMap, request);
  if(included){
    selectFields(included, request);
    response.included = included
  }

  return response;
}

function transformObject(odhData, request, transformFn) {
  let includedMap = {};
  
  let data = transformFn(odhData, includedMap, request);
  let response = {
    jsonapi: {
      version: "1.0"
    },
    links: {
      self: request.selfUrl
    },
    data
  }

  if(data){
    selectFields(data, request);
    const included = createIncludedArray(data, includedMap, request);
    
    if(included){
      selectFields(included, request);
      response.included = included;
    }
  }
  
  return response;
}

function createIncludedArray(data, includedMap, request) {
  if(!data || !request || !request.query || !request.query.include)
    return;

  const include = request.query.include;
  
  if(Object.keys(include).length===0)
    return;

  let filteredMap = {};
  Object.keys(includedMap).forEach(field => filteredMap[field] = {});

  if(Array.isArray(data))
    data.forEach(resource => getIncludedOnResource(resource, request, includedMap, filteredMap));
  else
    getIncludedOnResource(data, request, includedMap, filteredMap);

  let included = []

  Object.values(filteredMap).forEach( 
    resourceMap => included = included.concat(Object.values(resourceMap))
  );

  return included.length>0 ? included : null;
}

function getIncludedOnResource(resource, request, includedMap, filteredMap) {
  if(!resource || !filteredMap || !request || !request.query || !request.query.include)
    return;
  
  const include = request.query.include;

  if(Object.keys(include).length===0)
    return;

  Object.keys(include).forEach(field => {
    let relationship = resource.relationships[field];

    if(!relationship)
      return;
    
    if(Array.isArray(relationship.data))
      relationship.data.forEach( related => filteredMap[related.type][related.id] = includedMap[related.type][related.id] );
    else 
      filteredMap[relationship.data.type][relationship.data.id] = includedMap[relationship.data.type][relationship.data.id];
  })
}

function createPaginationObjects(odhData, request) {
  const { selfUrl } = request;

  let count = parseInt(odhData.TotalResults);
  let current = parseInt(odhData.CurrentPage);
  let last = (pages = parseInt(odhData.TotalPages) || 1);
  let next = current < last ? current + 1 : last;
  let first = 1;
  let prev = 1;

  if (current > 1) {
    if (current <= last) prev = current - 1;
    else prev = last;
  }

  let meta;

  if (!request.params.id)
    meta = {
      count,
      pages,
    };

  let links;
  let regex = /page\[number\]=[0-9]+/;
  let pageQueryStr = "page[number]=";

  if (!selfUrl.match(regex)) {
    regexParams = /page|include|fields|filter|sort|search|random/;
    hasParams = !!selfUrl.match(regexParams);

    links = {
      first: selfUrl + (hasParams ? "&" : "?") + pageQueryStr + first,
      last: selfUrl + (hasParams ? "&" : "?") + pageQueryStr + last,
      next: selfUrl + (hasParams ? "&" : "?") + pageQueryStr + next,
      prev: selfUrl + (hasParams ? "&" : "?") + pageQueryStr + prev,
      self: selfUrl + (hasParams ? "&" : "?") + pageQueryStr + current,
    };
  } else
    links = {
      first: selfUrl.replace(regex, pageQueryStr + first),
      last: selfUrl.replace(regex, pageQueryStr + last),
      next: selfUrl.replace(regex, pageQueryStr + next),
      prev: selfUrl.replace(regex, pageQueryStr + prev),
      self: selfUrl.replace(regex, pageQueryStr + current),
    };

  if (current > last && count > 0) {
    throw { 
      ...errors.pageNotFound,
      links: {
        first: links.first,
        last: links.last,
      },
      meta
    };
  }

  return { meta, links };
}

function selectFields(data, request){
  const fields = request.query.fields;

  if(!Object.keys(fields).length===0)
    return;

  if(Array.isArray(data))
    data.forEach(resource => selectFieldsOnResource(resource, fields))
  else
    selectFieldsOnResource(data, fields)
}

function selectFieldsOnResource(resource, fields){
  let selectedFields = fields[resource.type]
  if(!selectedFields)
    return;

  let attributes = resource.attributes;
  Object.keys(attributes).forEach(attrName => {
    if(!selectedFields.includes(attrName))
      delete attributes[attrName];   
  })

  let relationships = resource.relationships;
  Object.keys(relationships).forEach(attrName => {
    if(!selectedFields.includes(attrName))
      delete relationships[attrName];   
  })

}

module.exports = {
  transformEventArray: (odhData, request) => transformArray(odhData, request, transformEvent),
  transformEvent: (odhData, request) => transformObject(odhData, request, transformEvent),
  transformLiftArray: (odhData, request) => transformArray(odhData, request, transformLift),
  transformLift: (odhData, request) => transformObject(odhData, request, transformLift),
  transformTrailArray: (odhData, request) => transformArray(odhData, request, transformTrail),
  transformTrail: (odhData, request) => transformObject(odhData, request, transformTrail),
  transformSnowparkArray: (odhData, request) => transformArray(odhData, request, transformSnowpark),
  transformSnowpark: (odhData, request) => transformObject(odhData, request, transformSnowpark),
  transformMountainAreaArray: (odhData, request) => transformArray(odhData, request, transformMountainArea),
  transformMountainArea: (odhData, request) => transformObject(odhData, request, transformMountainArea),
  transformEventSeriesArray: (odhData, request) => transformArray(odhData, request, transformEventSeries),
  transformEventSeries: (odhData, request) => transformObject(odhData, request, transformEventSeries),
  transformOrganizersRelationship: (odhData, request) => transformObject(odhData, request, transformOrganizersRelationship),
  transformPublisherRelationship: (odhData, request) => transformObject(odhData, request, transformPublisherRelationship),
  transformVenuesRelationship: (odhData, request) => transformObject(odhData, request, transformVenuesRelationship),
  transformAreaOwnerRelationship: (odhData, request) => transformObject(odhData, request, transformAreaOwnerRelationship),
  transformAreaMultimedDescriptionsRelationship: (odhData, request) => transformObject(odhData, request, transformAreaMultimedDescriptionsRelationship),
  transformMultimediaDescriptionsRelationship: (odhData, request) => transformObject(odhData, request, transformMultimediaDescriptionsRelationship),
  transformMockMultimediaDescriptionsRelationship: (odhData, request) => transformObject(odhData, request, transformMockMultimediaDescriptionsRelationship),
  transformCategoryArray,
  transformCategory,
}
