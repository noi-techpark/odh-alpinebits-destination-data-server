const templates = {
  Event: {
    "@type": "Event",
    dataProvider: "",
    lastUpdate: "",
    id: "",
    name: {
      deu: "",
      eng: "",
      ita: ""
    },
    shortName: {
      deu: "",
      eng: "",
      ita: ""
    },
    description: {
      deu: "",
      eng: "",
      ita: ""
    },
    abstract: {
      deu: "",
      eng: "",
      ita: ""
    },
    structure: "simple",
    startDate: null,
    endDate: null,
    venues: [],
    organizers: [],
    publisher: {},
    contributors: [],
    sponsors: [],
    multimediaDescriptions: []
    // subEvents: [],
  },
  Agent: {
    "@type": "Agent",
    id: "123456",
    name: {}
  },
  MediaObject: {
    "@type": "MediaObject",
    // name: {},
    description: {},
    url: "",
    contentType: "",
    // height: 0,
    // width: 0,
    license: "",
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
    id: "",
    name: {},
    // description: {},
    address: {},
    geometries: [],
    openingHours: [],
    multimediaDescriptions: []
  },
  ContactPoint: {
    "@type": "ContactPoint",
    address: {}
  },
  HoursSpecification: {
    "@type": "HoursSpecification",
    hours: [],
    validFrom: null,
    validTo: null
  }
}

// Function to create empty objects. It is better to have fields with null values than to have missing fields.
module.exports.createObject = (type) => {
  return JSON.parse(JSON.stringify(templates[type]));
}
