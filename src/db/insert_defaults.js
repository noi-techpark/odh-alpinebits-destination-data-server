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
} = require("./functions");

knex
  .transaction(function (trx) {
    connection = trx;

    return deletePredefinedRecords()
      .then(() => insertPredefinedRecords())
      .then(() => {
        console.log("Default records successfully (re)inserted.");
        return connection.commit();
      })
      .catch((err) => {
        console.error("Failed to (re)insert tables.", err);
        connection.rollback();
        process.exit(1);
      })
      .finally(() => {
        console.log(
          "The connection has been completed:",
          connection.isCompleted()
        );
        connection = null;
        knex.destroy();
        process.exit(0);
      });
  })
  .catch((err) => {
    console.error("Failed to run the transaction.");
    console.log(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

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
    .then(() =>
      insertResourceType(connection, {
        type: "categories",
        title: "Categories",
      })
    )
    .then(() =>
      insertResourceType(connection, { type: "events", title: "Events" })
    )
    .then(() =>
      insertResourceType(connection, {
        type: "eventSeries",
        title: "Event Series",
      })
    )
    .then(() =>
      insertResourceType(connection, { type: "features", title: "Features" })
    )
    .then(() =>
      insertResourceType(connection, { type: "lifts", title: "Lifts" })
    )
    .then(() =>
      insertResourceType(connection, {
        type: "mediaObjects",
        title: "Media Objects",
      })
    )
    .then(() =>
      insertResourceType(connection, {
        type: "mountainAreas",
        title: "Mountain Areas",
      })
    )
    .then(() =>
      insertResourceType(connection, { type: "skiSlopes", title: "Ski Slopes" })
    )
    .then(() =>
      insertResourceType(connection, { type: "snowparks", title: "Snowparks" })
    )
    .then(() =>
      insertResourceType(connection, { type: "venues", title: "Venues" })
    );
}

function insertSeriesFrequencies() {
  return insertSeriesFrequency(connection, {
    frequency: "daily",
    title: "Daily",
  })
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "weekly",
        title: "Weekly",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "monthly",
        title: "Monthly",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "bimonthly",
        title: "Bimonthly",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "quarterly",
        title: "Quarterly",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "annual",
        title: "Annual",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "biennial",
        title: "Biennial",
      })
    )
    .then(() =>
      insertSeriesFrequency(connection, {
        frequency: "triennial",
        title: "Triennial",
      })
    );
}

function insertAllEventStatus() {
  return insertEventStatus(connection, {
    status: "canceled",
    title: "Canceled",
  }).then(() =>
    insertEventStatus(connection, { status: "published", title: "Published" })
  );
}

function insertLanguageCodes() {
  let values = [];
  for (const { iso6393: code, name, scope, type } of iso6393) {
    if (type === "living" && scope === "individual") {
      values.push(
        `('${code?.replace(/'+/g, "")}', '${name?.replace(/'+/g, "")}')`
      );
    }
  }

  const query = `INSERT INTO language_codes (lang, title)
  VALUES
    ${values.join(", ")}
  ON CONFLICT (lang) DO NOTHING;`;

  return connection.raw(query);
}

