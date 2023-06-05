// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

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
