// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const utils = require("./utils");
const Ajv = require("ajv");
const jsonApiSchema = require("../src/validator/schemas/jsonapi.schema.json");

// todo: replace with env variable
const apiVersion = "2021-04";

module.exports.basicSchemaTests = (opts) => {
  let ajv = new Ajv({ verbose: false, allErrors: true });
  let validateJsonApi = ajv.compile(jsonApiSchema);
  let validateResourceArray = ajv.compile(opts.schema.arraySchema);
  let validateResource = ajv.compile(opts.schema.resourceSchema);

  describe(`Messages should validate against AlpineBits and JSON:API schemas on route /${opts.route}`, () => {
    for (let i = opts.schema.pageStart; i <= opts.schema.pageEnd; i++) {
      test(`/${opts.route}: page[number]=${i} and page[size]=${opts.schema.pageSize}`, () => {
        return utils.axiosInstance
          .get(`/${apiVersion}/${opts.route}?page[size]=${opts.schema.pageSize}&page[number]=${i}`)
          .then((res) => {
            let isValid = validateResourceArray(res.data);
            expect(isValid).toBe(true);

            isValid = validateJsonApi(res.data);
            expect(isValid).toBe(true);
          });
      });
    }
  });

  describe(`Messages with included resources should validate against AlpineBits and JSON:API schemas on route /${opts.route}`, () => {
    if (!opts.multiInclude || !opts.multiInclude.relationships) return;

    for (let i = opts.schema.pageStart; i <= opts.schema.pageEnd; i++) {
      test(`/${opts.route}: page[number]=${i}`, () => {
        return utils.axiosInstance
          .get(
            `/${apiVersion}/${opts.route}?page[size]=${
              opts.schema.pageSize
            }&page[number]=${i}&include=${opts.multiInclude.relationships.join(",")}`
          )
          .then((res) => {
            let isValid = validateResourceArray(res.data);
            expect(isValid).toBe(true);

            isValid = validateJsonApi(res.data);
            expect(isValid).toBe(true);
          });
      });
    }
  });

  describe(`Individual resource messages should validate against AlpineBits and JSON:API schemas on routes /${opts.route}/:id`, () => {
    let resourceArray;

    beforeAll(() => {
      return utils.axiosInstance.get(`/${apiVersion}/${opts.route}?page[size]=10&page[number]=1`).then((response) => {
        resourceArray = response.data.data;
      });
    });

    test(`Checking the first 10 resources on /${apiVersion}/${opts.route}/`, () => {
      let requests = [];

      for (let i = 0; i < resourceArray.length; i++) {
        let id = resourceArray[i].id;
        let request = utils.axiosInstance.get(`/${apiVersion}/${opts.route}/${id}`);
        requests.push(request);
      }

      return Promise.all(requests).then((resArray) => {
        resArray.forEach((res) => {
          let isValid = validateResource(res.data);

          if (!isValid) console.log("Invalid AlpineBits schema:", res.data.id);

          expect(isValid).toBe(true);

          if (!isValid) console.log("Invalid JSON:API schema:", res.data.id);

          expect(isValid).toBe(true);
        });
      });
    });
  });
};

// just to avoid warning, that no tests in test file
describe("Basic schema tests for API endpoints", () => {
  test("should be used per implementation", () => {});
});
