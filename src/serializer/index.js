let JSONAPISerializer = require('jsonapi-serializer').Serializer;
let links = require('./links');
let resources = require('./resources');
let includes = require('./includes');
let fields = require('./fields');

function serialize(resource, data) {
  let Serializer = new JSONAPISerializer(resource.name, resource.opts);
  return Serializer.serialize(data);
}

module.exports = {
  serializeEvents: (data, request, meta) => {
    let resource = resources.getOptions('events');

    links.addPagination(resource, request, meta);
    links.addSelf(resource, request);
    links.addDataLinks(resource, request);

    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeEvent: (data, request, meta) => {
    let resource = resources.getOptions('events');

    links.addSelf(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializePublisher: (data, request, meta) => {
    let resource = resources.getOptions('agents');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeOrganizers: (data, request, meta) => {
    let resource = resources.getOptions('agents');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeMediaObjects: (data, request, meta) => {
    let resource = resources.getOptions('mediaObjects');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeVenues: (data, request, meta) => {
    let resource = resources.getOptions('places');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeLifts: (data, request, meta) => {
    let resource = resources.getOptions('lifts');

    links.addPagination(resource, request, meta);
    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeLift: (data, request, meta) => {
    let resource = resources.getOptions('lifts');

    links.addSelf(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeSnowparks: (data, request, meta) => {
    let resource = resources.getOptions('snowparks');

    links.addPagination(resource, request, meta);
    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeSnowpark: (data, request, meta) => {
    let resource = resources.getOptions('snowparks');

    links.addSelf(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  }
}
