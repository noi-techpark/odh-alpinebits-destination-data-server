const iso6393 = require("iso-639-3");
const knex = require("./connect");
let connection;

const {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
  insertResourceType,
  insertSeriesFrequency,
  insertEventStatus,
  insertLanguageCode,
} = require("./functions");

knex
  .transaction(function (trx) {
    connection = trx;

    deletePredefinedRecords()
      .then(() => insertPredefinedRecords())
      .then(() => {
        console.log("Default records successfully (re)inserted.");
        return connection.commit();
      })
      .catch((err) => {
        console.error("Failed to (re)insert tables.");
        console.log(err);
        return connection.rollback();
      })
      .finally(() => (connection = null));
  })
  .finally(() => knex.destroy());

function deletePredefinedRecords() {
  return deleteResourceTypes(connection)
    .then(() => deleteAllEventsStatus(connection))
    .then(() => deleteSeriesFrequencies(connection))
    .then(() => deleteLanguageCodes(connection))
    .then((ret) => {
      console.log("All records deleted", ret);
      return ret;
    });
}

function insertResourceTypes() {
  return insertResourceType(connection, { type: "agents", title: "Agents" })
    .then(() => insertResourceType(connection, { type: "categories", title: "Categories" }))
    .then(() => insertResourceType(connection, { type: "events", title: "Events" }))
    .then(() => insertResourceType(connection, { type: "eventSeries", title: "Event Series" }))
    .then(() => insertResourceType(connection, { type: "features", title: "Features" }))
    .then(() => insertResourceType(connection, { type: "lifts", title: "Lifts" }))
    .then(() => insertResourceType(connection, { type: "mediaObjects", title: "Media Objects" }))
    .then(() => insertResourceType(connection, { type: "mountainAreas", title: "Mountain Areas" }))
    .then(() => insertResourceType(connection, { type: "skiSlopes", title: "Ski Slopes" }))
    .then(() => insertResourceType(connection, { type: "snowparks", title: "Snowparks" }))
    .then(() => insertResourceType(connection, { type: "venues", title: "Venues" }));
}

function insertSeriesFrequencies() {
  return insertSeriesFrequency(connection, { frequency: "daily", title: "Daily" })
    .then(() => insertSeriesFrequency(connection, { frequency: "weekly", title: "Weekly" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "monthly", title: "Monthly" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "bimonthly", title: "Bimonthly" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "quarterly", title: "Quarterly" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "annual", title: "Annual" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "biennial", title: "Biennial" }))
    .then(() => insertSeriesFrequency(connection, { frequency: "triennial", title: "Triennial" }));
}

function insertAllEventStatus() {
  return insertEventStatus(connection, { status: "canceled", title: "Canceled" }).then(() =>
    insertEventStatus(connection, { status: "published", title: "Published" })
  );
}

function insertLanguageCodes() {
  const inserts = [];
  for (const { iso6393: code, name, scope, type } of iso6393) {
    if (type === "living" && scope === "individual") {
      inserts.push(insertLanguageCode(knex, { lang: code, title: name }));
    }
  }

  return Promise.all(inserts);
}

function insertPredefinedRecords() {
  return insertAllEventStatus()
    .then(() => insertResourceTypes())
    .then(() => insertSeriesFrequencies())
    .then(() => insertLanguageCodes())
    .then((ret) => {
      console.log("All default records inserted");
      return ret;
    });
}
