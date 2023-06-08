// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

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
