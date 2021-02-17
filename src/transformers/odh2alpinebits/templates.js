const meta = {
  lastUpdate: null,
  dataProvider: null
}

const links = {
  self: null
}

const datatypes = {
  Address: {
    street: null,
    city: null,
    region: null,
    country: "IT",
    complement: null,
    categories: null,
    zipcode: null
  },
  Point:  {
    type: 'Point',
    coordinates: []
  },
  LineString:  {
    type: 'LineString',
    coordinates: []
  },
  Polygon: {
    type: 'Polygon',
    coordinates: [[]]
  },
  ContactPoint: {
    email: null,
    telephone: null,
    address: null,
    availableHours: null
  },
  HoursSpecification: {
    dailySchedules: null,
    weeklySchedules: null
  },
  OpensCloses: {
    opens: null,
    closes: null
  },
  Weekly: {
    validFrom: null,
    validTo: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null
  }
}

const resourcesV1 = {
  Event: {
    type: "events",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      capacity: null,
      categories: null,
      description: null,
      endDate: null,
      name: null,
      shortName: null,
      startDate: null,
      status: null,
      url: null
    },
    relationships: {
      contributors: null,
      multimediaDescriptions: null,
      organizers: null,
      publisher: null,
      series: null,
      sponsors: null,
      subEvents: null,
      venues: null,
    }
  },
  EventSeries: {
    type: "eventSeries",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      description: null,
      frequency: null,
      name: null,
      shortName: null,
      url: null
    },
    relationships: {
      editions: null,
      multimediaDescriptions: null
    }
  },
  Venue: {
    type: "venues",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      address: null,
      area: null,
      categories: null,
      description: null,
      geometries: null,
      howToArrive: null,
      name: null,
      shortName: null,
      url: null,
    },
    relationships:{
      multimediaDescriptions: null
    }
  },
  Agent: {
    type: "agents",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      contactPoints: null,
      description: null,
      name: null,
      shortName: null,
      url: null
    },
    relationships: {
      multimediaDescriptions: null
    }
  },
  MediaObject: {
    type: "mediaObjects",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      contentType: null,
      description: null,
      duration: null,
      height: null,
      license: null,
      name: null,
      shortName: null,
      url: null,
      width: null
    },
    relationships: {
      copyrightOwner: null
    }
  },
  Lift: {
    type: "lifts",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      name: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      capacity: null,
      personsPerChair: null,
      openingHours: null,
      address: null,
      geometries: null,
      shortName: null,
      howToArrive: null
    },
    relationships: {
      connections: null,
      multimediaDescriptions: null,
    }
  },
  Trail: {
    type: "trails",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      name: null,
      shortName: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      difficulty: null,
      address: null,
      geometries: null,
      howToArrive: null,
      openingHours: null,
      snowCondition: null,
    },
    relationships: {
      connections: null,
      multimediaDescriptions: null
    }
  },
  Snowpark: {
    type: "snowparks",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      name: null,
      shortName: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      address: null,
      howToArrive: null,
      difficulty: null,
      features: null,
      geometries: null,
      openingHours: null,
      snowCondition: null,
    },
    relationships: {
      connections: null,
      multimediaDescriptions: null
    }
  },
  MountainArea: {
    type: "mountainAreas",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      categories: null,
      name: null,
      categories: null,
      shortName: null,
      description: null,
      url: null,
      geometries: null,
      howToArrive: null,
      openingHours: null,
      area: null,
      minAltitude: null,
      maxAltitude: null,
      totalTrailLength: null,
      totalParkLength: null,
      snowCondition: null,
    },
    relationships: {
      areaOwner: null,
      connections: null,
      multimediaDescriptions: null,
      lifts: null,
      trails: null,
      snowparks: null,
      subAreas: null
    }
  },
}

