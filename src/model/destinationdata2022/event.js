const { IndividualResource } = require("./individual_resource");

class Event extends IndividualResource {
  constructor() {
    super();

    this.capacity = null;
    this.endDate = null;
    this.startDate = null;
    this.status = null;

    this.contributors = null;
    this.organizers = null;
    this.publisher = null;
    this.series = null;
    this.sponsors = null;
    this.subEvents = null;
    this.venues = null;
  }
}

module.exports = {
  Event,
};
