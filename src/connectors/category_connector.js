// TODO: Rename "DestinationDataError" not to give the impression the error was caused by DestinationData exclusive aspects
const { DestinationDataError: Error } = require("../errors");
const categoriesData = require("./../../data/categories.data");

class CategoryConnector {
  constructor(request) {
    this.request = request;
  }

  // Returning an object with a "data" field is a trick to keep using "handleSimpleRequest"
  // It also requires that transformFn is aware it is getting instances of DestinationData resources already
  fetch() {
    try {
      const { id } = this.request.params;
      const { page } = this.request.query;
      console.log(`  Fetching local categories data: ${id ? `{ id: ${id} }` : ""} ${page ? JSON.stringify(page) : ""}`);

      if (id) {
        return categoriesData.categoriesMap[id];
      }

      if (page) {
        const { size, number } = page;
        const firstIndex = size && number ? size * (number - 1) : 0;
        const lastIndex = size ? firstIndex + size : 9;

        console.log("retrieving from", firstIndex, "to", lastIndex);

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
