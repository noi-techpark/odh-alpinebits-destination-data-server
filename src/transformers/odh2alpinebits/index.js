const transformEvent = require('./event.transform').transform;
const transformLift = require('./lift.transform').transform;

module.exports = {
  transformEventArray: function(data) {
    let result = [];

    for (object of data.Items)
      result.push(transformEvent(object));

    return result;
  },
  transformEvent: function(data) {
    return transformEvent(data);
  },
  transformLiftArray: function(data) {
    let result = [];

    for (object of data.Items)
      result.push(transformLift(object));

    return result;
  },
  transformLift: function(data) {
    return transformLift(data);
  },
}
