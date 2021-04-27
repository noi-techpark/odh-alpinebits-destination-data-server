const utils = require("./utils");

module.exports.basicQueriesTest = (opts) => {
  describe(`Basic queries tests for /2021-04/${opts.route}`, () => {
    opts.queries.forEach((queryItem) => {
      const { query, expectStatus, description } = queryItem;
      const path = `/2021-04/${opts.route}?${query}`;

      test(`${path}${description ? " - " + description : ""}`, () =>
        utils.axiosInstance
          .get(path)
          .then((response) => {
            expect(response.status).toBe(expectStatus);
          })
          .catch((err) => {
            const { response } = err;
            expect(response.status).toBe(expectStatus);
          }));
    });
  });
};

let sample = {
  queries: [
    {
      route: "/2021-04/events/FD7DC58E68A9447FB987460138FB3C85",
      query: "include=publisher",
      expectStatus: 200,
    },
    {
      route: "/2021-04/events/FD7DC58E68A9447FB987460138FB3C85",
      query: "fields[events]=name,startDate",
      expectStatus: 200,
    },
    {
      route: "/2021-04/events/FD7DC58E68A9447FB987460138FB3C85",
      query: "sort=startDate",
      expectStatus: 400,
      description: "Test invalid query on resource endpoint",
    },
    {
      route: "/2021-04/events",
      query: "xxx",
      expectStatus: 400,
    },
    {
      route: "/2021-04/events",
      query: "xxx",
      expectStatus: 400,
      description: "Test invalid query on resource type endpoint",
    },
    {
      route: "/2021-04/events",
      query: "page=1",
      expectStatus: 400,
      description: "Test invalid page query assignment",
    },
    {
      route: "/2021-041-04/events",
      query: "page[size]=0",
      expectStatus: 400,
      description: "Test invalid page size value",
    },
    {
      route: "/2021-041-04/events",
      query: "page[number]=a",
      expectStatus: 400,
      description: "Test invalid page number value",
    },
    {
      route: "/2021-04/events",
      query: "page[number]=999999",
      expectStatus: 404,
      description: "Test page number not found",
    },
    {
      route: "/2021-04/events",
      query: "page[xxx]=a",
      expectStatus: 400,
      description: "Test invalid page query",
    },
    {
      route: "/2021-04/events",
      query: "include=publisher&include=organizers",
      expectStatus: 400,
      description: "Test repeated include query",
    },
    {
      route: "/2021-04/events",
      query: "include=publisher,publisher",
      expectStatus: 400,
      description: "Test repeated values in include query",
    },
    {
      route: "/2021-04/events",
      query: "include=xxx",
      expectStatus: 400,
      description: "Test unknown values in include query",
    },
    {
      route: "/2021-04/events",
      query: "sort=startDate&sort=endDate",
      expectStatus: 400,
      description: "Test repeated sort query",
    },
    {
      route: "/2021-04/events",
      query: "sort=startDate,-startDate",
      expectStatus: 400,
      description: "Test repeated values in sort query",
    },
    {
      route: "/2021-04/events",
      query: "sort=endDate",
      expectStatus: 400,
      description: "Test unsupported values in sort query",
    },
    {
      route: "/2021-04/events",
      query: "random=1&sort=endDate",
      expectStatus: 400,
      description: "Test query conflict: sort and random",
    },
    {
      route: "/2021-04/events",
      query: "random=1&random=2",
      expectStatus: 400,
      description: "Test repeated random query",
    },
    {
      route: "/2021-04/events",
      query: "random=a",
      expectStatus: 400,
      description: "Test invalid random seed",
    },
    {
      route: "/2021-04/mountainAreas",
      query: "search[name]=a",
      expectStatus: 400,
      description: "Test unsupported search on resource types",
    },
    {
      route: "/2021-04/events",
      query: "search[name]=a&search[name]=a",
      expectStatus: 400,
      description: "Test repeated search query",
    },
    {
      route: "/2021-04/events",
      query: "search=a",
      expectStatus: 400,
      description: "Test invalid values in search query",
    },
    {
      route: "/2021-04/events",
      query: "search[description]=a",
      expectStatus: 400,
      description: "Test unsupported search field in search query",
    },
    {
      route: "/2021-04/events",
      query: "filter=a",
      expectStatus: 400,
      description: "Test invalid value in filter query",
    },
    {
      route: "/2021-04/events",
      query: "filter[xxx]=a",
      expectStatus: 400,
      description: "Test unsupported filter in filter query",
    },
    {
      route: "/2021-04/events",
      query: "filter[name][xxx]=a",
      expectStatus: 400,
      description: "Test unsupported operand in filter query",
    },
    {
      route: "/2021-04/events",
      query: "filter[venues][near]=123",
      expectStatus: 400,
      description: "Test invalid value in filter query - near",
    },
    {
      route: "/2021-04/events",
      query: "filter[startDate][lte]=asd",
      expectStatus: 400,
      description: "Test invalid value in filter query - startDate",
    },
    {
      route: "/2021-04/events",
      query: "filter[categories][any]=asd",
      expectStatus: 400,
      description: "Test invalid value in filter query - category",
    },
    {
      route: "/2021-04/events",
      query: "filter[organizers][eq]=xxx,yyy",
      expectStatus: 400,
      description: "Test invalid value in filter query - organizers",
    },
    {
      route: "/2021-04/events",
      query: "fields[xxx]=name",
      expectStatus: 400,
      description: "Test unsupported resource type in fields query",
    },
    {
      route: "/2021-04/events",
      query: "fields=xxx",
      expectStatus: 400,
      description: "Test unsupported value in fields query",
    },
    {
      route: "/2021-04/events",
      query: "fields[events]=xxx",
      expectStatus: 400,
      description: "Test unsupported attribute or relationship in fields query",
    },
    {
      route: "/2021-04/events",
      query: "fields[events]=name&fields[events]=name",
      expectStatus: 400,
      description: "Test repeated values in fields query",
    },
  ],
};

describe(`Basic queries tests`, () => {
  sample.queries.forEach((queryItem) => {
    const { query, expectStatus, description, route } = queryItem;
    const path = `${route}?${query}`;

    test(`${path}${description ? " - " + description : ""}`, () =>
      utils.axiosInstance
        .get(path)
        .then((response) => {
          expect(response.status).toBe(expectStatus);
          // console.log("Response",response);
        })
        .catch((err) => {
          const { response } = err;
          expect(response.status).toBe(expectStatus);
          // if (!response) console.log("Error", err);
        }));
  });
});
