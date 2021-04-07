const { OdhConnector } = require("./odh_connector");

const ACTIVITY_PATH = "Activity";
const ODH_LIFTS_TAG = "aufstiegsanlagen";

class LiftConnector extends OdhConnector {
  constructor(request, requestTransformFn) {
    super(ACTIVITY_PATH, request, requestTransformFn);
  }

  async fetch() {
    if (!this.id) {
      this.path += this.queries ? `&odhtagfilter=${ODH_LIFTS_TAG}` : `?odhtagfilter=${ODH_LIFTS_TAG}`;
    }

    return super.fetch();
  }
}

module.exports = {
  LiftConnector,
};
