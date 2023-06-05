// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { DestinationDataResponse } = require("./response");

class ObjectResponse extends DestinationDataResponse {
  constructor(base) {
    super(base);

    base = base || {};

    this.data = base.data || [];
  }
}

module.exports = {
  ObjectResponse,
};
