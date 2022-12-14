const { IndividualResource } = require("./individual_resource");

class Venue extends IndividualResource {
  constructor() {
    super();

    this.address = undefined;
    this.howToArrive = undefined;
    this.geometries = undefined;
  }
}

module.exports = {
  Venue,
};
