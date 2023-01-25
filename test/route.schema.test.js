const utils = require("./utils");
const Ajv = require("ajv");
const jsonApiSchema = require("./jsonapi.schema.json");

const schemas = require("../src/schemas");

const apiVersion = process.env.API_VERSION;

module.exports.basicSchemaTests = (opts) => {
  let ajv = new Ajv({ verbose: false, allErrors: true });
  let validateJsonApi = ajv.compile(jsonApiSchema);

  describe(`Messages should validate against AlpineBits and JSON:API schemas on route /${opts.route}`, () => {
    for (let i = opts.schema.pageStart; i <= opts.schema.pageEnd; i++) {
      test(`/${opts.route}: page[number]=${i} and page[size]=${opts.schema.pageSize}`, () => {
        return utils.axiosInstance
          .get(
            `/${apiVersion}/${opts.route}?page[size]=${opts.schema.pageSize}&page[number]=${i}`
          )
          .then((res) => {
            let [isValid, ajv] = schemas[`/${opts.route}`].validate(res.data);
            if (!isValid) console.error(ajv.errors);
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
            }&page[number]=${i}&include=${opts.multiInclude.relationships.join(
              ","
            )}`
          )
          .then((res) => {
            let [isValid, ajv] = schemas[`/${opts.route}`].validate(res.data);
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
      return utils.axiosInstance
        .get(`/${apiVersion}/${opts.route}?page[size]=10&page[number]=1`)
        .then((response) => {
          resourceArray = response.data.data;
        });
    });

    test(`Checking the first 10 resources on /${apiVersion}/${opts.route}/`, () => {
      let requests = [];

      for (let i = 0; i < resourceArray.length; i++) {
        let id = resourceArray[i].id;
        let request = utils.axiosInstance.get(
          `/${apiVersion}/${opts.route}/${id}`
        );
        requests.push(request);
      }

      return Promise.all(requests).then((resArray) => {
        resArray.forEach((res) => {
          let [isValid, ajv] = schemas[`/${opts.route}/:id`].validate(res.data);

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
