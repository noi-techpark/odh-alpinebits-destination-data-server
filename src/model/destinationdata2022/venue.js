const { IndividualResource } = require("./individual_resource");

class Venue extends IndividualResource {
  constructor() {
    super();

    this.address = null;
    this.howToArrive = null;
    this.geometries = null;
  }
}

module.exports = {
  Venue,
};
