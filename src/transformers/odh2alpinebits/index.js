const transformEvent = require('./event.transform');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');

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
  transformTrailArray: function(data) {
    let result = [];

    for (object of data.Items)
    result.push(transformTrail(object));

    return result;
  },
  transformTrail: function(data) {
    return transformTrail(data);
  },
  transformSnowparkArray: function(data) {
    let result = [];

    for (object of data.Items)
      result.push(transformSnowpark(object));

    return result;
  },
  transformSnowpark: function(data) {
    return transformSnowpark(data);
  },
}
