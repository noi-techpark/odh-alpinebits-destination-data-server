// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { DestinationDataResponse } = require("./response");

class CollectionResponse extends DestinationDataResponse {
  constructor(base) {
    super(base);

    base = base || {};

    this.meta = base.meta || {
      count: null,
      pages: null,
    };

    this.data = base.data || [];
  }
}

module.exports = {
  CollectionResponse,
};
