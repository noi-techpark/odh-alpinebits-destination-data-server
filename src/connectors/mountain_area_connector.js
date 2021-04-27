const { DestinationDataError: Error } = require("../errors");
const axios = require("axios");
const _ = require("lodash");

const ACTIVITY_PATH = "Activity";
const SKI_AREA_PATH = "Skiarea";
const SKI_REGION_PATH = "Skiregion";
const ODH_TAG_MAP = {
  trails: "ski alpin,ski alpin (rundkurs),rodelbahnen,loipen",
  lifts: "aufstiegsanlagen",
  snowparks: "snowpark",
};

class MountainAreaConnector {
  constructor(request, requestTransformFn) {
    const odhItemId = request.params.id;
    const odhQueries = requestTransformFn ? requestTransformFn(request) : null;

    this.id = odhItemId ? `/${odhItemId}` : "";
    this.queries = odhQueries ? `?${odhQueries}` : "";
    this.skiAreaPath = SKI_AREA_PATH + this.id + this.queries;
    this.skiRegionPath = SKI_REGION_PATH + this.id + this.queries;

    this.odhHostUrl = process.env.ODH_BASE_URL;
    this.axiosOpts = {
      baseURL: process.env.ODH_BASE_URL,
      timeout: process.env.ODH_TIMEOUT,
      headers: { Accept: "application/json" },
    };

    this.include = request.query.include;
  }

  async fetch() {
    try {
      const requests = [this.fetchSkyAreas(), this.fetchSkyRegions()];
      let fetched = await Promise.all(requests);

      if (fetched.every((item) => item instanceof Error)) {
        throw fetched[0];
      }

      // Always an array. The router and the transformation shall check if the request was for one item or a collection
      const data = fetched
        .filter((item) => !!item)
        .filter((item) => !(item instanceof Error)) // removes not found errors when fetching specific area
        .reduce((prev, current) => {
          if (Array.isArray(current)) prev.push(...current);
          else prev.push(current);
          return prev;
        }, []);

      for (const item of data) {
        item.subResources = await this.fetchSubResources(item);
      }

      return data;
    } catch (error) {
      if (!(error instanceof Error)) Error.throwConnectionError(error);
      else throw error;
    }
  }

  async fetchSkyAreas() {
    try {
      const instance = axios.create(this.axiosOpts);
      console.log(`  Fetching data from ${this.odhHostUrl + this.skiAreaPath}`);
      const skiAreaResponse = await instance.get(this.skiAreaPath).catch((error) => error);
      let data;

      if (typeof skiAreaResponse.data === "string") data = JSON.parse(skiAreaResponse.data);
      else data = skiAreaResponse.data;

      if (!data || skiAreaResponse.status !== 200) {
        Error.throwNotFound();
      }

      return data;
    } catch (error) {
      if (!(error instanceof Error)) Error.throwConnectionError(error);
      else return error;
    }
  }

  async fetchSkyRegions() {
    try {
      const instance = axios.create(this.axiosOpts);
      console.log(`  Fetching data from ${this.odhHostUrl + this.skiRegionPath}`);
      const skiRegionResponse = await instance.get(this.skiRegionPath).catch((error) => error);
      let data;

      if (typeof skiRegionResponse.data === "string") data = JSON.parse(skiRegionResponse.data);
      else data = skiRegionResponse.data;

      if (!data || skiRegionResponse.status !== 200) {
        Error.throwNotFound();
      }

      return data;
    } catch (error) {
      if (!(error instanceof Error)) Error.throwConnectionError(error);
      else return error;
    }
  }

  async fetchSubResources(area) {
    const areaId = "SkiRegionId" in area ? `ska${area.Id}` : `skr${area.Id}`;
    let path;

    if (!this.id && !this.include) {
      path =
        ACTIVITY_PATH +
        "?odhtagfilter=aufstiegsanlagen,ski alpin,ski alpin (rundkurs),rodelbahnen,loipen,snowpark" +
        "&pagesize=10000&fields=Id,SmgTags&areafilter=" +
        areaId;
    } else {
      path =
        ACTIVITY_PATH +
        "?odhtagfilter=aufstiegsanlagen,ski alpin,ski alpin (rundkurs),rodelbahnen,loipen,snowpark" +
        "&pagesize=10000&areafilter=" +
        areaId;
    }

    const response = await this.fetchSubResourcesOfType(path);
    const subResources = {
      lifts: [],
      skiSlopes: [],
      snowparks: [],
    };

    if (response) {
      response.forEach((item) => {
        const tags = item.SmgTags || [];

        if (tags.includes("aufstiegsanlagen")) {
          subResources.lifts.push(item);
        } else if (tags.includes("snowpark")) {
          subResources.snowparks.push(item);
        } else if (
          tags.includes("ski alpin") ||
          tags.includes("ski alpin (rundkurs)") ||
          tags.includes("rodelbahnen")
        ) {
          subResources.skiSlopes.push(item);
        }
      });
    }

    subResources.lifts = !_.isEmpty(subResources.lifts) ? subResources.lifts : null;
    subResources.skiSlopes = !_.isEmpty(subResources.skiSlopes) ? subResources.skiSlopes : null;
    subResources.snowparks = !_.isEmpty(subResources.snowparks) ? subResources.snowparks : null;

    return subResources;
  }

  async fetchSubResourcesOfType(path) {
    try {
      console.log(`  Sub-request ${this.odhHostUrl}/${path}`);

      const instance = axios.create(this.axiosOpts);
      const response = await instance.get(path).catch((error) => error);
      let data;

      if (typeof response.data === "string") data = JSON.parse(response.data);
      else data = response.data;

      if (!data || response.status !== 200) {
        Error.throwNotFound(`Route to mountain area sub-resource not found: '${path}'`);
      }

      return data && data.Items ? data.Items : data;
    } catch (error) {
      if (!(error instanceof Error)) Error.throwConnectionError(error);
      else return error;
    }
  }
}

module.exports = {
  MountainAreaConnector,
};
