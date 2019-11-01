const DEFAULT_OPTS = {
  keyForAttribute: 'camelCase',
  nullIfMissing: true,
}

const BASIC_ATTR = ['name','shortName','description','abstract','url'];
const META_ATTR = ['dataProvider', 'lastUpdate'];

const ADDRESS = {
  opts: {
    attributes: ['street', 'category', 'street', 'city', 'region', 'zipcode', 'complement', 'country'],
  }
}

const HOURS = {
  opts: {
    attributes: ['hours', 'validFrom', 'validTo'],
  }
}

const MEDIA_OBJECT = {
  name: 'mediaObjects',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,'contentType','height','width','duration','license','copyrightOwner'],
    copyrightOwner: {
      attributes: [...BASIC_ATTR]
    }
  },
  relationships: []
}

const AGENT = {
  name: 'agents',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,'category','multimediaDescriptions','contacts'],
    contacts: {
      attributes: [...BASIC_ATTR, 'email', 'telephone', 'address', 'availableHours'],
      address: ADDRESS.opts,
      availableHours: HOURS.opts
    },
    multimediaDescriptions: MEDIA_OBJECT.opts
  },
  relationships: ['multimediaDescriptions']
}

const GEOMETRY = {
  name: 'geometries',
  opts: {
    ...DEFAULT_OPTS,
    attributes: ['coordinates', 'category'],
    transform: function (data) {
       data.category = data['@type'];
       return data;
    }
  }
}

const PLACE = {
  name: 'places',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'multimediaDescriptions', 'address', 'geometries', 'howToArrive', 'connections', 'openingHours'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    address: ADDRESS.opts,
    openingHours: HOURS.opts,
    geometries: GEOMETRY.opts
  },
  relationships: ['geometries', 'multimediaDescriptions']
}

const EVENT_SERIES = {
  name: 'eventSeries',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'multimediaDescriptions', 'frequency'],
    multimediaDescriptions: MEDIA_OBJECT.opts
  },
  relationships: ['multimediaDescriptions']
}

const CONTRIBUTION = {
  name: 'contributions',
  opts: {
    ...DEFAULT_OPTS,
    attributes: ['agent', 'role'],
    agent: AGENT.opts
  }
}

const _EVENT_REL = ['multimediaDescriptions','publisher','organizers','sponsors','contributors','series','series.multimediaDescriptions','venues','venues.multimediaDescriptions','venues.geometries'];

const _EVENT_ATTR = [...BASIC_ATTR, ..._EVENT_REL, 'startDate', 'endDate', 'originalStartDate', 'originalEndDate', 'categories', 'structure', 'status', 'capacity'];

const _EVENT = {
  ...DEFAULT_OPTS,
  multimediaDescriptions: MEDIA_OBJECT.opts,
  publisher: AGENT.opts,
  organizers: AGENT.opts,
  sponsors: AGENT.opts,
  contributors: CONTRIBUTION.opts,
  series: EVENT_SERIES.opts,
  venues: PLACE.opts,
}

const SUB_EVENT = {
  name: 'events',
  opts: {
    ..._EVENT,
    attributes: [ ..._EVENT_ATTR ]
  },
  relationships: [ ..._EVENT_REL ]
}

const EVENT = {
  name: 'events',
  opts: {
    ..._EVENT,
    attributes: [..._EVENT_ATTR, ...META_ATTR],
    subEvents: SUB_EVENT.opts
  },
  relationships: [..._EVENT_REL]
}

const LIFT = {
  name: 'lifts',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, ...META_ATTR, 'category','length','minAltitude','maxAltitude','capacityPerHour','personsPerChair',
    'howToArrive','address','geometries','openingHours','connections','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    address: ADDRESS.opts,
    openingHours: HOURS.opts,
    geometries: GEOMETRY.opts,
    connections: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const TRAIL = {
  name: 'trails',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,...META_ATTR, 'category','length','minAltitude','maxAltitude','difficulty','connections','geometries','openingHours','address','howToArrive','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    address: ADDRESS.opts,
    openingHours: HOURS.opts,
    geometries: GEOMETRY.opts,
    connections: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const SNOWPARK = {
  name: 'snowparks',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,...META_ATTR, 'category','difficulty','area','minAltitude','maxAltitude','capacityPerHour','personsPerChair',
    'howToArrive','address','geometries','openingHours','features','connections','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    address: ADDRESS.opts,
    openingHours: HOURS.opts,
    geometries: GEOMETRY.opts,
    connections: {},
    features: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const MOUNTAIN_AREA = {
  name: 'mountainAreas',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, ...META_ATTR,
      'address','geometries','howToArrive','openingHours','area','minAltitude','maxAltitude','totalTrailLength','totalParkArea',
      'multimediaDescriptions','areaOwner','connections','lifts','snowparks','trails','subAreas'],
    address: ADDRESS.opts,
    geometries: GEOMETRY.opts,
    areaOwner: AGENT.opts,
    multimediaDescriptions: MEDIA_OBJECT.opts,
    lifts: LIFT.opts,
    snowparks: SNOWPARK.opts,
    trails: TRAIL.opts,
    connections: {},
    subAreas: {}
  },
  relationships: ['multimediaDescriptions','areaOwner','areaOwner.multimediaDescriptions','connections','lifts','snowparks',
    'trails','subAreas']
}

const SNOW_REPORT = {
  name: 'snowReports',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,...META_ATTR,],
  },
  relationships: []
}

function typeForAttribute (attribute, data) {
  switch(data['@type']) {
    case 'Event':
      return EVENT.name;
    case 'Agent':
      return AGENT.name;
    case 'MediaObject':
      return MEDIA_OBJECT.name;
    case 'EventSeries':
      return EVENT_SERIES.name;
    case 'Point':
    case 'LineString':
    case 'Polygon':
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return GEOMETRY.name;
    case 'Venue':
    case 'Place':
      return PLACE.name;
    case 'Lift':
      return LIFT.name;
    case 'Trail':
      return TRAIL.name;
    case 'Snowpark':
      return SNOWPARK.name;
    case 'MountainArea':
      return MOUNTAIN_AREA.name;
    case 'SnowReport':
      return SNOW_REPORT.name;

    return data['@type'];
  }
}

function getTypeFromRelationship(relationship) {
  switch(relationship){
    case 'multimediaDescriptions':
    case 'series.multimediaDescriptions':
    case 'venues.multimediaDescriptions':
      return MEDIA_OBJECT.name;
    case 'publisher':
    case 'organizers':
    case 'sponsors':
    case 'contributors.agent':
      return AGENT.name;
    case 'contributors':
      return CONTRIBUTION.name;
    case 'series':
      return EVENT_SERIES.name;
    case 'venues':
      return PLACE.name;
    case 'geometries':
    case 'venues.geometries':
      return GEOMETRY.name;
    case 'areaOwner':
      return AGENT.name;
    case 'lifts':
      return LIFT.name;
    case 'snowparks':
      return SNOWPARK.name;
  }
}

const resources = {
  'events': EVENT,
  'agents': AGENT,
  'mediaObjects': MEDIA_OBJECT,
  'places': PLACE,
  'lifts': LIFT,
  'trails': TRAIL,
  'snowparks': SNOWPARK,
  'mountainAreas': MOUNTAIN_AREA,
  'eventSeries': EVENT_SERIES,
  'snowReports': SNOW_REPORT
}

module.exports = {
  getOptions: (path) => {
    let resource  = JSON.parse(JSON.stringify(resources[path]));
    resource.opts.typeForAttribute = typeForAttribute;
    resource.getTypeFromRelationship = getTypeFromRelationship;
    return resource;
  }
}
