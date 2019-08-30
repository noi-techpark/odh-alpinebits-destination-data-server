const templates = {
  Event: {
    "@type": "Event",
    id: null,
    dataProvider: "http://tourism.opendatahub.bz.it/",
    name: {},
    shortName: {},
    description: {},
    abstract: {},
    startDate: null,
    endDate: null,
    venues: []
  },
  Agent: {
    "@type": "Agent",
    name: {}
  },
  MediaObject: {
    "@type": "MediaObject",
    name: {},
    description: {},
    url: null,
    contentType: null,
    height: null,
    width: null,
    license: null,
    copyrightOwner: {}
  },
  Address: {
    "@type": "Address",
    street: {},
    city: {},
    region: {
      deu: "BZ",
      eng: "BZ",
      ita: "BZ",
    },
    country: "IT",
    zipcode: null,
    complement: {},
  },
  Point:  {
    "@type": "Point",
    coordinates: []
  },
  Venue: {
    "@type": "Venue",
    id: null,
    name: {},
    description: {},
    address: { },
    geometries: []
  },
  ContactPoint: {
    "@type": "ContactPoint",
    email: null,
    telephone: null,
    address: {},
    availableHours: {}
  }
}

// Function to create empty objects. It is better to have fields with null values than to have missing fields.
module.exports.createObject = (type) => {
  return JSON.parse(JSON.stringify(templates[type]));
}
