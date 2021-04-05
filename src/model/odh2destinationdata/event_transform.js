const { Event: OdhEvent } = require('../odh/event');
const { Agent } = require('../destinationdata/agents');
const { Event: DestinationDataEvent } = require('../destinationdata/event');
const { Venue } = require('../destinationdata/venue');
const datatypes = require("./../destinationdata/datatypes");
const utils = require('./utils');
const _ = require("lodash");
const { transformMultimediaDescriptions } = require('./image_transform');

function transformToEvent(odhItem, request) {
    const odhEvent =  new OdhEvent(odhItem);
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
    // event.relationships.categories = transformMultimediaDescriptions(event, activity, request);
    event.relationships.multimediaDescriptions = transformMultimediaDescriptions(event, odhEvent, request);
    event.relationships.organizers = transformOrganizers(event, odhEvent, request);
    event.relationships.publisher = transformPublisher(event, request);
    event.relationships.venues = transformVenues(event, odhEvent, request);;
    
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

    if(_.isEmpty(EventDate)) {
        return new Date(DateEnd);
    } else {
        // TODO: test sorting
        return EventDate.map(item => new Date(item.To)).sort((a,b) => b - a)[0];
    }
}

function transformEventStartDate(odhEvent) {
     const { DateBegin, EventDate } = odhEvent;
    
    if(_.isEmpty(EventDate)) {
        return new Date(DateBegin);
    } else {
        // TODO: test sorting
        return EventDate.map(item => new Date(item.From)).sort((a,b) => a - b)[0];
    }
}

function transformPublisher(eventContainer, request) {
    const publisher = new Agent();

    publisher.id = eventContainer.id + '_publisher';
    publisher.meta = Object.assign({}, eventContainer.meta)
    publisher.links = utils.transformResourceLinks(request, publisher.type, publisher.id);

    publisher.attributes.name = {
        deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
        eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
        ita: "LTS - Landesverband der Tourismusorganisationen Südtirols"
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

    if(!OrganizerInfos) {
        return null;
    }

    const organizer = new Agent();

    organizer.id = eventContainer.id + '_organizer';
    organizer.meta = Object.assign({}, eventContainer.meta)
    organizer.links = utils.transformResourceLinks(request, organizer.type, organizer.id);

    // TODO: review organizers transformation with respect of name and category
    organizer.attributes.contactPoints = transformOrganizerContactPoints(odhSource);
    organizer.attributes.name = {
        deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
        eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
        ita: "LTS - Landesverband der Tourismusorganisationen Südtirols"
    };
    organizer.attributes.url = transformOrganizerUrl(odhSource);

    // organizer.attributes.abstract - No data available
    // organizer.attributes.description - No data available
    // organizer.attributes.shortName - No data available
    // organizer.relationships.categories - No data available
    // organizer.relationships.multimediaDescriptions - No data available

    return [ organizer ];
}

function transformOrganizerContactPoints(odhSource) {
    const sourceCountryCode = odhSource.getOrganizerCountryCode();
    const sourceZipCode = odhSource.getOrganizerZipCode();
    const sourcePhonenumber = odhSource.getOrganizerPhonenumber();
    const sourceEmail = odhSource.getOrganizerEmail();
    
    const address = datatypes.createAddress();
    address.street = utils.sanitizeAndConvertLanguageTags(odhSource.getOrganizerAddress());
    address.city = utils.sanitizeAndConvertLanguageTags(odhSource.getOrganizerCity());
    address.country = sourceCountryCode ? Object.values(sourceCountryCode)[0] : "IT"; // TODO: confirm if it's safe to assume the organizer to be in Italy
    address.zipCode = sourceZipCode ? Object.values(sourceZipCode)[0] : null;

    // TODO: improve tests for no available data
    const telephone = sourcePhonenumber && Object.values(sourcePhonenumber)[0] ? Object.values(sourcePhonenumber)[0].replace(/\s/g,'') : null;
    const email = sourceEmail ? Object.values(sourceEmail)[0] : null;

    const organizerContactPoint = datatypes.createContactPoints(address, null, email, telephone);

    return [ organizerContactPoint ];
}

function transformOrganizerUrl(odhSource) {
    return utils.sanitizeAndConvertLanguageTags(odhSource.getOrganizerUrl());
}

function transformVenues(eventContainer, odhSource, request) {
    const venue = new Venue();

    venue.id = eventContainer.id + '_venue';
    venue.meta = Object.assign({}, eventContainer.meta)
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

    return [ venue ];
}

function transformVenueAddress(odhSource) {
    const sourceCountryCode = odhSource.getContactInfosCountryCode();
    const sourceZipCode = odhSource.getContactInfosZipCode();
    
    const address = datatypes.createAddress();
    address.street = utils.sanitizeAndConvertLanguageTags(odhSource.getContactInfosAddress());
    address.city = utils.sanitizeAndConvertLanguageTags(odhSource.getContactInfosCity());
    address.country = sourceCountryCode ? Object.values(sourceCountryCode)[0] : "IT"; // TODO: confirm if it's safe to assume the organizer to be in Italy
    address.zipCode = sourceZipCode ? Object.values(sourceZipCode)[0] : null;
    
    return address;
}

function transformVenueGeometries(odhSource) {
    const { Latitude, Longitude } = odhSource;
    
    if(!Latitude || !Longitude) {
        return null;
    } else {
        return [ datatypes.createPoint(Longitude, Latitude) ];
    }
}

function transformVenueName(odhSource) {
    const name = utils.sanitizeAndConvertLanguageTags(odhSource.getEventAdditionalInfosLocation());
    return !_.isEmpty(name) ? name : { eng: "Unnamed venue"};
}

module.exports = {
    transformToEvent
}