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
