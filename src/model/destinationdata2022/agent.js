const { IndividualResource } = require("./individual_resource");

class Agent extends IndividualResource {
  constructor() {
    super();

    this.contactPoints = null;
  }
}

module.exports = {
  Agent,
};