function insertDefaultCategories() {
  const insertCategoriesResources = `INSERT INTO resources
      (id, type, data_provider)
    VALUES
      ('schema:BusinessEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:ChildrensEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:ComedyEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:CourseInstance', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:DanceEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:DeliveryEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:EducationEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:EventSeries', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:ExhibitionEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:Festival', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:FoodEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:Hackathon', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:LiteraryEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:MusicEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:PublicationEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:SaleEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:ScreeningEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:SocialEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:SportsEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:TheaterEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('schema:VisualArtsEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:inPersonEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:virtualEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:hybridEvent', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:person', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:organization', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:standard-ski-slope', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:sledge-slope', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:cross-country', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:chairlift', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:gondola', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:skilift', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:cablecar', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:funicular', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:magic-carpet', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:skibus', 'categories', 'http://tourism.opendatahub.bz.it/'),
      ('alpinebits:train', 'categories', 'http://tourism.opendatahub.bz.it/')
    ON CONFLICT (id) DO NOTHING;`;

  const insertCategories = `INSERT INTO categories
      (id, namespace)
    VALUES
      ('schema:BusinessEvent', 'schema'),
      ('schema:ChildrensEvent', 'schema'),
      ('schema:ComedyEvent', 'schema'),
      ('schema:CourseInstance', 'schema'),
      ('schema:DanceEvent', 'schema'),
      ('schema:DeliveryEvent', 'schema'),
      ('schema:EducationEvent', 'schema'),
      ('schema:EventSeries', 'schema'),
      ('schema:ExhibitionEvent', 'schema'),
      ('schema:Festival', 'schema'),
      ('schema:FoodEvent', 'schema'),
      ('schema:Hackathon', 'schema'),
      ('schema:LiteraryEvent', 'schema'),
      ('schema:MusicEvent', 'schema'),
      ('schema:PublicationEvent', 'schema'),
      ('schema:SaleEvent', 'schema'),
      ('schema:ScreeningEvent', 'schema'),
      ('schema:SocialEvent', 'schema'),
      ('schema:SportsEvent', 'schema'),
      ('schema:TheaterEvent', 'schema'),
      ('schema:VisualArtsEvent', 'schema'),
      ('alpinebits:inPersonEvent', 'alpinebits'),
      ('alpinebits:virtualEvent', 'alpinebits'),
      ('alpinebits:hybridEvent', 'alpinebits'),
      ('alpinebits:person', 'alpinebits'),
      ('alpinebits:organization', 'alpinebits'),
      ('alpinebits:standard-ski-slope', 'alpinebits'),
      ('alpinebits:sledge-slope', 'alpinebits'),
      ('alpinebits:cross-country', 'alpinebits'),
      ('alpinebits:chairlift', 'alpinebits'),
      ('alpinebits:gondola', 'alpinebits'),
      ('alpinebits:skilift', 'alpinebits'),
      ('alpinebits:cablecar', 'alpinebits'),
      ('alpinebits:funicular', 'alpinebits'),
      ('alpinebits:magic-carpet', 'alpinebits'),
      ('alpinebits:skibus', 'alpinebits'),
      ('alpinebits:train', 'alpinebits')
    ON CONFLICT (id) DO NOTHING;`;

  const insertCategoryCoveredTypes = `INSERT INTO category_covered_types
      (type, category_id)
    VALUES
      ('events', 'schema:BusinessEvent'),
      ('events', 'schema:ChildrensEvent'),
      ('events', 'schema:ComedyEvent'),
      ('events', 'schema:CourseInstance'),
      ('events', 'schema:DanceEvent'),
      ('events', 'schema:DeliveryEvent'),
      ('events', 'schema:EducationEvent'),
      ('events', 'schema:EventSeries'),
      ('events', 'schema:ExhibitionEvent'),
      ('events', 'schema:Festival'),
      ('events', 'schema:FoodEvent'),
      ('events', 'schema:Hackathon'),
      ('events', 'schema:LiteraryEvent'),
      ('events', 'schema:MusicEvent'),
      ('events', 'schema:PublicationEvent'),
      ('events', 'schema:SaleEvent'),
      ('events', 'schema:ScreeningEvent'),
      ('events', 'schema:SocialEvent'),
      ('events', 'schema:SportsEvent'),
      ('events', 'schema:TheaterEvent'),
      ('events', 'schema:VisualArtsEvent'),
      ('events', 'alpinebits:inPersonEvent'),
      ('events', 'alpinebits:virtualEvent'),
      ('events', 'alpinebits:hybridEvent'),
      ('agents', 'alpinebits:person'),
      ('agents', 'alpinebits:organization'),
      ('skiSlopes', 'alpinebits:standard-ski-slope'),
      ('skiSlopes', 'alpinebits:sledge-slope'),
      ('skiSlopes', 'alpinebits:cross-country'),
      ('lifts', 'alpinebits:chairlift'),
      ('lifts', 'alpinebits:gondola'),
      ('lifts', 'alpinebits:skilift'),
      ('lifts', 'alpinebits:cablecar'),
      ('lifts', 'alpinebits:funicular'),
      ('lifts', 'alpinebits:magic-carpet'),
      ('lifts', 'alpinebits:skibus'),
      ('lifts', 'alpinebits:train')
    ON CONFLICT (type, category_id) DO NOTHING;`;

  const insertCategoriesNames = `INSERT INTO names
      (resource_id, lang, content)
    VALUES
        ('schema:BusinessEvent', 'eng', 'Business Event'),
        ('schema:ChildrensEvent', 'eng', 'Childrens Event'),
        ('schema:ComedyEvent', 'eng', 'Comedy Event'),
        ('schema:CourseInstance', 'eng', 'Course Instance'),
        ('schema:DanceEvent', 'eng', 'Dance Event'),
        ('schema:DeliveryEvent', 'eng', 'Delivery Event'),
        ('schema:EducationEvent', 'eng', 'Education Event'),
        ('schema:EventSeries', 'eng', 'Event Series'),
        ('schema:ExhibitionEvent', 'eng', 'Exhibition Event'),
        ('schema:Festival', 'eng', 'Festival'),
        ('schema:FoodEvent', 'eng', 'Food Event'),
        ('schema:Hackathon', 'eng', 'Hackathon'),
        ('schema:LiteraryEvent', 'eng', 'Literary Event'),
        ('schema:MusicEvent', 'eng', 'Music Event'),
        ('schema:PublicationEvent', 'eng', 'Publication Event'),
        ('schema:SaleEvent', 'eng', 'Sale Event'),
        ('schema:ScreeningEvent', 'eng', 'Screening Event'),
        ('schema:SocialEvent', 'eng', 'Social Event'),
        ('schema:SportsEvent', 'eng', 'Sports Event'),
        ('schema:TheaterEvent', 'eng', 'Theater Event'),
        ('schema:VisualArtsEvent', 'eng', 'Visual Arts Event'),
        ('alpinebits:inPersonEvent', 'eng', 'In-Person Event'),
        ('alpinebits:virtualEvent', 'eng', 'Virtual Event'),
        ('alpinebits:hybridEvent', 'eng', 'Hybrid Event'),
        ('alpinebits:person', 'eng', 'Person'),
        ('alpinebits:person', 'ita', 'Persona'),
        ('alpinebits:person', 'deu', 'Person'),
        ('alpinebits:organization', 'deu', 'Organisation'),
        ('alpinebits:organization', 'ita', 'Organizzazione'),
        ('alpinebits:organization', 'eng', 'Organization'),
        ('alpinebits:standard-ski-slope', 'eng', 'Standard Ski-Slope'),
        ('alpinebits:sledge-slope', 'eng', 'Sledge-Slope'),
        ('alpinebits:cross-country', 'eng', 'Cross-Country'),
        ('alpinebits:chairlift', 'eng', 'Cablecar'),
        ('alpinebits:gondola', 'eng', 'Chairlift'),
        ('alpinebits:skilift', 'eng', 'Funicular'),
        ('alpinebits:cablecar', 'eng', 'Gondola'),
        ('alpinebits:funicular', 'eng', 'Magic-Carpet'),
        ('alpinebits:magic-carpet', 'eng', 'Skibus'),
        ('alpinebits:skibus', 'eng', 'Skilift'),
        ('alpinebits:train', 'eng', 'Train')
      ON CONFLICT (resource_id, lang) DO NOTHING;`;

  const insertCategoriesDescriptions = `INSERT INTO descriptions
      (resource_id, lang, content)
    VALUES
        ('schema:BusinessEvent', 'eng', 'An event classified as BusinessEvent under definitions of Schema.org'),
        ('schema:ChildrensEvent', 'eng', 'An event classified as ChildrensEvent under definitions of Schema.org'),
        ('schema:ComedyEvent', 'eng', 'An event classified as ComedyEvent under definitions of Schema.org'),
        ('schema:CourseInstance', 'eng', 'An event classified as CourseInstance under definitions of Schema.org'),
        ('schema:DanceEvent', 'eng', 'An event classified as DanceEvent under definitions of Schema.org'),
        ('schema:DeliveryEvent', 'eng', 'An event classified as DeliveryEvent under definitions of Schema.org'),
        ('schema:EducationEvent', 'eng', 'An event classified as EducationEvent under definitions of Schema.org'),
        ('schema:EventSeries', 'eng', 'An event classified as EventSeries under definitions of Schema.org'),
        ('schema:ExhibitionEvent', 'eng', 'An event classified as ExhibitionEvent under definitions of Schema.org'),
        ('schema:Festival', 'eng', 'An event classified as Festival under definitions of Schema.org'),
        ('schema:FoodEvent', 'eng', 'An event classified as FoodEvent under definitions of Schema.org'),
        ('schema:Hackathon', 'eng', 'An event classified as Hackathon under definitions of Schema.org'),
        ('schema:LiteraryEvent', 'eng', 'An event classified as LiteraryEvent under definitions of Schema.org'),
        ('schema:MusicEvent', 'eng', 'An event classified as MusicEvent under definitions of Schema.org'),
        ('schema:PublicationEvent', 'eng', 'An event classified as PublicationEvent under definitions of Schema.org'),
        ('schema:SaleEvent', 'eng', 'An event classified as SaleEvent under definitions of Schema.org'),
        ('schema:ScreeningEvent', 'eng', 'An event classified as ScreeningEvent under definitions of Schema.org'),
        ('schema:SocialEvent', 'eng', 'An event classified as SocialEvent under definitions of Schema.org'),
        ('schema:SportsEvent', 'eng', 'An event classified as SportsEvent under definitions of Schema.org'),
        ('schema:TheaterEvent', 'eng', 'An event classified as TheaterEvent under definitions of Schema.org'),
        ('schema:VisualArtsEvent', 'eng', 'An event classified as VisualArtsEvent under definitions of Schema.org'),
        ('alpinebits:inPersonEvent', 'eng', 'An event resource representing a event planned for exclusive in-person attendance'),
        ('alpinebits:virtualEvent', 'eng', 'An event resource representing a event planned for exclusive virtual attendance'),
        ('alpinebits:hybridEvent', 'eng', 'An event resource representing a event planned for both in- person and virtual attendance'),
        ('alpinebits:person', 'eng', 'An agent representing a person'),
        ('alpinebits:organization', 'eng', 'An agent representing an organization')
      ON CONFLICT (resource_id, lang) DO NOTHING;`;

  const insertCategoriesUrls = `INSERT INTO urls
      (resource_id, lang, content)
    VALUES
        ('schema:BusinessEvent', 'eng', 'https://schema.org/BusinessEvent'),
        ('schema:ChildrensEvent', 'eng', 'https://schema.org/ChildrensEvent'),
        ('schema:ComedyEvent', 'eng', 'https://schema.org/ComedyEvent'),
        ('schema:CourseInstance', 'eng', 'https://schema.org/CourseInstance'),
        ('schema:DanceEvent', 'eng', 'https://schema.org/DanceEvent'),
        ('schema:DeliveryEvent', 'eng', 'https://schema.org/DeliveryEvent'),
        ('schema:EducationEvent', 'eng', 'https://schema.org/EducationEvent'),
        ('schema:EventSeries', 'eng', 'https://schema.org/EventSeries'),
        ('schema:ExhibitionEvent', 'eng', 'https://schema.org/ExhibitionEvent'),
        ('schema:Festival', 'eng', 'https://schema.org/Festival'),
        ('schema:FoodEvent', 'eng', 'https://schema.org/FoodEvent'),
        ('schema:Hackathon', 'eng', 'https://schema.org/Hackathon'),
        ('schema:LiteraryEvent', 'eng', 'https://schema.org/LiteraryEvent'),
        ('schema:MusicEvent', 'eng', 'https://schema.org/MusicEvent'),
        ('schema:PublicationEvent', 'eng', 'https://schema.org/PublicationEvent'),
        ('schema:SaleEvent', 'eng', 'https://schema.org/SaleEvent'),
        ('schema:ScreeningEvent', 'eng', 'https://schema.org/ScreeningEvent'),
        ('schema:SocialEvent', 'eng', 'https://schema.org/SocialEvent'),
        ('schema:SportsEvent', 'eng', 'https://schema.org/SportsEvent'),
        ('schema:TheaterEvent', 'eng', 'https://schema.org/TheaterEvent'),
        ('schema:VisualArtsEvent', 'eng', 'https://schema.org/VisualArtsEvent')
      ON CONFLICT (resource_id, lang) DO NOTHING;`;

  return connection.raw(`${insertCategoriesResources}
      ${insertCategories}
      ${insertCategoryCoveredTypes}
      ${insertCategoriesNames}
      ${insertCategoriesDescriptions}
      ${insertCategoriesUrls}`);
}

function insertPredefinedRecords() {
  console.log("Running insertAllEventStatus()");
  return insertAllEventStatus()
    .then(() => {
      console.log("Running insertResourceTypes()");
      return insertResourceTypes();
    })
    .then(() => {
      console.log("Running insertSeriesFrequencies()");
      return insertSeriesFrequencies();
    })
    .then(() => {
      console.log("Running insertLanguageCodes()");
      return insertLanguageCodes();
    })
    .then(() => {
      console.log("Running insertDefaultCategories()");
      return insertDefaultCategories();
    })
    .then((ret) => {
      console.log("All default records inserted");
      return ret;
    });
}
