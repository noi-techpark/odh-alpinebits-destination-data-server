const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { Event } = require("../model/destinationdata2022/event");
const { schemas } = require("../db");
const { DestinationDataError } = require("../errors");
const { events, resources, participationUrls, registrationUrls } = schemas;

class EventConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(event) {
    return this.runTransaction(() =>
      this.insertEvent(event).then(() => this.retrieveEvent(event.id))
    );
  }

  retrieve(id) {
    const eventId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveEvent(eventId));
  }

  retrieveEventSubEvents(event) {
    const subEventsIds = event?.subEvents?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveEvent(subEventsIds));
  }

  retrieveEventSeriesEditions(series) {
    const editionsIds = series?.editions?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveEvent(editionsIds));
  }

  update(event) {
    if (!event.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveEvent(event.id).then((oldEvent) =>
        this.updateEvent(oldEvent, event)
      )
    );
  }

  delete(id) {
    const eventId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteEvent(eventId));
  }

  deleteEvent(id) {
    return this.deleteResource(id, "events");
  }

  retrieveEvent(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;

    return dbFn
      .selectEventFromId(this.connection, id, offset, limit, orderBy)
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToEvent(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Event resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToEvent);
        }
      });
  }

  updateEvent(oldEvent, newInput) {
    const newEvent = _.create(oldEvent);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newEvent[k] = v;
    });

    if (this.shouldUpdate(oldEvent, newEvent)) {
      return Promise.all([
        this.updateResource(newEvent),
        this.updateContributors(newEvent),
        this.updateOrganizers(newEvent),
        this.updateSponsors(newEvent),
        this.updateSubEvents(newEvent),
      ]).then((promises) => {
        newEvent.lastUpdate = _.first(_.flatten(promises))[
          resources.lastUpdate
        ];
        return newEvent;
      });
    }

    this.throwNoUpdate(oldEvent);
  }

  mapRowToEvent(row) {
    const event = new Event();
    _.assign(event, row);
    return event;
  }

  insertEvent(event) {
    return this.insertResource(event)
      .then(() => {
        const columns = this.mapEventToColumns(event);
        return dbFn.insertEvent(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertContributors(event),
          this.insertOrganizers(event),
          this.insertSponsors(event),
          this.insertSubEvents(event),
          this.insertEventVenues(event),
          this.insertResourceText(
            participationUrls._name,
            event.participationUrl,
            event.id
          ),
          this.insertResourceText(
            registrationUrls._name,
            event.registrationUrl,
            event.id
          ),
        ])
      )
      .then(() => event.id);
  }

  insertContributors(event) {
    const inserts = event?.contributors?.map((contributor) =>
      dbFn.insertContributor(this.connection, event.id, contributor.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateContributors(event) {
    return dbFn
      .deleteContributors(this.connection, event.id)
      .then(() => this.insertContributors(event));
  }

  insertEventVenues(event) {
    const inserts = event?.venues?.map((venue) =>
      dbFn.insertEventVenue(this.connection, event.id, venue.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateEventVenues(event) {
    return dbFn
      .deleteEventVenues(this.connection, event.id)
      .then(() => this.insertEventVenues(event));
  }

  insertOrganizers(event) {
    const inserts = event?.organizers?.map((organizer) =>
      dbFn.insertOrganizer(this.connection, event.id, organizer.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateOrganizers(event) {
    return dbFn
      .deleteOrganizers(this.connection, event.id)
      .then(() => this.insertOrganizers(event));
  }

  insertSponsors(event) {
    const inserts = event?.sponsors?.map((sponsor) =>
      dbFn.insertSponsor(this.connection, event.id, sponsor.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateSponsors(event) {
    return dbFn
      .deleteSponsors(this.connection, event.id)
      .then(() => this.insertSponsors(event));
  }

  insertSubEvents(event) {
    const inserts = event?.subEvents?.map((subEvent) =>
      dbFn.updateSubEvent(this.connection, event.id, subEvent.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateSubEvents(event) {
    return dbFn
      .deleteSubEvents(this.connection, event.id)
      .then(() => this.insertSubEvents(event));
  }

  // TODO: add venues

  mapEventToColumns(event) {
    return {
      [events.id]: event?.id,
      [events.inPersonCapacity]: event?.inPersonCapacity,
      [events.endDate]: event?.endDate,
      [events.onlineCapacity]: event?.onlineCapacity,
      [events.parentId]: event?.parent?.id,
      [events.publisherId]: event?.publisher?.id,
      [events.recorded]: event?.recorded,
      [events.seriesId]: event?.series?.id,
      [events.simpleParticipationUrl]: _.isString(event?.simpleParticipationUrl)
        ? event?.simpleParticipationUrl
        : null,
      [events.simpleRegistrationUrl]: _.isString(event?.simpleRegistrationUrl)
        ? event?.simpleRegistrationUrl
        : null,
      [events.startDate]: event?.startDate,
      [events.status]: event?.status,
    };
  }
}

module.exports = { EventConnector };
