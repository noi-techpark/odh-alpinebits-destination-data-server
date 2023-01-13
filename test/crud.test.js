const utils = require("./utils");
const Ajv = require("ajv");
const jsonApiSchema = require("./jsonapi.schema.json");
const schemas = require("../src/schemas");
const apiVersion = process.env.API_VERSION;

const postAgentBody = {
  data: {
    id: "alpinebits",
    type: "agents",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      contactPoints: [
        {
          email: "info@alpinebits.org",
          telephone: "+390000000000",
          address: {
            street: {
              deu: "Bozner Straße Nr. 63/A",
            },
            city: {
              deu: "Frangart",
            },
            region: {
              deu: "Frangart",
            },
            complement: null,
            country: "IT",
            zipcode: "39057",
            type: null,
          },
          availableHours: null,
        },
      ],
      description: {
        eng: 'The "AlpineBits Alliance" is a group of SME operating in the touristic sector working together to innovate and open the data exchange in the alpine tourism, and therefore to optimize the online presence, sales and marketing efforts of the hotels and other accommodations in the alpine territory and also worldwide.',
      },
      name: {
        eng: "AlpineBits Alliance",
      },
      url: "https://people.utwente.nl/c.moraisfonseca",
    },
    relationships: {
      categories: {
        data: [
          {
            id: "alpinebits:organization",
            type: "categories",
          },
        ],
      },
      multimediaDescriptions: null,
    },
  },
};

const postCategoryBody = {
  data: {
    id: "example:category",
    type: "categories",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Category",
      },
      namespace: "example",
      resourceTypes: [
        "agents",
        "categories",
        "events",
        "eventSeries",
        "features",
        "mediaObjects",
        "mountainAreas",
        "lifts",
        "skiSlopes",
        "snowparks",
        "venues",
      ],
    },
    relationships: {
      parents: {
        data: [
          {
            id: "alpinebits:organization",
            type: "categories",
          },
        ],
      },
      children: {
        data: [
          {
            id: "alpinebits:person",
            type: "categories",
          },
        ],
      },
      multimediaDescriptions: null,
    },
  },
};

const postEventBody = {
  data: {
    id: "example-event",
    type: "events",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Event",
      },
      startDate: "2022-04-01",
    },
    relationships: {
      publisher: {
        data: {
          id: "alpinebits",
          type: "agents",
        },
      },
      organizers: {
        data: [
          {
            id: "alpinebits",
            type: "agents",
          },
        ],
      },
      categories: {
        data: [
          {
            id: "alpinebits:inPersonEvent",
            type: "categories",
          },
        ],
      },
    },
  },
};

const postEventSeriesBody = {
  data: {
    id: "example-event-series",
    type: "eventSeries",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Event Series",
      },
      frequency: "weekly",
    },
    relationships: {
      editions: {
        data: [
          {
            id: "example-event",
            type: "events",
          },
        ],
      },
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
    },
  },
};

const postFeatureBody = {
  data: {
    id: "example:feature",
    type: "features",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Feature",
      },
      namespace: "example",
      resourceTypes: [
        "agents",
        "categories",
        "events",
        "eventSeries",
        "features",
        "mediaObjects",
        "mountainAreas",
        "lifts",
        "skiSlopes",
        "snowparks",
        "venues",
      ],
    },
    relationships: {
      parents: {
        data: [
          {
            id: "example:feature",
            type: "features",
          },
        ],
      },
      multimediaDescriptions: null,
    },
  },
};

const postLiftBody = {
  data: {
    id: "example-lift",
    type: "lifts",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example lift",
      },
    },
    relationships: {},
  },
};

const postMediaObjectBody = {
  data: {
    id: "example-media-object",
    type: "mediaObjects",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      contentType: "image/example",
      url: "https://example.com",
    },
    relationships: {
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
    },
  },
};

const postMountainAreaBody = {
  data: {
    id: "example-mountain-area",
    type: "mountainAreas",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Mountain Area",
      },
    },
    relationships: {
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
      connections: {
        data: [
          {
            id: "example-lift",
            type: "lifts",
          },
        ],
      },
      lifts: {
        data: [
          {
            id: "example-lift",
            type: "lifts",
          },
        ],
      },
    },
  },
};

const postSkiSlopeBody = {
  data: {
    id: "example-ski-slope",
    type: "skiSlopes",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Ski Slope",
      },
    },
    relationships: {
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
      connections: {
        data: [
          {
            id: "example-lift",
            type: "lifts",
          },
        ],
      },
      multimediaDescriptions: {
        data: [
          {
            id: "example-media-object",
            type: "mediaObjects",
          },
        ],
      },
    },
  },
};

