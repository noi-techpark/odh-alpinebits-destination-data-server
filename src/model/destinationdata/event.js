const { Resource } = require('./resource');
const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class Event extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.events;

        this.attributes.capacity = this.attributes.capacity || null;
        this.attributes.endDate = this.attributes.endDate || null;
        this.attributes.startDate = this.attributes.startDate || null;
        this.attributes.status = this.attributes.status || null;

        this.relationships.contributors = this.relationships.contributors || null;
        this.relationships.organizers = this.relationships.organizers || null;
        this.relationships.publisher = this.relationships.publisher || null;
        this.relationships.series = this.relationships.series || null;
        this.relationships.sponsors = this.relationships.sponsors || null;
        this.relationships.subEvents = this.relationships.subEvents || null;
        this.relationships.venues = this.relationships.venues || null;
    }

    addContributor(contributor) {
        return Resource.addRelationshipToMany(this.relationships, 'contributors', contributor, [ ResourceType.agents ])
    }

    addOrganizer(organizer) {
        return Resource.addRelationshipToMany(this.relationships, 'organizers', organizer, [ ResourceType.agents ])
    }

    addPublisher(publisher) {
        return Resource.addRelationshipToOne(this.relationships, 'publisher', publisher), [ ResourceType.agents ];
    }

    addSeries(series) {
        return Resource.addRelationshipToOne(this.relationships, 'series', series), [ ResourceType.eventSeries ];
    }

    addSponsor(sponsor) {
        return Resource.addRelationshipToMany(this.relationships, 'sponsors', sponsor, [ ResourceType.agents ])
    }

    addSubEvent(subEvent) {
        return Resource.addRelationshipToMany(this.relationships, 'subEvents', subEvent, [ ResourceType.events ])
    }

    addVenues(venue) {
        return Resource.addRelationshipToMany(this.relationships, 'venues', venue, [ ResourceType.venues ])
    }

}

module.exports = {
    Event
}