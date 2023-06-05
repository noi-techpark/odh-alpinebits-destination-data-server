// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { DestinationDataError } = require("./../../errors");
const _ = require("lodash");

class EventRequest {
  constructor(expressRequest) {
    super(expressRequest);
  }
}

module.exports = {
  EventRequest,
};
