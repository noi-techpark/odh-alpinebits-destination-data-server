// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

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
