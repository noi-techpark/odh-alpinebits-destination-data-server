// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

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

test("Placeholder", () => expect(true).toBe(true));