const postSnowparkBody = {
  data: {
    id: "example-snowpark",
    type: "snowparks",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Snowpark",
      },
    },
    relationships: {
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
      features: {
        data: [
          {
            id: "example:feature",
            type: "features",
          },
        ],
      },
      connections: {
        data: [
          {
            id: "example-lift",
            type: "lifts",
          },
        ],
      },
      multimediaDescriptions: {
        data: [
          {
            id: "example-media-object",
            type: "mediaObjects",
          },
        ],
      },
    },
  },
};

const postVenueBody = {
  data: {
    id: "example-venue",
    type: "venues",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      name: {
        eng: "Example Venue",
      },
    },
    relationships: {
      categories: {
        data: [
          {
            id: "example:category",
            type: "categories",
          },
        ],
      },
      multimediaDescriptions: {
        data: [
          {
            id: "example-media-object",
            type: "mediaObjects",
          },
        ],
      },
    },
  },
};

const patchAgentBody = {
  data: {
    id: "alpinebits",
    type: "agents",
    attributes: {
      description: {
        eng: "Example description",
      },
      contactPoints: [
        {
          email: "info@noi.bz.it",
          telephone: null,
          address: null,
          availableHours: null,
        },
      ],
    },
  },
};

const patchCategoryBody = {
  data: {
    id: "example:category",
    type: "categories",
    attributes: {
      description: {
        eng: "Example description",
      },
      namespace: "another",
    },
  },
};

const patchEventBody = {
  data: {
    id: "example-event",
    type: "events",
    attributes: {
      description: {
        eng: "Example description",
      },
    },
    relationships: {
      series: null,
    },
  },
};

const patchEventSeriesBody = {
  data: {
    id: "example-event-series",
    type: "eventSeries",
    attributes: {
      description: {
        eng: "Example description",
      },
      frequency: null,
    },
  },
};

const patchFeatureBody = {
  data: {
    id: "example:feature",
    type: "features",
    attributes: {
      description: {
        ita: "Example description",
      },
      namespace: "another",
    },
    relationships: {
      children: null,
    },
  },
};

const patchLiftBody = {
  data: {
    id: "example-lift",
    type: "lifts",
    attributes: {
      capacity: 100,
    },
    relationships: {},
  },
};

const patchMediaObjectBody = {
  data: {
    id: "example-media-object",
    type: "mediaObjects",
    attributes: {
      author: "John Doe",
    },
  },
};

const patchMountainAreaBody = {
  data: {
    id: "example-mountain-area",
    type: "mountainAreas",
    relationships: {
      areaOwner: {
        data: {
          id: "alpinebits",
          type: "agents",
        },
      },
    },
  },
};

const patchSkiSlopeBody = {
  data: {
    id: "example-ski-slope",
    type: "skiSlopes",
    attributes: {
      difficulty: {
        eu: "expert",
        us: null,
      },
    },
  },
};

const patchSnowparkBody = {
  data: {
    id: "example-snowpark",
    type: "snowparks",
    attributes: {
      difficulty: "expert",
      snowCondition: {
        obtainedIn: null,
        primarySurface: "powder",
        secondarySurface: null,
        baseSnow: 50,
        baseSnowRange: null,
        latestStorm: null,
        snowOverNight: null,
        groomed: null,
        snowMaking: null,
      },
    },
    relationships: {
      features: null,
    },
  },
};

const patchVenueBody = {
  data: {
    id: "example-venue",
    type: "venues",
    meta: {
      dataProvider: "https://example.com",
    },
    attributes: {
      geometries: [
        {
          type: "Point",
          coordinates: [11.358447074890137, 46.49667880447103],
        },
      ],
    },
  },
};

