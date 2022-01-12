const { IndividualResource } = require("./individual_resource");

class EventSeries extends IndividualResource {
  constructor() {
    super();

    this.frequency = null;

    this.editions = null;
  }
}

module.exports = {
  EventSeries,
};
