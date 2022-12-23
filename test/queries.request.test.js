const utils = require("./utils");
const apiVersion = process.env.API_VERSION;

let sample = {
  queries: [
    {
      route: `/${apiVersion}/categories/alpinebits:person`,
      query: "include=publisher",
      expectStatus: 200,
    },
    {
      route: `/${apiVersion}/categories/alpinebits:person`,
      query: "fields[categories]=name,resourceTypes",
      expectStatus: 200,
    },
    {
      route: `/${apiVersion}/categories/alpinebits:person`,
      query: "sort=startDate",
      expectStatus: 400,
      description: "Test invalid query on resource endpoint",
    },
    {
      route: `/${apiVersion}/events`,
      query: "xxx",
      expectStatus: 400,
    },
    {
      route: `/${apiVersion}/events`,
      query: "xxx",
      expectStatus: 400,
      description: "Test invalid query on resource type endpoint",
    },
    {
      route: `/${apiVersion}/events`,
      query: "page=1",
      expectStatus: 400,
      description: "Test invalid page query assignment",
    },
    {
      route: `/${apiVersion}/events`,
      query: "page[size]=0",
      expectStatus: 400,
      description: "Test invalid page size value",
    },
    {
      route: `/${apiVersion}/events`,
      query: "page[number]=a",
      expectStatus: 400,
      description: "Test invalid page number value",
    },
    {
      route: `/${apiVersion}/events`,
      query: "page[number]=999999",
      expectStatus: 404,
      description: "Test page number not found",
    },
    {
      route: `/${apiVersion}/events`,
      query: "page[xxx]=a",
      expectStatus: 400,
      description: "Test invalid page query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "include=publisher&include=organizers",
      expectStatus: 400,
      description: "Test repeated include query",
    },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "include=xxx",
    //   expectStatus: 400,
    //   description: "Test unknown values in include query",
    // },
    {
      route: `/${apiVersion}/events`,
      query: "sort=startDate&sort=endDate",
      expectStatus: 400,
      description: "Test repeated sort query",
    },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "sort=name",
    //   expectStatus: 400,
    //   description: "Test unsupported values in sort query",
    // },
    {
      route: `/${apiVersion}/events`,
      query: "random=1&sort=endDate",
      expectStatus: 400,
      description: "Test query conflict: sort and random",
    },
    {
      route: `/${apiVersion}/events`,
      query: "random=1&random=2",
      expectStatus: 400,
      description: "Test repeated random query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "random=a",
      expectStatus: 400,
      description: "Test invalid random seed",
    },
    {
      route: `/${apiVersion}/mountainAreas`,
      query: "search[name]=a",
      expectStatus: 400,
      description: "Test unsupported search on resource types",
    },
    {
      route: `/${apiVersion}/events`,
      query: "search[name]=a&search[name]=a",
      expectStatus: 400,
      description: "Test repeated search query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "search=a",
      expectStatus: 200,
      description: "Test invalid values in search query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "search[description]=a",
      expectStatus: 400,
      description: "Test unsupported search field in search query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "filter=a",
      expectStatus: 400,
      description: "Test invalid value in filter query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "filter[xxx]=a",
      expectStatus: 400,
      description: "Test unsupported filter in filter query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "filter[name][xxx]=a",
      expectStatus: 400,
      description: "Test unsupported operand in filter query",
    },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "filter[venues][near]=123",
    //   expectStatus: 400,
    //   description: "Test invalid value in filter query - near",
    // },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "filter[startDate][lte]=asd",
    //   expectStatus: 400,
    //   description: "Test invalid value in filter query - startDate",
    // },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "filter[organizers][eq]=xxx,yyy",
    //   expectStatus: 400,
    //   description: "Test invalid value in filter query - organizers",
    // },
    {
      route: `/${apiVersion}/events`,
      query: "fields[xxx]=name",
      expectStatus: 400,
      description: "Test unsupported resource type in fields query",
    },
    {
      route: `/${apiVersion}/events`,
      query: "fields=xxx",
      expectStatus: 400,
      description: "Test unsupported value in fields query",
    },
    // {
    //   route: `/${apiVersion}/events`,
    //   query: "fields[events]=xxx",
    //   expectStatus: 400,
    //   description: "Test unsupported attribute or relationship in fields query",
    // },
    {
      route: `/${apiVersion}/events`,
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
          if (response?.status !== expectStatus) {
            console.log(response.status);
            console.log(
              `expectStatus: ${expectStatus}, response.status: ${response?.status}`
            );
          }
          expect(response.status).toBe(expectStatus);
        })
        .catch((err) => {
          const { response } = err;
          expect(response.status).toBe(expectStatus);
        }));
  });
});