describe("Creation, Update, and Deletion Tests", () => {
  const testJsonApiSchema = (body) => {
    test(`Test JSON:API schema for /${body.data.type}/post`, () => {
      let ajv = new Ajv({ verbose: false, allErrors: true });
      let validateJsonApi = ajv.compile(jsonApiSchema);
      let isValid = validateJsonApi(body);
      if (!isValid) console.error(validateJsonApi.errors);
      expect(isValid).toBe(true);
    });
  };

  const testSpecificSchema = (body, schema) => {
    test(`Test specific schema for /${body.data.type}/post`, () => {
      let [isValid, ajv] = schema.validate(body);
      if (!isValid) console.error(ajv.errors);
      expect(isValid).toBe(true);
    });
  };

  const testSchemas = (body, schema) => {
    testJsonApiSchema(body);
    testSpecificSchema(body, schema);
  };

  testSchemas(postAgentBody, schemas["/agents/post"]);
  testSchemas(postCategoryBody, schemas["/categories/post"]);
  testSchemas(postEventBody, schemas["/events/post"]);
  testSchemas(postEventSeriesBody, schemas["/eventSeries/post"]);
  testSchemas(postFeatureBody, schemas["/features/post"]);
  testSchemas(postLiftBody, schemas["/lifts/post"]);
  testSchemas(postMediaObjectBody, schemas["/mediaObjects/post"]);
  testSchemas(postMountainAreaBody, schemas["/mountainAreas/post"]);
  testSchemas(postSkiSlopeBody, schemas["/skiSlopes/post"]);
  testSchemas(postSnowparkBody, schemas["/snowparks/post"]);
  testSchemas(postVenueBody, schemas["/venues/post"]);

  testSchemas(patchAgentBody, schemas["/agents/:id/patch"]);
  testSchemas(patchCategoryBody, schemas["/categories/:id/patch"]);
  testSchemas(patchEventBody, schemas["/events/:id/patch"]);
  testSchemas(patchEventSeriesBody, schemas["/eventSeries/:id/patch"]);
  testSchemas(patchFeatureBody, schemas["/features/:id/patch"]);
  testSchemas(patchLiftBody, schemas["/lifts/:id/patch"]);
  testSchemas(patchMediaObjectBody, schemas["/mediaObjects/:id/patch"]);
  testSchemas(patchMountainAreaBody, schemas["/mountainAreas/:id/patch"]);
  testSchemas(patchSkiSlopeBody, schemas["/skiSlopes/:id/patch"]);
  testSchemas(patchSnowparkBody, schemas["/snowparks/:id/patch"]);
  testSchemas(patchVenueBody, schemas["/venues/:id/patch"]);
});

describe("Creation, Update, and Deletion Tests", () => {
  test(`Create and delete agent`, async () => {
    const postBodies = [
      postAgentBody,
      postCategoryBody,
      postEventBody,
      postEventSeriesBody,
      postFeatureBody,
      postLiftBody,
      postMediaObjectBody,
      postMountainAreaBody,
      postSkiSlopeBody,
      postSnowparkBody,
      postVenueBody,
    ];

    const patchBodies = [
      patchAgentBody,
      patchCategoryBody,
      patchEventBody,
      patchEventSeriesBody,
      patchFeatureBody,
      patchLiftBody,
      patchMediaObjectBody,
      patchMountainAreaBody,
      patchSkiSlopeBody,
      patchSnowparkBody,
      patchVenueBody,
    ];

    const postFn = async (body) =>
      utils.post(`/${apiVersion}/${body.data.type}`, body);
    const getFn = async (body) =>
      utils.get(`/${apiVersion}/${body.data.type}/${body.data.id}`);
    const patchFn = async (body) =>
      utils.patch(`/${apiVersion}/${body.data.type}/${body.data.id}`, body);
    const deleteFn = async (body) =>
      utils.delete(`/${apiVersion}/${body.data.type}/${body.data.id}`);

    try {
      const postRes = [];
      const getRes = [];
      const patchRes = [];
      const getPatchedRes = [];
      const deleteRes = [];

      for (const body of postBodies) {
        await postFn(body).then((res) => postRes.push(res));
      }

      for (const body of postBodies) {
        await getFn(body).then((res) => getRes.push(res));
      }

      for (const body of patchBodies) {
        await patchFn(body).then((res) => patchRes.push(res));
      }

      for (const body of patchBodies) {
        await getFn(body).then((res) => getPatchedRes.push(res));
      }

      for (const body of postBodies.reverse()) {
        await deleteFn(body).then((res) => deleteRes.push(res));
      }

      postRes.forEach((res) => expect(res.status).toBe(200));
      getRes.forEach((res) => expect(res.status).toBe(200));
      patchRes.forEach((res) => expect(res.status).toBe(200));
      getPatchedRes.forEach((res, index) => {
        const original = getRes[index].data;
        const modified = res.data;
        const status = res.status;

        expect(status).toBe(200);
        expect(
          original.data.meta.lastUpdate < modified.data.meta.lastUpdate
        ).toBe(true);
      });
      deleteRes.forEach((res) => expect(res.status).toBe(200));
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});
