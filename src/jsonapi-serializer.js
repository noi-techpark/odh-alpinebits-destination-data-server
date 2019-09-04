const fs = require('fs');
let JSONAPISerializer = require('jsonapi-serializer').Serializer;

const fileName = 'event1.example';
// const fileName = '2D436CF8B53749BCA07D83D06B5C6E77';

const inputFile = '../output/'+fileName+'.json';
let data = JSON.parse(fs.readFileSync(inputFile));

const basicAttributes = ['name','shortName','description','abstract','url']
const agentAttributes = [...basicAttributes,'category','contacts'];
const mediaObjectAttributes = [...basicAttributes,'contentType','height','width','duration','license','copyrightOwner'];
const metaAttributes = ['dataProvider', 'lastUpdate']

const getType = (attribute, data) => {
  switch(data['@type']) {
    case 'Event':
      return 'events';
    case 'Agent':
      return 'agents';
    case 'MediaObject':
      return 'mediaObjects';
    case 'EventSeries':
      return 'eventSeries';
    case 'Point':
    case 'LineString':
    case 'Polygon':
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return 'geometries';

    return data['@type'];
  }
}

const addressSerialization = () => {
  return ({
    attributes: ['street', 'category', 'street', 'city', 'region', 'zipcode', 'complement', 'country']
  });
}

const hoursSerialization = () => {
  return ({
    attributes: ['hours', 'validFrom', 'validTo']
  });
}

const contactPointSerialization = () => {
  return ({
    attributes: [...basicAttributes, 'email', 'telephone', 'address', 'availableHours'],
    address: addressSerialization(),
    availableHours: hoursSerialization()
  });
}

const agentSerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: [...agentAttributes],
    contacts: contactPointSerialization()
  });
}

const contributorSerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: ['agent', 'role'],
    agent: agentSerialization(included)
  });
}

const multimediaSerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: [...mediaObjectAttributes],
    copyrightOwner: agentSerialization(included)
  });
}

const eventSeriesSerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: [...basicAttributes, 'multimediaDescriptions', 'frequency'],
    multimediaDescriptions: multimediaSerialization(included)
  });
}

const geometrySerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: ['coordinates', 'category'],
    transform: function (data) {
       data.category = data['@type'];
       return data;
    }
  });
}

const venueSerialization = (included) => {
  return ({
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    attributes: [...basicAttributes, 'multimediaDescriptions', 'frequency', 'address', 'geometries', 'howToArrive', 'connections', 'openingHours'],
    multimediaDescriptions: multimediaSerialization(included),
    address: addressSerialization(),
    openingHours: hoursSerialization(),
    geometries: geometrySerialization(included)
  });
}

const eventSerialization = (included) => {
  return({
    attributes: [...metaAttributes, ...basicAttributes, 'startDate', 'endDate', 'originalStartDate',
  'originalEndDate', 'categories', 'structure', 'status', 'capacity', 'multimediaDescriptions', 'publisher', 'organizers', 'sponsors', 'contributors', 'series', 'venues'],
    keyForAttribute: 'camelCase',
    nullIfMissing: true,
    typeForAttribute: getType,
    multimediaDescriptions: multimediaSerialization(included),
    publisher: agentSerialization(included),
    organizers: agentSerialization(included),
    sponsors:agentSerialization(included),
    contributors: contributorSerialization(included),
    series: eventSeriesSerialization(included),
    venues: venueSerialization(included)
  })
}

const rootEventSerialization = (included) => {
  let serializer = eventSerialization(included);
  serializer.attributes.push('subEvents');

  let subEvents = {
    ref: 'id',
    included: included,
    typeForAttribute: getType,
    ...eventSerialization(included)
  }

  serializer.subEvents = subEvents;

  return serializer;
}

let EventSerializer = new JSONAPISerializer('events', rootEventSerialization(true));

let events = EventSerializer.serialize(data);

const outputFile = 'output/JSON_API+'+fileName+'.json';
const outputContent = JSON.stringify(events, null, 2);

fs.writeFile(outputFile, outputContent, function (err) {
  if (err) throw err;
});
