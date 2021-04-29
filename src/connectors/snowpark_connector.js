const { OdhConnector } = require("./odh_connector");

const ACTIVITY_PATH = "Activity";
const ODH_SNOWPARKS_TAG = "snowpark";

class SnowparkConnector extends OdhConnector {
  constructor(request, requestTransformFn) {
    super(ACTIVITY_PATH, request, requestTransformFn);
  }

  async fetch() {
    if (!this.id) {
      this.path += this.queries ? `&odhtagfilter=${ODH_SNOWPARKS_TAG}` : `?odhtagfilter=${ODH_SNOWPARKS_TAG}`;
    }

    return super.fetch();
  }
}

module.exports = {
  SnowparkConnector,
};
