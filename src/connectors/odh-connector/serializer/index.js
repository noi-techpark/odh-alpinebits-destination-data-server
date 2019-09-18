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
  serializeEvents: function (data, request, meta) {
    let resource = resources.getOptions('events');

    links.addPagination(resource, request, meta);
    links.addSelf(resource, request);
    links.addDataLinks(resource, request);

    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializeEvent: function (data, request, meta) {
    let resource = resources.getOptions('events');

    links.addSelf(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data);
  },
  serializePublisher: function (data, request, meta) {
    let resource = resources.getOptions('agents');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data.publisher);
  },
  serializeOrganizers:  function (data, request, meta) {
    let resource = resources.getOptions('agents');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data.organizers);
  },
  serializeMediaObjects: function (data, request, meta) {
    let resource = resources.getOptions('mediaObjects');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data.multimediaDescriptions);
  },
  serializeVenues: function (data, request, meta) {
    let resource = resources.getOptions('places');

    links.addSelf(resource, request);
    links.addDataLinks(resource, request);
    includes.add(resource, request);
    fields.add(resource, request);

    return serialize(resource, data.venues);
  }
}
