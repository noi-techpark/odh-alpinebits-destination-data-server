const { basicRouteTests } = require("./route.test");
const { basicResourceRouteTests } = require("./route_id.test");
const { basicSchemaTests } = require("./route.schema.test");
const { basicQueriesTest } = require("./queries.test");
const arraySchema = require("../src/validator/schemas/events.schema.json");
const resourceSchema = require("../src/validator/schemas/events.id.schema.json");

let opts = {
  route: "events",
  resourceType: "events",
  sampleAttributes: ["name", "startDate", "endDate", "url"],
  sampleRelationships: ["categories", "organizers", "venues", "multimediaDescriptions"],
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
      attributes: ["name", "url"],
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
  queries: [
    {
      query: "filter[lang]=eng",
      expectStatus: 200,
    },
    {
      query: "filter[lang]=eng,fra",
      expectStatus: 200,
    },
    {
      query: "filter[venues][near]=11.309245,46.862025,10000",
      expectStatus: 200,
    },
    {
      query: "filter[startDate][gt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "filter[startDate][lt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "filter[endDate][gt]=2020-10-10",
      expectStatus: 200,
    },
    {
      query: "filter[endDate][lt]=2020-10-10",
      expectStatus: 200,
    },
    {
      query: "filter[lastUpdate][gt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "filter[lastUpdate][lt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "filter[categories][any]=schema:VisualArts,odh:messen-markte",
      expectStatus: 200,
    },
    {
      query: "filter[organizers][eq]=22C0A7135D3341A481BECEC0DCDB373F",
      expectStatus: 200,
    },
    {
      query: "search[name]=bolz",
      expectStatus: 200,
    },
    {
      query: "sort=-startDate",
      expectStatus: 200,
    },
    {
      query: "random=1",
      expectStatus: 200,
    },
    {
      query:
        "filter[lang]=eng,fra&filter[venues][near]=11.309245,46.862025,10000&filter[startDate][lt]=2020-10-01&filter[endDate][gt]=2020-10-10&filter[lastUpdate][gt]=2020-10-01&filter[categories][any]=schema:VisualArts,odh:messen-markte&filter[organizers][eq]=22C0A7135D3341A481BECEC0DCDB373F&search[name]=bolz&sort=-startDate",
      expectStatus: 200,
    },
  ],
};

function eventSortingTest() {
  const utils = require("./utils");

  describe(`Event sorting tests`, () => {
    let unsortedData;

    beforeAll(() => {
      return utils.axiosInstance.get(`/2021-04/events`).then((res) => {
        ({ data: unsortedData } = res.data);
      });
    });

    test(`Test events on descending order of startDate`, () => {
      return utils.axiosInstance.get(`/2021-04/events?sort=-startDate`).then((res) => {
        let { data } = res.data;
        let isInDescendingOrder = true;

        const dates = data.map((event) => new Date(event.attributes.startDate));

        for (let index = 1; index < dates.length; index++) {
          if (dates[index] > dates[index - 1]) {
            isInDescendingOrder = false;
          }
        }

        expect(isInDescendingOrder).toBe(true);
      });
    });
  });
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
// basicSchemaTests(opts);
basicQueriesTest(opts);
eventSortingTest();
