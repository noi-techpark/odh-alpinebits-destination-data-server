// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const _ = require("lodash");
const { IndividualResource } = require("./individual_resource");

class Agent extends IndividualResource {
  constructor() {
    super();

    this.contactPoints = undefined;
  }

  addContactPoint(contact) {
    this.contactPoints = this.contactPoints?.push(contact) ?? [contact];
  }
}

module.exports = {
  Agent,
};
