const { IndividualResource } = require("./individual_resource");

class SkiSlope extends IndividualResource {
  constructor() {
    super();

    this.address = undefined;
    this.difficulty = undefined;
    this.geometries = undefined;
    this.howToArrive = undefined;
    this.length = undefined;
    this.maxAltitude = undefined;
    this.minAltitude = undefined;
    this.openingHours = undefined;
    this.snowCondition = undefined;

    this.connections = undefined;
  }
}

module.exports = {
  SkiSlope,
};