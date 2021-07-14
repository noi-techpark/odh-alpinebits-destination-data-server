const { Event: OdhEvent } = require("../odh/event");
const { Agent } = require("../destinationdata/agents");
const { Event: DestinationDataEvent } = require("../destinationdata/event");
const { Venue } = require("../destinationdata/venue");
const datatypes = require("./../destinationdata/datatypes");
const utils = require("./utils");
const categoriesData = require("./../../../data/categories.data");
const _ = require("lodash");
const { transformMultimediaDescriptions } = require("./image_transform");

function transformToEvent(odhItem, request) {
  const odhEvent = new OdhEvent(odhItem);
  const event = new DestinationDataEvent();

  event.id = odhEvent.Id;

  event.meta = utils.transformMeta(odhEvent);
  event.links = utils.transformResourceLinks(request, event.type, event.id);

  event.attributes.abstract = utils.transformAbstract(odhEvent);
  event.attributes.description = utils.transformDescription(odhEvent);
  event.attributes.name = utils.transformName(odhEvent);
  event.attributes.shortName = utils.transformShortName(odhEvent);
  event.attributes.url = utils.transformUrl(odhEvent);

  event.attributes.endDate = transformEventEndDate(odhEvent);
  event.attributes.startDate = transformEventStartDate(odhEvent);

  // TODO: update categories relationship
  event.relationships.categories = transformCategories(odhEvent);
  event.relationships.multimediaDescriptions = transformMultimediaDescriptions(event, odhEvent, request);
  event.relationships.organizers = transformOrganizers(event, odhEvent, request);
  event.relationships.publisher = transformPublisher(event, request);
  event.relationships.venues = transformVenues(event, odhEvent, request);

  // event.attributes.capacity - No available data
  // event.attributes.status - No available data
  // event.relationships.contributors - No available data
  // event.relationships.series - No available data
  // event.relationships.sponsors - No available data
  // event.relationships.subEvents - No available data

  return event;
}

function transformEventEndDate(odhEvent) {
  const { DateEnd, EventDate } = odhEvent;

  if (_.isEmpty(EventDate)) {
    return new Date(DateEnd);
  } else {
    // TODO: test sorting
    return EventDate.map((item) => new Date(item.To)).sort((a, b) => b - a)[0];
  }
}

function transformEventStartDate(odhEvent) {
  const { DateBegin, EventDate } = odhEvent;

  if (_.isEmpty(EventDate)) {
    return new Date(DateBegin);
  } else {
    // TODO: test sorting
    return EventDate.map((item) => new Date(item.From)).sort((a, b) => a - b)[0];
  }
}

function transformCategories(odhEvent) {
  const { Topics } = odhEvent;

  if (!Array.isArray(Topics)) {
    return null;
  }

  const categories = [];

  Topics.forEach((topic) => {
    const category = categoriesData.categoriesMap[topic.TopicRID];
    if (category) {
      categories.push(category);

      const { parents } = category.relationships;

      if (!_.isEmpty(parents)) {
        parents.forEach((parent) => categories.push(parent));
      }
    }
  });

  // different tags may have the same parent, so it is important to clean-up duplicates
  return !_.isEmpty(categories) ? [...new Set(categories)] : null;
}

function transformPublisher(eventContainer, request) {
  const publisher = new Agent();

  publisher.id = eventContainer.id + "_publisher";
  publisher.meta = Object.assign({}, eventContainer.meta);
  publisher.links = utils.transformResourceLinks(request, publisher.type, publisher.id);

  publisher.attributes.name = {
    deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    ita: "LTS - Landesverband der Tourismusorganisationen Südtirols",
  };
  publisher.attributes.url = "https://lts.it";

  // publisher.attributes.abstract - No data available
  // publisher.attributes.contactPoints - No data available
  // publisher.attributes.description - No data available
  // publisher.attributes.shortName - No data available
  // publisher.relationships.categories - No data available
  // publisher.relationships.multimediaDescriptions - No data available

  return publisher;
}

function transformOrganizers(eventContainer, odhSource, request) {
  const { OrganizerInfos, ContactInfos, OrgRID } = odhSource;

  if (!OrganizerInfos) {
    return null;
  }

  const organizer = new Agent();

  organizer.id = OrgRID || eventContainer.id + "_organizer";
  organizer.meta = Object.assign({}, eventContainer.meta);
  organizer.links = utils.transformResourceLinks(request, organizer.type, organizer.id);

  // TODO: review organizers transformation with respect of name and category
  organizer.attributes.contactPoints = transformOrganizerContactPoints(odhSource);
  organizer.attributes.name = transformOrganizerName(odhSource);
  organizer.attributes.url = transformOrganizerUrl(odhSource);

  organizer.relationships.categories = transformOrganizerCategories(odhSource);

  // organizer.attributes.abstract - No data available
  // organizer.attributes.description - No data available
  // organizer.attributes.shortName - No data available
  // organizer.relationships.multimediaDescriptions - No data available

  return [organizer];
}

function transformOrganizerContactPoints(odhSource) {
  const telephone = transformOrganizerTelephone(odhSource);
  const email = transformOrganizerEmail(odhSource);
  const address = datatypes.createAddress();

  address.street = transformOrganizerStreet(odhSource);
  address.city = transformOrganizerCity(odhSource);
  address.country = transformOrganizerCountry(odhSource);
  address.zipCode = transformOrganizerZipCode(odhSource);

  const organizerContactPoint = datatypes.createContactPoints(address, null, email, telephone);

  return [organizerContactPoint];
}

