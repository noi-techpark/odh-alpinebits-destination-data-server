const utils = require('./utils');
const templates = require('./templates');
const { transformOrganizer } = require('./organizer.transform');
const { transformPublisher } = require('./publisher.transform');
const { transformVenue } = require('./venue.transform');
const { transformMediaObject } = require('./media-object.transform');

const mappings = require('./mappings')
require('custom-env').env();

module.exports = (originalObject, included = {}, request) => {
  const { apiVersion } = request;

  if(!apiVersion || apiVersion === '1.0') {
    return transformEventV1(originalObject, included, request)
  } else if(apiVersion === '2.0') {
    return transformEventV2(originalObject, included, request)
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`)
  }
}

function transformEventV1(originalObject, included = {}, request) {
  const sourceEvent = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject('Event');

  target.id = sourceEvent.Id;

  utils.processMeta(sourceEvent, target, request);
  utils.processLinks(target, request);

  processDatesAttributes(sourceEvent,target);
  utils.processBasicAttributes(sourceEvent,target);
  processPublishedAttribute(target);
  processCategoriesAttributeV1(sourceEvent,target);

  processVenuesRelationship(sourceEvent,target,included,request);
  processOrganizersRelationship(sourceEvent,target,included,request);
  processPublisherRelationship(sourceEvent,target,included,request);
  processMultimediaDescriptionsRelationship(sourceEvent,target,included,request);

  return target;
}

function transformEventV2(originalObject, included = {}, request) {
  const sourceEvent = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject('Event', '2.0');

  target.id = sourceEvent.Id;

  utils.processMeta(sourceEvent, target, request);
  utils.processLinks(target, request);

  processDatesAttributes(sourceEvent,target);
  utils.processBasicAttributes(sourceEvent,target);
  processPublishedAttribute(target);

  processVenuesRelationship(sourceEvent,target,included,request);
  processOrganizersRelationship(sourceEvent,target,included,request);
  processPublisherRelationship(sourceEvent,target,included,request);
  processMultimediaDescriptionsRelationship(sourceEvent,target,included,request);
  processCategoriesRelationshipV2(sourceEvent,target,included,request);

  return target;
}

function processDatesAttributes(sourceEvent,target) {
  const { attributes } = target;
  Object.assign(attributes, transformDates(sourceEvent));
}

function processPublishedAttribute(target) {
  const { attributes } = target;
  attributes.status = 'published'
}

function processCategoriesAttributeV1(sourceEvent,target) {
  const {attributes} = target;

  if(!Array.isArray(sourceEvent.Topics) || sourceEvent.Topics.length === 0)
    return ;

  let categories = [];

  sourceEvent.Topics.forEach(topic => {
    let odhCategory = mappings.eventTopicIdToODHCategories[topic.TopicRID];
    let schemaOrgCategory = mappings.eventTopicIdToAlpineBitsCategories[topic.TopicRID];

    if(odhCategory)
      categories.push(odhCategory);
    if(schemaOrgCategory)
      categories.push(schemaOrgCategory);
  })

  attributes.categories = categories.length > 0 ? categories : null;
}

function processMultimediaDescriptionsRelationship(sourceEvent,target,included,request) {
  const { relationships, links } = target;
  for (image of sourceEvent.ImageGallery){
    const { mediaObject, copyrightOwner } = transformMediaObject(image, links, request);
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', mediaObject, links.self);
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }
}

function processPublisherRelationship(sourceEvent,target,included,request) {
  const { relationships, links } = target;
  let publisher = transformPublisher(sourceEvent, included, request);
  utils.addRelationshipToOne(relationships, 'publisher', publisher, links.self);
  utils.addIncludedResource(included, publisher);
}

function processOrganizersRelationship(sourceEvent,target,included,request) {
  const { relationships, links } = target;
  const organizer = transformOrganizer(sourceEvent, included, request)
  utils.addRelationshipToMany(relationships, 'organizers', organizer, links.self);
  utils.addIncludedResource(included, organizer);
}

function processVenuesRelationship(sourceEvent,target,included,request) {
  const { relationships, links } = target;
  const venue = transformVenue(sourceEvent, included, request);
  utils.addRelationshipToMany(relationships, 'venues', venue, links.self);
  utils.addIncludedResource(included, venue);
}

function processCategoriesRelationshipV2(sourceEvent, target, included, request) {
  const { relationships, links } = target;

  if (!Array.isArray(sourceEvent.Topics) || sourceEvent.Topics.length < 1) return;

  for (const topic of sourceEvent.Topics) {
    const getCategoryReference = (categoryId) => {
      return categoryId ? { type: "categories", id: categoryId } : null;
    };

    const odhCategoryReference = getCategoryReference(mappings.eventTopicIdToODHCategories[topic.TopicRID]);
    const schemaOrgCategoryReference = getCategoryReference(
      mappings.eventTopicIdToAlpineBitsCategories[topic.TopicRID]
    );

    if (odhCategoryReference)
      utils.addRelationshipToMany(relationships, "categories", odhCategoryReference, links.self);

    if (schemaOrgCategoryReference)
      utils.addRelationshipToMany(relationships, "categories", schemaOrgCategoryReference, links.self);

    // TODO: Enable include categories
  }
}

function processVenuesRelationship(sourceEvent,target,included,request) {
  const { relationships, links } = target;
  const venue = transformVenue(sourceEvent, included, request);
  utils.addRelationshipToMany(relationships, 'venues', venue, links.self);
  utils.addIncludedResource(included, venue);
}

function processFeaturesRelationshipV2(
  sourceEvent,
  target,
  included,
  request
) {
  // TODO: Enable features relationship
}

function transformDates(sourceEvent) {
  let target = {}

  if(!sourceEvent.EventDate || sourceEvent.EventDate.length==0) {
    const mapping = [ ['DateBegin','startDate'], ['DateEnd','endDate'] ]
    utils.transformFields(sourceEvent, target, mapping);
  }
  else if(sourceEvent.EventDate && sourceEvent.EventDate.length===1) {
    const date = sourceEvent.EventDate[0];
    target.startDate = date.From.replace(/T.*/,'T'+date.Begin);
    target.endDate = date.To.replace(/T.*/,'T'+date.End);
  }
  else {
    let dateList = sourceEvent.EventDate.map( (entry, idx) => {
      const startDateTime = entry.From.replace(/T.*/,'T'+entry.Begin);
      return { date: new Date(startDateTime).getTime(), index: idx};
    })

    dateList.sort((a, b) => (a.date > b.date) ? 1 : -1);

    const firstDate = sourceEvent.EventDate[dateList.shift().index];
    const lastDate = sourceEvent.EventDate[dateList.pop().index];

    target.startDate = firstDate.From.replace(/T.*/,'T'+firstDate.Begin);
    target.endDate = lastDate.To.replace(/T.*/,'T'+lastDate.End);
  }

  target.startDate += '+01:00'
  target.endDate += '+01:00'

  return target;
}