const resourcesV2 = {
  Event: {
    type: "events",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      capacity: null,
      description: null,
      endDate: null,
      name: null,
      shortName: null,
      startDate: null,
      status: null,
      url: null
    },
    relationships: {
      categories: null,
      contributors: null,
      features: null,
      multimediaDescriptions: null,
      organizers: null,
      publisher: null,
      series: null,
      sponsors: null,
      subEvents: null,
      venues: null,
    }
  },
  EventSeries: {
    type: "eventSeries",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      description: null,
      frequency: null,
      name: null,
      shortName: null,
      url: null
    },
    relationships: {
      categories: null,
      editions: null,
      features: null,
      multimediaDescriptions: null
    }
  },
  Venue: {
    type: "venues",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      address: null,
      area: null,
      description: null,
      geometries: null,
      howToArrive: null,
      name: null,
      shortName: null,
      url: null,
    },
    relationships:{
      categories: null,
      features: null,
      multimediaDescriptions: null
    }
  },
  Agent: {
    type: "agents",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      contactPoints: null,
      description: null,
      name: null,
      shortName: null,
      url: null
    },
    relationships: {
      categories: null,
      features: null,
      multimediaDescriptions: null
    }
  },
  MediaObject: {
    type: "mediaObjects",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      contentType: null,
      description: null,
      duration: null,
      height: null,
      license: null,
      name: null,
      shortName: null,
      url: null,
      width: null
    },
    relationships: {
      categories: null,
      copyrightOwner: null,
      features: null
    }
  },
  Lift: {
    type: "lifts",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      name: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      capacity: null,
      personsPerChair: null,
      openingHours: null,
      address: null,
      geometries: null,
      shortName: null,
      howToArrive: null
    },
    relationships: {
      categories: null,
      connections: null,
      features: null,
      multimediaDescriptions: null,
    }
  },
  Trail: {
    type: "trails",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      name: null,
      shortName: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      difficulty: null,
      address: null,
      geometries: null,
      howToArrive: null,
      openingHours: null,
      snowCondition: null,
    },
    relationships: {
      categories: null,
      connections: null,
      features: null,
      multimediaDescriptions: null
    }
  },
  Snowpark: {
    type: "snowparks",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      name: null,
      shortName: null,
      description: null,
      url: null,
      length: null,
      minAltitude: null,
      maxAltitude: null,
      address: null,
      howToArrive: null,
      difficulty: null,
      geometries: null,
      openingHours: null,
      snowCondition: null,
    },
    relationships: {
      categories: null,
      connections: null,
      features: null,
      multimediaDescriptions: null
    }
  },
  MountainArea: {
    type: "mountainAreas",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      name: null,
      shortName: null,
      description: null,
      url: null,
      geometries: null,
      howToArrive: null,
      openingHours: null,
      area: null,
      minAltitude: null,
      maxAltitude: null,
      totalTrailLength: null,
      totalParkLength: null,
      snowCondition: null,
    },
    relationships: {
      areaOwner: null,
      categories: null,
      connections: null,
      features: null,
      multimediaDescriptions: null,
      lifts: null,
      trails: null,
      snowparks: null,
      subAreas: null
    }
  },
  Category: {
    type: "categories",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      description: null,
      name: null,
      namespace: null,
      resourceTypes: null,
      shortName: null,
      url: null
    },
    relationships: {
      children: null,
      multimediaDescriptions: null,
      parents: null,
    }
  },
  Feature: {
    type: "features",
    id: "",
    meta,
    links,
    attributes: {
      abstract: null,
      description: null,
      name: null,
      namespace: null,
      resourceTypes: null,
      shortName: null,
      url: null
    },
    relationships: {
      children: null,
      multimediaDescriptions: null,
      parents: null,
    }
  },
}

// Function to create empty objects. It is better to have fields with null values than to have missing fields.
module.exports.createObject = (type, apiVersion = '1.0') => {
  
  if(datatypes[type])
    return JSON.parse(JSON.stringify(datatypes[type]));
  
  if((!apiVersion || apiVersion === '1.0') && resourcesV1[type])
    return JSON.parse(JSON.stringify(resourcesV1[type]));
  
  if(apiVersion === '2.0' && resourcesV2[type])
    return JSON.parse(JSON.stringify(resourcesV2[type]));
  
  if(apiVersion && !['1.0','2.0'].includes(apiVersion))
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`)
  
  return {}
}

module.exports.templates = {
  '1.0': {
    agents: resourcesV1.Agent,
    events: resourcesV1.Event,
    eventSeries: resourcesV1.EventSeries,
    lifts: resourcesV1.Lift,
    mediaObjects: resourcesV1.MediaObject,
    mountainAreas: resourcesV1.MountainArea,
    snowparks: resourcesV1.Snowpark,
    trails: resourcesV1.Trail,
    venues: resourcesV1.Venue,
  },
  '2.0': {
    agents: resourcesV2.Agent,
    events: resourcesV2.Event,
    eventSeries: resourcesV2.EventSeries,
    lifts: resourcesV2.Lift,
    mediaObjects: resourcesV2.MediaObject,
    mountainAreas: resourcesV2.MountainArea,
    snowparks: resourcesV2.Snowpark,
    trails: resourcesV2.Trail,
    venues: resourcesV2.Venue,
    categories: resourcesV2.Category,
    categories: resourcesV2.Feature,
  }
};
