// TODO: Rename "DestinationDataError" not to give the impression the error was caused by DestinationData exclusive aspects
const errors = require("../errors");
const { DestinationDataError: Error } = require("../errors");
const categoriesData = require("./../../data/categories.data");

class CategoryConnector {
  constructor(request) {
    this.request = request;
  }

  fetch() {
    try {
      const { id } = this.request.params;
      const { page } = this.request.query;
      console.log(`  Fetching local categories data: ${id ? `{ id: ${id} }` : ""} ${page ? JSON.stringify(page) : ""}`);

      if (id) {
        const category = categoriesData.categoriesMap[id];

        if (!category) {
          errors.DestinationDataError.throwNotFound();
        }

        return category;
      }

      if (page) {
        const { size, number } = page;
        const firstIndex = size && number ? size * (number - 1) : 0;
        const lastIndex = size ? firstIndex + size : 9;

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
