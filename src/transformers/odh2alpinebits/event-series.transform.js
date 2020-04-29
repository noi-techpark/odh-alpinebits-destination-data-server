const utils = require('./utils');

module.exports = (originalObject, included = {}, request) => {
  const eventSeries = JSON.parse(JSON.stringify(originalObject));

  let links = eventSeries.links;
  Object.assign(links, utils.createSelfLink(eventSeries, request));

  let multimedia = eventSeries.relationships.multimediaDescriptions;
  if(multimedia && multimedia.data && multimedia.data.length > 0)
    multimedia.links.related = encodeURI(links.self + "/multimediaDescriptions");

  let editions = eventSeries.relationships.editions;
  if(editions && editions.data && editions.data.length > 0)
    editions.links.related = encodeURI(links.self + "/editions");

  if(eventSeries.included && eventSeries.included.length>0)
    eventSeries.included.forEach(relatedResource => {
      utils.addIncludedResource(included, relatedResource);
    });

  delete eventSeries.included;

  return eventSeries;
}
