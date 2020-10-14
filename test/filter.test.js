module.exports.basicFilterTests = (opts) => {
  const utils = require("./utils");

  describe(`Basic filtering tests`, () => {
    let unfilteredData, unfilteredMeta;

    beforeAll(() => {
      return utils.axiosInstance.get(`/1.0/${opts.route}`).then((res) => {
        ({ data: unfilteredData, meta: unfilteredMeta } = res.data);
      });
    });

    opts.filters.forEach((filterEntry) => {
      const { name, value } = filterEntry;
      const path = `/1.0/${opts.route}?filter[${name}]=${value}`;

      test(path, () => {
        return utils.axiosInstance.get(path).then((res) => {
          let { meta } = res.data;
          expect(meta.count < unfilteredMeta.count).toBe(true);
          expect(meta.count).toBeTruthy();
        });
      });
    });
  });
};

// just to avoid warning, that no tests in test file
describe('Basic tests for API filters', () => {
  test('placeholder', () => {});
});
