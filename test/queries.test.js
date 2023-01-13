const utils = require("./utils");
const apiVersion = process.env.API_VERSION;

module.exports.basicQueriesTest = (opts) => {
  describe(`Basic queries tests for /${apiVersion}/${opts.route}`, () => {
    opts.queries.forEach((queryItem) => {
      const { query, expectStatus, description } = queryItem;
      const path = `/${apiVersion}/${opts.route}?${query}`;

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

test("Placeholder", () => expect(true).toBe(true));
