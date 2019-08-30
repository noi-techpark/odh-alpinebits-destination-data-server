const templates = {
  Event: {
    "@type": "Event",
    dataProvider: "http://tourism.opendatahub.bz.it/",
    lastUpdate: null,
    id: null,
    name: {},
    shortName: {},
    description: {},
    abstract: {},
    startDate: null,
    endDate: null,
    venues: [],
    organizer: {},
    publisher: {}
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
    address: {},
    geometries: [],
    openingHours: []
  },
  ContactPoint: {
    "@type": "ContactPoint",
    email: null,
    telephone: null,
    address: {},
    availableHours: {}
  },
  HoursSpecification: {
    "@type": "HoursSpecification",
    "hours": [],
    "validFrom": null,
    "validTo": null
  }
}

// Function to create empty objects. It is better to have fields with null values than to have missing fields.
module.exports.createObject = (type) => {
  return JSON.parse(JSON.stringify(templates[type]));
}
