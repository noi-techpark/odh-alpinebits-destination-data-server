// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { IndividualResource } = require("./individual_resource");

class Event extends IndividualResource {
  constructor() {
    super();

    this.endDate = undefined;
    this.inPersonCapacity = undefined;
    this.onlineCapacity = undefined;
    this.participationUrl = undefined;
    this.recorded = undefined;
    this.registrationUrl = undefined;
    this.startDate = undefined;
    this.status = undefined;

    this.contributors = undefined;
    this.organizers = undefined;
    this.publisher = undefined;
    this.series = undefined;
    this.sponsors = undefined;
    this.subEvents = undefined;
    this.venues = undefined;
  }
}

module.exports = {
  Event,
};
