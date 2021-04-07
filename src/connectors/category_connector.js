// TODO: Rename "DestinationDataError" not to give the impression the error was caused by DestinationData exclusive aspects
const { DestinationDataError: Error } = require("../errors");

class CategoryConnector {
  constructor(request) {
    this.request = request;
  }

  // Returning an object with a "data" field is a trick to keep using "handleSimpleRequest"
  // It also requires that transformFn is aware it is getting instances of DestinationData resources already
  fetch() {
    try {
      console.log(`  Fetching local categories data`);
      const { id } = this.request.params;
      const { page } = this.request.query;

      if (id) {
        return categoriesData.categoriesMap[id];
      }

      if (page) {
        const { size, number } = page;
        const firstIndex = size * number - 1;
        const lastIndex = firstIndex + size;

        return categoriesData.categories.slice(firstIndex, lastIndex);
      }

      return null;
    } catch (error) {
      Error.throwConnectionError(error);
    }
  }
}

module.exports = {
  CategoryConnector,
};
