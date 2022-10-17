const { IndividualResource } = require("./individual_resource");

class MountainArea extends IndividualResource {
  constructor() {
    super();

    this.area = undefined;
    this.geometries = undefined;
    this.howToArrive = undefined;
    this.maxAltitude = undefined;
    this.minAltitude = undefined;
    this.openingHours = undefined;
    this.snowCondition = undefined;
    this.totalParkArea = undefined;
    this.totalTrailLength = undefined;

    this.areaOwner = undefined;
    this.connections = undefined;
    this.lifts = undefined;
    this.snowparks = undefined;
    this.subAreas = undefined;
    this.skiSlopes = undefined;
  }
}

module.exports = {
  MountainArea,
};
