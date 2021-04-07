const { OdhConnector } = require("./odh_connector");

const EVENT_PATH = "Event";

class MountainAreaConnector extends OdhConnector {
  constructor(request, requestTransformFn) {
    super(EVENT_PATH, request, requestTransformFn);
  }
}

module.exports = {
  MountainAreaConnector,
};
