// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { IndividualResource } = require("./individual_resource");

class Lift extends IndividualResource {
  constructor() {
    super();

    this.address = undefined;
    this.capacity = undefined;
    this.geometries = undefined;
    this.howToArrive = undefined;
    this.length = undefined;
    this.maxAltitude = undefined;
    this.minAltitude = undefined;
    this.openingHours = undefined;
    this.personsPerChair = undefined;

    this.connections = undefined;
  }
}

module.exports = {
  Lift,
};
