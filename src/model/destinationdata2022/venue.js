// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { IndividualResource } = require("./individual_resource");

class Venue extends IndividualResource {
  constructor() {
    super();

    this.address = undefined;
    this.howToArrive = undefined;
    this.geometries = undefined;
  }
}

module.exports = {
  Venue,
};
