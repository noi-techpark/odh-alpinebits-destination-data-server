const { IndividualResource } = require("./individual_resource");

class EventSeries extends IndividualResource {
  constructor() {
    super();

    this.frequency = undefined;

    this.editions = undefined;
  }
}

module.exports = {
  EventSeries,
};