function transformOrganizerStreet(odhEvent) {
  return utils.sanitizeAndConvertLanguageTags(odhEvent.getOrganizerAddress());
}

function transformOrganizerCity(odhEvent) {
  return utils.sanitizeAndConvertLanguageTags(odhEvent.getOrganizerCity());
}

function transformOrganizerCountry(odhEvent) {
  const countryCode = odhEvent.getOrganizerCountryCode();
  const sanitized = utils.sanitizeAndConvertLanguageTags(countryCode);

  // Default: assume Italy
  return _.isEmpty(sanitized) ? "IT" : Object.values(sanitized)[0];
}

function transformOrganizerZipCode(odhEvent) {
  const zipCode = odhEvent.getOrganizerZipCode();
  const sanitized = utils.sanitizeAndConvertLanguageTags(zipCode);

  return _.isEmpty(sanitized) ? null : Object.values(sanitized)[0];
}

function transformOrganizerEmail(odhEvent) {
  const email = odhEvent.getOrganizerEmail();
  const sanitized = utils.sanitizeAndConvertLanguageTags(email);

  return _.isEmpty(sanitized) ? null : Object.values(sanitized)[0];
}

function transformOrganizerTelephone(odhEvent) {
  const telephone = odhEvent.getOrganizerPhonenumber();
  const sanitized = utils.sanitizeAndConvertLanguageTags(telephone);

  return _.isEmpty(sanitized) ? null : Object.values(sanitized)[0].replace(/\s/g, "");
}

function transformOrganizerName(odhEvent) {
  const companyName = odhEvent.getOrganizerCompanyName();
  const givenName = odhEvent.getOrganizerGivenname();
  const surname = odhEvent.getOrganizerSurname();

  if (!_.isEmpty(companyName)) {
    return utils.sanitizeAndConvertLanguageTags(companyName);
  } else if (!_.isEmpty(givenName) && !_.isEmpty(surname)) {
    const name = {};

    Object.keys(givenName).forEach((lang) => {
      if (givenName[lang] && surname[lang]) name[lang] = `${givenName[lang]} ${surname[lang]}`;
    });

    return utils.sanitizeAndConvertLanguageTags(name);
  } else {
    return utils.sanitizeAndConvertLanguageTags({});
  }
}

function isOrganizerOrganization(item) {
  const companyName = item.getOrganizerCompanyName();
  return !_.isEmpty(companyName);
}

function isOrganizerPerson(item) {
  const givenName = item.getOrganizerGivenname();
  const surname = item.getOrganizerSurname();
  return !_.isEmpty(givenName) && !_.isEmpty(surname);
}

function transformOrganizerUrl(odhEvent) {
  return utils.sanitizeAndConvertLanguageTags(odhEvent.getOrganizerUrl());
}

function transformOrganizerCategories(odhEvent) {
  const categories = [];

  if (isOrganizerOrganization(odhEvent)) {
    const category = categoriesData.categoriesMap["alpinebits:organization"];
    categories.push(category);
  } else if (isOrganizerPerson(odhEvent)) {
    const category = categoriesData.categoriesMap["alpinebits:person"];
    categories.push(category);
  }

  return !_.isEmpty(categories) ? categories : null;
}

function transformVenues(eventContainer, odhSource, request) {
  const venue = new Venue();

  venue.id = eventContainer.id + "_venue";
  venue.meta = Object.assign({}, eventContainer.meta);
  venue.links = utils.transformResourceLinks(request, venue.type, venue.id);

  venue.attributes.address = transformVenueAddress(odhSource);
  venue.attributes.geometries = transformVenueGeometries(odhSource);
  venue.attributes.name = transformVenueName(odhSource);

  // venue.attributes.abstract - No data available
  // venue.attributes.description - No data available
  // venue.attributes.howToArrive - No data available
  // venue.attributes.shortName - No data available
  // venue.attributes.url - No data available
  // venue.relationships.categories - No data available
  // venue.relationships.multimediaDescriptions - No data available

  return [venue];
}

function transformVenueAddress(odhSource) {
  const sourceCountryCode = odhSource.getContactInfosCountryCode();
  const sourceZipCode = odhSource.getContactInfosZipCode();

  const address = datatypes.createAddress();
  address.street = utils.sanitizeAndConvertLanguageTags(odhSource.getContactInfosAddress());
  address.city = utils.sanitizeAndConvertLanguageTags(odhSource.getContactInfosCity());
  address.country = !_.isEmpty(sourceCountryCode) ? Object.values(sourceCountryCode)[0] : "IT"; // TODO: confirm if it's safe to assume the organizer to be in Italy
  address.zipcode = !_.isEmpty(sourceZipCode) ? Object.values(sourceZipCode)[0] : null;

  return address;
}

function transformVenueGeometries(odhSource) {
  const { Latitude, Longitude } = odhSource;

  if (!Latitude || !Longitude) {
    return null;
  } else {
    return [datatypes.createPoint(Longitude, Latitude)];
  }
}

function transformVenueName(odhSource) {
  const name = utils.sanitizeAndConvertLanguageTags(odhSource.getEventAdditionalInfosLocation());
  return !_.isEmpty(name) ? name : { eng: "Unnamed venue" };
}

module.exports = {
  transformToEvent,
};
