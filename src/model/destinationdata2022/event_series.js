// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

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
