const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { schemas } = require("../db");
const { EventSeries } = require("../model/destinationdata2022/event_series");
const { DestinationDataError } = require("../errors");
const errors = require("../errors");
const { eventSeries: eventSeriesSchema, resources } = schemas;

class EventSeriesConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(eventSeries) {
    return this.runTransaction(() =>
      this.insertEventSeries(eventSeries).then(() =>
        this.retrieveEventSeries(eventSeries.id)
      )
    );
  }

  retrieve(id) {
    const eventSeriesId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveEventSeries(eventSeriesId));
  }

  retrieveEventEventSeries(event) {
    const seriesId = event?.series?.id ?? "";
    return this.runTransaction(() => this.retrieveEventSeries(seriesId)).catch(
      (err) => {
        if (err?.title === errors.notFound.title) {
          return null;
        }
        throw err;
      }
    );
  }

  update(eventSeries) {
    if (!eventSeries.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveEventSeries(eventSeries.id).then((oldEventSeries) =>
        this.updateEventSeries(oldEventSeries, eventSeries)
      )
    );
  }

  delete(id) {
    const eventSeriesId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteEventSeries(eventSeriesId));
  }

  deleteEventSeries(id) {
    return this.deleteResource(id, "eventSeries");
  }

  retrieveEventSeries(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectEventSeriesFromId(
        this.connection,
        id,
        offset,
        limit,
        orderBy,
        filters
      )
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToEventSeries(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Event Series resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToEventSeries);
        }
      });
  }

  updateEventSeries(oldEventSeries, newInput) {
    const newEventSeries = _.create(oldEventSeries);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newEventSeries[k] = v;
    });

    if (this.shouldUpdate(oldEventSeries, newEventSeries)) {
      const columns = this.mapEventSeriesToColumns(newEventSeries);

      return dbFn
        .updateEventSeries(this.connection, columns)
        .then((ret) => {
          newEventSeries.id = _.first(ret)?.id;

          return Promise.all([
            this.updateResource(newEventSeries),
            this.updateEditions(newEventSeries),
          ]);
        })
        .then((promises) => {
          newEventSeries.lastUpdate = _.first(_.flatten(promises))[
            resources.lastUpdate
          ];
          return newEventSeries;
        });
    }

    this.throwNoUpdate(oldEventSeries);
  }

  mapRowToEventSeries(row) {
    const eventSeries = new EventSeries();
    _.assign(eventSeries, row);
    return eventSeries;
  }

  insertEventSeries(eventSeries) {
    return this.insertResource(eventSeries)
      .then(() => {
        const columns = this.mapEventSeriesToColumns(eventSeries);
        return dbFn.insertEventSeries(this.connection, columns);
      })
      .then(() => Promise.all([this.insertEditions(eventSeries)]))
      .then(() => eventSeries.id);
  }

  insertEditions(eventSeries) {
    const inserts = eventSeries?.editions?.map((event) =>
      dbFn.updateEdition(this.connection, eventSeries.id, event.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateEditions(eventSeries) {
    return dbFn
      .deleteEditions(this.connection, eventSeries.id)
      .then(() => this.insertEditions(eventSeries));
  }

  mapEventSeriesToColumns(eventSeries) {
    return {
      [eventSeriesSchema.id]: eventSeries?.id,
      [eventSeriesSchema.frequency]: eventSeries?.frequency,
    };
  }
}

module.exports = { EventSeriesConnector };
