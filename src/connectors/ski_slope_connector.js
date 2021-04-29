const { OdhConnector } = require("./odh_connector");

const ACTIVITY_PATH = "Activity";
const ODH_SKI_SLOPES_TAGS = "ski alpin,ski alpin (rundkurs),rodelbahnen,loipen";

class SkiSlopeConnector extends OdhConnector {
  constructor(request, requestTransformFn) {
    super(ACTIVITY_PATH, request, requestTransformFn);
  }

  async fetch() {
    if (!this.id) {
      this.path += this.queries ? `&odhtagfilter=${ODH_SKI_SLOPES_TAGS}` : `?odhtagfilter=${ODH_SKI_SLOPES_TAGS}`;
    }

    return super.fetch();
  }
}

module.exports = {
  SkiSlopeConnector,
};
