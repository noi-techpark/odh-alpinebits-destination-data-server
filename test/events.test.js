const { basicRouteTests } = require("./route.test");
const { basicResourceRouteTests } = require("./route_id.test");
const { basicSchemaTests } = require("./route.schema.test");
const { basicFilterTests } = require("./filter.test");
const { basicSearchTests } = require("./search.test");
const arraySchema = require("../src/validator/schemas/events.schema.json");
const resourceSchema = require("../src/validator/schemas/events.id.schema.json");

let opts = {
  route: "events",
  resourceType: "events",
  sampleAttributes: ["name", "startDate", "endDate", "categories"],
  sampleRelationships: ["organizers", "venues", "multimediaDescriptions"],
  include: {
    relationship: "organizers",
    resourceType: "agents",
  },
  multiInclude: {
    relationships: ["organizers", "venues", "multimediaDescriptions"],
    resourceTypes: ["agents", "venues", "mediaObjects"],
  },
  selectInclude: {
    attribute: "name",
    relationship: "organizers",
    resourceType: "agents",
  },
  multiSelectInclude: [
    {
      attributes: ["name", "categories"],
      relationship: "organizers",
      resourceType: "agents",
    },
    {
      attributes: ["name", "address"],
      relationship: "venues",
      resourceType: "venues",
    },
  ],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50,
  },
  filters: [
    {
      name: "updatedAfter",
      value: "2020-09-01",
    },
    {
      name: "lang",
      value: "fra",
    },
    {
      name: "categories",
      value: "schema/VisualArts,odh/messen-markte",
    },
    {
      name: "nearTo",
      value: "11.309245,46.862025,10000",
    },
    {
      name: "happeningAfter",
      value: "2020-10-01",
    },
    {
      name: "happeningBefore",
      value: "2020-10-30",
    },
    {
      name: "happeningBetween",
      value: "2020-10-01,2020-11-01",
    },
  ],
  searches: [
    {
      name: "name",
      value: "bolz",
    },
  ],
};

function eventSortingTest() {
  const utils = require("./utils");

  describe(`Event sorting tests`, () => {
    let unsortedData;

    beforeAll(() => {
      return utils.axiosInstance.get(`/1.0/events`).then((res) => {
        ({ data: unsortedData } = res.data);
      });
    });

    test(`Test events on ascending order of startDate`, () => {
      return utils.axiosInstance
        .get(`/1.0/events?sort=-startDate`)
        .then((res) => {
          let { data } = res.data;
          let isInAscendingOrder = true;

          data = data.map((event) => new Date(event.attributes.startDate));

          for (let index = 1; index < data.length; index++) {
            if (data[0] > data[1]) {
              isInAscendingOrder = false;
            }
          }

          expect(isInAscendingOrder).toBe(true);
        });
    });
  });
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
basicFilterTests(opts);
basicSearchTests(opts);
eventSortingTest();
