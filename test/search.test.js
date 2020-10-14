module.exports.basicSearchTests = (opts) => {
  const utils = require("./utils");

  describe(`Basic searching tests`, () => {
    let unfilteredData, unfilteredMeta;

    beforeAll(() => {
      return utils.axiosInstance.get(`/1.0/${opts.route}`).then((res) => {
        ({ data: unfilteredData, meta: unfilteredMeta } = res.data);
      });
    });

    opts.searches.forEach((searchEntry) => {
      const { name, value } = searchEntry;
      const path = `/1.0/${opts.route}?_search[${name}]=${value}`;

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
describe('Basic tests for API search features', () => {
  test('placeholder', () => {});
});
