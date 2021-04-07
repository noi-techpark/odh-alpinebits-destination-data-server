// TODO: Rename "DestinationDataError" not to give the impression the error was caused by DestinationData exclusive aspects
const { DestinationDataError: Error } = require("../errors");
const axios = require("axios");

const odhHostUrl = process.env.ODH_BASE_URL;
const axiosOpts = {
  baseURL: process.env.ODH_BASE_URL,
  timeout: process.env.ODH_TIMEOUT,
  headers: { Accept: "application/json" },
};

class OdhConnector {
  constructor(odhPath, request, requestTransformFn) {
    const odhItemId = request.params.id;
    const odhQueries = requestTransformFn ? requestTransformFn(request) : null;

    this.id = odhItemId ? `/${odhItemId}` : "";
    this.queries = odhQueries ? `?${odhQueries}` : "";
    this.path = odhPath + this.id + this.queries;
  }

  async fetch() {
    try {
      console.log(`  Fetching data from ${odhHostUrl + this.path}`);
      const instance = axios.create(axiosOpts);
      const response = await instance.get(this.path);

      if (!response.data || response.status !== 200) {
        throw errors.notFound;
      }

      return response.data;
    } catch (error) {
      Error.throwConnectionError(error);
    }
  }
}

module.exports = {
  OdhConnector,
};
