const _ = require("lodash");
const { IndividualResource } = require("./individual_resource");

class Agent extends IndividualResource {
  constructor() {
    super();

    this.contactPoints = null;
  }

  addContactPoint(contact) {
    this.contactPoints = this.contactPoints?.push(contact) ?? [contact];
  }
}

module.exports = {
  Agent,
};
