// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const _ = require("lodash");

class Resource {
  constructor() {
    this.type = undefined;
    this.id = undefined;
    this.dataProvider = undefined;
    this.lastUpdate = undefined;
    this.abstract = undefined;
    this.description = undefined;
    this.name = undefined;
    this.shortName = undefined;
    this.url = undefined;
  }
}

module.exports = { Resource };
