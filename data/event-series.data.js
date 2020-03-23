
module.exports = [
  {
    type: "eventSeries",
    id: "0",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Jazz Festival",
        ita: "Südtirol Jazz Festival",
        deu: "Südtirol Jazz Festival"
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: "https://www.suedtiroljazzfestival.com/",
      frequency: "annual"

    },
    relationships: {
      multimediaDescriptions: {
        data: [
          {
            type: "mediaObjects",
            id: "0"
          },
          {
            type: "mediaObjects",
            id: "1"
          }
        ],
        links: {
          related: null
        }
      },
      editions: null
    },
    included: [
      {
        type: "mediaObjects",
        id: "0",
        meta: {
          dataProvider: null,
          lastUpdate: null
        },
        attributes: {
          abstract: null,
          categories: null,
          contentType: "image/png",
          description: null,
          duration: null,
          height: 100,
          license: "CC0-1.0",
          name: {
            eng: "My image."
          },
          shortName: null,
          url: "http://example.com/image.png",
          width: 200
        },
        relationships: {
          copyrightOwner: null
        },
        links: {
          self: null
        } 
      },
      {
        type: "mediaObjects",
        id: "1",
        meta: {
          dataProvider: null,
          lastUpdate: null
        },
        attributes: {
          abstract: null,
          categories: null,
          contentType: "image/png",
          description: null,
          duration: null,
          height: 400,
          license: "CC0-1.0",
          name: {
            eng: "My second image."
          },
          shortName: null,
          url: "http://example.com/another-image.png",
          width: 400
        },
        relationships: {
          copyrightOwner: null
        },
        links: {
          self: null
        } 
      }
    ]
  },
  {
    type: "eventSeries",
    id: "1",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Bolzano Christmas Market"
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: "annual"
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "2",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Rock Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "3",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Pop Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "4",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Blues Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "5",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Local Music Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "6",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Eletronic Music Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "7",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Country Music Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "8",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Classical Music Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "9",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Punk Rock Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "10",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol K-Pop Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "11",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol International Music Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  },
  {
    type: "eventSeries",
    id: "12",
    meta: {
      lastUpdate: "2020-04-01T00:00:00.00+01:00",
      dataProvider: "http://tourism.opendatahub.bz.it/"
    },
    links: {
      self: null
    },
    attributes: {
      name: {
        eng: "Südtirol Heavy Metal Festival",
      },
      shortName: null,
      description: null,
      abstract: null,
      categories: null,
      url: null,
      frequency: null
    },
    relationships: {
      multimediaDescriptions: null,
      editions: null
    },
    included: []
  }
]
