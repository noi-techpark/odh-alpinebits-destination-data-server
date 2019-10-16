const transformEvent = require('./event.transform');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');
const transformMountainArea = require('./mountainarea.transform');
const transformEventSeries = require('./event-series.transform');

function transformArray(data, transformFn) {
  let result = [];

  for (object of data.Items)
    result.push(transformFn(object));

  return result;
}

module.exports = {
  transformEventArray: data => transformArray(data, transformEvent),
  transformEvent: data => transformEvent(data),
  transformLiftArray: data => transformArray(data, transformLift),
  transformLift: data => transformLift(data),
  transformTrailArray: data => transformArray(data, transformTrail),
  transformTrail: data => transformTrail(data),
  transformSnowparkArray: data => transformArray(data, transformSnowpark),
  transformSnowpark: data => transformSnowpark(data),
  transformMountainAreaArray: data => transformArray(data, transformMountainArea),
  transformMountainArea: data => transformMountainArea(data),
  transformEventSeriesArray: data => transformArray(data, transformEventSeries),
  transformEventSeries: data => transformEventSeries(data),
}
