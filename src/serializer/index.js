let JSONAPISerializer = require('jsonapi-serializer').Serializer;
let links = require('./links');
let resources = require('./resources');
let includes = require('./includes');
let fields = require('./fields');

function serializeArray (resourceType, data, request, meta) {
  let resource = resources.getOptions(resourceType);

  if(meta && meta.page)
    links.addPagination(resource, request, meta);

  links.addSelf(resource, request);
  links.addDataLinks(resource, request);
  includes.add(resource, request);
  fields.add(resource, request);

  let Serializer = new JSONAPISerializer(resource.name, resource.opts);
  return Serializer.serialize(data);
}

function serializeObject (resourceType, data, request, meta) {
  let resource = resources.getOptions(resourceType);

  links.addSelf(resource, request);
  includes.add(resource, request);
  fields.add(resource, request);

  let Serializer = new JSONAPISerializer(resource.name, resource.opts);
  return Serializer.serialize(data);
}

module.exports = {
  serializeEvent: (data,request,meta) => serializeObject('events', data, request, meta),
  serializeEventArray: (data,request,meta) => serializeArray('events', data, request, meta),
  serializeAgent: (data,request,meta) => serializeObject('agents', data, request, meta),
  serializeAgentArray: (data,request,meta) => serializeArray('agents', data, request, meta),
  serializeMediaObject: (data,request,meta) => serializeObject('mediaObjects', data, request, meta),
  serializeMediaObjectArray: (data,request,meta) => serializeArray('mediaObjects', data, request, meta),
  serializeVenue: (data,request,meta) => serializeObject('places', data, request, meta),
  serializeVenueArray: (data,request,meta) => serializeArray('places', data, request, meta),
  serializeLift: (data,request,meta) => serializeObject('lifts', data, request, meta),
  serializeLiftArray: (data,request,meta) => serializeArray('lifts', data, request, meta),
  serializeTrail: (data,request,meta) => serializeObject('trails', data, request, meta),
  serializeTrailArray: (data,request,meta) => serializeArray('trails', data, request, meta),
  serializeSnowpark: (data,request,meta) => serializeObject('snowparks', data, request, meta),
  serializeSnowparkArray: (data,request,meta) => serializeArray('snowparks', data, request, meta),
  serializeMountainArea: (data,request,meta) => serializeObject('mountainAreas', data, request, meta),
  serializeMountainAreaArray: (data,request,meta) => serializeArray('mountainAreas', data, request, meta),
  serializeEventSeries: (data,request,meta) => serializeObject('eventSeries', data, request, meta),
  serializeEventSeriesArray: (data,request,meta) => serializeArray('eventSeries', data, request, meta),
  serializeSnowReport: (data,request,meta) => serializeObject('snowReports', data, request, meta),
  serializeSnowReportArray: (data,request,meta) => serializeArray('snowReports', data, request, meta),
}
