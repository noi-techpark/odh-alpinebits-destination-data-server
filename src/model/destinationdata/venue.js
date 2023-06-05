// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { ResourceType } = require("./constants");
const { IndividualResource } = require("./individual_resource");

class Venue extends IndividualResource {
  constructor(base) {
    super(base);

    this.type = ResourceType.venues;

    this.attributes.address = this.attributes.address || null;
    this.attributes.howToArrive = this.attributes.howToArrive || null;
    this.attributes.geometries = this.attributes.geometries || null;
  }
}

module.exports = {
  Venue,
};
