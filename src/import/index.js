const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const _ = require("lodash");

const db = require("../db");
const { schemas } = db;
const mappings = require("../model/mappings");

let idCounter = 1;
const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {},
};
const odhTagMapping = {
  aufstiegsanlagen: db.defaults.resourceTypes.lifts,
  "ski alpin": db.defaults.resourceTypes.skiSlopes,
  "ski alpin (rundkurs)": db.defaults.resourceTypes.skiSlopes,
  rodelbahnen: db.defaults.resourceTypes.skiSlopes,
  loipen: db.defaults.resourceTypes.skiSlopes,
  snowpark: db.defaults.resourceTypes.snowparks,
};

const {
  AgentValue,
  ContactPointValue,
  DescriptionValue,
  EventValue,
  LiftValue,
  SkiSlopeValue,
  SnowparkValue,
  VenueValue,
  NameValue,
  ResourceValue,
  AddressValue,
  CityValue,
  StreetValue,
  OrganizerValue,
  EventVenueValue,
  PlaceValue,
  CategoryValue,
  ResourceCategoryValue,
  CategoryCoveredTypesValue,
  MountainAreaValue,
  ShortNameValue,
  AbstractValue,
  UrlValue,
} = require("./model");

const odhEventTopicData = getOdhData(process.argv[2]);
const odhEventData = getOdhData(process.argv[3]);
const odhActivityTypeData = getOdhData(process.argv[4]);
const odhActivityData = getOdhData(process.argv[5]);
const odhSkiAreaData = getOdhData(process.argv[6]);
const odhSkiRegionData = getOdhData(process.argv[7]);
const odhMountainAreaData = [...odhSkiAreaData, ...odhSkiRegionData];

odhEventTopicData.forEach((item) => processEventTopic(item));
odhEventData.Items.forEach((item) => processEvent(item));
odhActivityTypeData.forEach((item) => processActivityType(item));
odhActivityData.Items.forEach((item) => processActivity(item));
odhMountainAreaData.forEach((item) => processMountainArea(item));

generateQueries();

/** *************************** CLASSES *************************** */

/** *************************** FUNCTIONS *************************** */

function getOdhData(path) {
  const topicsFilePath = path;
  const file = fs.readFileSync(topicsFilePath);
  return JSON.parse(file);
}

function processMountainArea(item) {
  // resources table
  // // id
  // // odh_id
  // // created_at
  // // last_update
  // // data_provider
  // // type

  const amountainAreaResourceValue = new ResourceValue();

  amountainAreaResourceValue.id = getItemId(item);
  amountainAreaResourceValue.odhId = getItemId(item);
  amountainAreaResourceValue.createdAt = getItemCreationDate(item);
  amountainAreaResourceValue.lastUpdate = getItemLastUpdate(item);
  amountainAreaResourceValue.dataProvider = getItemDataProvider();
  amountainAreaResourceValue.type = getMountainAreaType();

  ResourceValue.values.push(amountainAreaResourceValue);

  // mountain areas table
  // // totalSlopeLength
  // // areaOwnerId

  const mountainAreaValue = new MountainAreaValue();

  mountainAreaValue.id = amountainAreaResourceValue.id;
  mountainAreaValue.totalSlopeLength = getTotalSlopeLength(item);
  mountainAreaValue.areaOwnerId = getAreaOwnerId(item); // TODO: add area owner

  MountainAreaValue.values.push(mountainAreaValue);

  // // areaOwner

  processAreaOwner(item);

  // abstracts table
  // // abstract

  for (const [lang, content] of Object.entries(getItemAbstract(item) ?? {})) {
    const mountainAreaAbstractValue = new AbstractValue();

    mountainAreaAbstractValue.id = mountainAreaValue.id;
    mountainAreaAbstractValue.lang = lang;
    mountainAreaAbstractValue.content = content;

    AbstractValue.values.push(mountainAreaAbstractValue);
  }

  // descriptions table
  // // description

  for (const [lang, content] of Object.entries(
    getItemDescription(item) ?? {}
  )) {
    const mountainAreaDescriptionValue = new DescriptionValue();

    mountainAreaDescriptionValue.id = mountainAreaValue.id;
    mountainAreaDescriptionValue.lang = lang;
    mountainAreaDescriptionValue.content = content;

    DescriptionValue.values.push(mountainAreaDescriptionValue);
  }

  // places table
  // // geometries
  // // maxAltitude
  // // minAltitude
  // // openingHours

  const placeValue = new PlaceValue();

  placeValue.id = mountainAreaValue.id;
  placeValue.geometries = getMountainAreaGeometry(item);
  placeValue.maxAltitude = gettMountainAreaMaxAltitude(item);
  placeValue.minAltitude = gettMountainAreaMinAltitude(item);
  placeValue.openingHours = getOpeningHours(item);

  PlaceValue.values.push(placeValue);

  // names table
  // // name

  for (const [lang, content] of Object.entries(getItemName(item) ?? {})) {
    const mountainAreaNameValue = new NameValue();

    mountainAreaNameValue.id = mountainAreaValue.id;
    mountainAreaNameValue.lang = lang;
    mountainAreaNameValue.content = content;

    NameValue.values.push(mountainAreaNameValue);
  }

  // short names table
  // // shortName

  for (const [lang, content] of Object.entries(getItemShortName(item) ?? {})) {
    const mountainAreaShortNameValue = new ShortNameValue();

    mountainAreaShortNameValue.id = mountainAreaValue.id;
    mountainAreaShortNameValue.lang = lang;
    mountainAreaShortNameValue.content = content;

    ShortNameValue.values.push(mountainAreaShortNameValue);
  }

  // multimedia descriptions table
  // // multimediaDescriptions
  // // TODO: turn webcam feeds into multimedia descriptions

  // // TODO: process these (lifts, snowparks, and ski slopes) on a new request?
  // area lifts table
  // // lifts

  // area snowparks table
  // // snowparks

  // area skiSlopes table
  // // skiSlopes
}

function getMountainAreaType() {
  return db.defaults.resourceTypes.mountainAreas;
}

function getTotalSlopeLength(mountainArea) {
  return parseInt(mountainArea?.TotalSlopeKm) || null;
}

function getMountainAreaGeometry(mountainArea) {
  const geometries = [];

  if (mountainArea.Longitude && mountainArea.Latitude) {
    const point = createPoint(
      mountainArea.Longitude,
      mountainArea.Latitude,
      mountainArea.Altitude
    );
    geometries.push(point);
  }

  if (mountainArea.GpsPolygon) {
    const polygon = createPolygon();
    const outerRing = [];

    mountainArea.GpsPolygon.forEach((point) =>
      outerRing.push([point.Latitude, point.Longitude])
    );
    outerRing.push(outerRing[0]);

    if (isClockwise(outerRing)) polygon.coordinates.push(outerRing.reverse());
    else polygon.coordinates.push(outerRing);

    geometries.push(polygon);
  }

  return !_.isEmpty(geometries) ? geometries : null;
}

function isClockwise(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    let cur = poly[i],
      next = poly[i + 1];
    sum += (next[0] - cur[0]) * (next[1] + cur[1]);
  }
  return sum > 0;
}

function gettMountainAreaMaxAltitude(mountainArea) {
  return mountainArea.AltitudeTo || null;
}

function gettMountainAreaMinAltitude(mountainArea) {
  return mountainArea.AltitudeFrom || null;
}

function processAreaOwner(item) {
  // resources table
  // // id
  // // created_at
  // // last_update
  // // data_provider
  // // type

  const areaOwnerResourceValue = new ResourceValue();

  areaOwnerResourceValue.id = getAreaOwnerId(item);
  areaOwnerResourceValue.createdAt = getItemCreationDate(item);
  areaOwnerResourceValue.lastUpdate = getItemLastUpdate(item);
  areaOwnerResourceValue.dataProvider = getItemDataProvider();
  areaOwnerResourceValue.type = getAgentsType();

  ResourceValue.values.push(areaOwnerResourceValue);

  const areaOwerAgentValue = new AgentValue();

  areaOwerAgentValue.id = areaOwnerResourceValue.id;

  AgentValue.values.push(areaOwerAgentValue);

  // names table
  // // name

  for (const [lang, content] of Object.entries(
    getEventOrganizerName(item) ?? {}
  )) {
    const areaOwnerNameValue = new NameValue();

    areaOwnerNameValue.id = areaOwerAgentValue.id;
    areaOwnerNameValue.lang = lang;
    areaOwnerNameValue.content = content;

    NameValue.values.push(areaOwnerNameValue);
  }

  // urls table
  // // url

  for (const [lang, content] of Object.entries(getAreaOwnerUrl(item) ?? {})) {
    const areaOwnerUrlValue = new UrlValue();

    areaOwnerUrlValue.id = areaOwerAgentValue.id;
    areaOwnerUrlValue.lang = lang;
    areaOwnerUrlValue.content = content;

    NameValue.values.push(areaOwnerUrlValue);
  }

  // contact points table
  // // area owner id
  // // address id
  // // email
  // // telephone

  const areaOwnerContactPointValue = new ContactPointValue();

  areaOwnerContactPointValue.id = idCounter++;
  areaOwnerContactPointValue.addressId = areaOwnerContactPointValue.id;
  areaOwnerContactPointValue.agentId = areaOwerAgentValue.id;
  areaOwnerContactPointValue.email = getAreaOwnerEmail(item);
  areaOwnerContactPointValue.telephone = getAreaOwnerTelephone(item);

  ContactPointValue.addValue(areaOwnerContactPointValue);

  // addresses table
  // // country
  // // zipcode

  const areaOwnerAddressValue = new AddressValue();

  areaOwnerAddressValue.id = areaOwnerContactPointValue.id;
  areaOwnerAddressValue.country = getAreaOwnerCountryCode(item) ?? "IT";
  areaOwnerAddressValue.zipcode = getAreaOwnerZipCode(item);

  AddressValue.addContactAddressValue(areaOwnerAddressValue);

  // cities table
  // // city

  for (const [lang, content] of Object.entries(getAreaOwnerCity(item) ?? {})) {
    const cityValue = new CityValue();

    cityValue.id = areaOwnerAddressValue.id;
    cityValue.lang = lang;
    cityValue.content = content;

    CityValue.addValue(cityValue);
  }

  // streets table
  // // street

  for (const [lang, content] of Object.entries(
    getAreaOwnerStreet(item) ?? {}
  )) {
    const streetValue = new StreetValue();

    streetValue.id = areaOwnerAddressValue.id;
    streetValue.lang = lang;
    streetValue.content = content;

    StreetValue.addValue(streetValue);
  }
}

function processActivityType(odhType) {
  const categoryResourceValue = new ResourceValue();

  categoryResourceValue.id = getActivityTypeId(odhType);
  categoryResourceValue.odhId = getActivityTypeOdhId(odhType);
  categoryResourceValue.dataProvider = getItemDataProvider();
  categoryResourceValue.type = getCategoriesType();

  ResourceValue.values.push(categoryResourceValue);

  const categoryValue = new CategoryValue();

  categoryValue.id = categoryResourceValue.id;
  categoryValue.namespace = getOdhCategoryNamespace();

  CategoryValue.values.push(categoryValue);

  for (const [lang, content] of Object.entries(
    getActivityTypeOrTopicName(odhType) ?? {}
  )) {
    const topicNameValue = new NameValue();

    topicNameValue.id = categoryResourceValue.id;
    topicNameValue.lang = lang;
    topicNameValue.content = content;

    NameValue.values.push(topicNameValue);
  }

  // TODO: review mapping
  for (const resourceType of ["lifts", "skiSlopes", "snowparks"]) {
    const coveredType = new CategoryCoveredTypesValue();

    coveredType.categoryId = categoryValue.id;
    coveredType.type = resourceType;

    CategoryCoveredTypesValue.values.push(coveredType);
  }
}

function getActivityTypeId(topic) {
  const id = topic.Id.replace(/-|\/|\s/g, "-")?.replace(/-+/g, "-");
  return `odh:${_.deburr(id)}`;
}

function getActivityTypeOdhId(topic) {
  return topic.Id;
}

function getActivityTypeOrTopicName(topic) {
  return sanitizeAndConvertLanguageTags(topic?.TypeDesc);
}

function processActivity(item) {
  // resources table
  // // id
  // // odh_id
  // // created_at
  // // last_update
  // // data_provider
  // // type
  // // simple_url

  const activityResourceValue = new ResourceValue();

  activityResourceValue.id = getItemId(item);
  activityResourceValue.odhId = getItemId(item);
  activityResourceValue.createdAt = getItemCreationDate(item);
  activityResourceValue.lastUpdate = getItemLastUpdate(item);
  activityResourceValue.dataProvider = getItemDataProvider();
  activityResourceValue.type = getActivityType(item);
  activityResourceValue.simpleUrl = getActivitySimpleUrl(item);

  if (!activityResourceValue.type) return;

  ResourceValue.values.push(activityResourceValue);

  // lifts table
  // // capacity - no data
  // // persons_per_chair - no data

  if (isLift(activityResourceValue)) {
    const liftValue = new LiftValue();

    liftValue.id = activityResourceValue.id;

    LiftValue.values.push(liftValue);
  }

  // ski slopes table
  // // difficulty

  if (isSkiSlope(activityResourceValue)) {
    const skiSlopeValue = new SkiSlopeValue();

    skiSlopeValue.id = activityResourceValue.id;
    skiSlopeValue.difficultyEu = getSkiSlopeDifficultyEu(item);

    SkiSlopeValue.values.push(skiSlopeValue);
  }

  // snowparks table
  // // difficulty

  if (isSnowpark(activityResourceValue)) {
    const snowparkValue = new SnowparkValue();

    snowparkValue.id = activityResourceValue.id;
    snowparkValue.difficulty = getSnowparkDifficulty(item);

    SnowparkValue.values.push(snowparkValue);
  }

  // names table
  // // name

  for (const [lang, content] of Object.entries(getItemName(item) ?? {})) {
    const activityNameValue = new NameValue();

    activityNameValue.id = activityResourceValue.id;
    activityNameValue.lang = lang;
    activityNameValue.content = content;

    NameValue.values.push(activityNameValue);
  }

  // places table
  // // geometries
  // // length
  // // max_altitude
  // // min_altitude
  // // opening_hours

  const placeValue = new PlaceValue();

  placeValue.id = activityResourceValue.id;
  placeValue.geometries = getActivityGeometry(item);
  placeValue.length = getActivityLength(item);
  placeValue.maxAltitude = getActivityMaxAltitude(item);
  placeValue.minAltitude = getActivityMinAltitude(item);
  placeValue.openingHours = getOpeningHours(item);

  PlaceValue.values.push(placeValue);

  // categories table
  // // categories

  for (const activityCategoryId of getActivityCategoriesIds(item)) {
    const activityCategory = new ResourceCategoryValue();

    activityCategory.resourceId = activityResourceValue.id;
    activityCategory.categoryId = activityCategoryId;

    ResourceCategoryValue.addValue(activityCategory);
  }
}

function getActivitySimpleUrl(activity) {
  let title = extractFieldFromMultilingualObject(activity?.ContactInfos, "Url");
  title = sanitizeAndConvertLanguageTags(title);
  return !_.isEmpty(title) ? Object.values(title)[0] : null;
}

function isLift(resourceValue) {
  return db.defaults.resourceTypes.lifts === resourceValue.type;
}

function isSkiSlope(resourceValue) {
  return db.defaults.resourceTypes.skiSlopes === resourceValue.type;
}

function isSnowpark(resourceValue) {
  return db.defaults.resourceTypes.snowparks === resourceValue.type;
}

function getSkiSlopeDifficultyEu(activity) {
  // TODO: review: is this the "us" or the "eu" classification?
  const difficulty = activity?.Difficulty;
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "expert",
  };

  return difficultyMapping[difficulty] ?? null;
}

function getSnowparkDifficulty(activity) {
  // TODO: review: is this mapping indeed the same as the ski slope one?
  const difficulty = activity?.Difficulty;
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "expert",
  };

  return difficultyMapping[difficulty] ?? null;
}

function getActivityGeometry(activity) {
  const { GpsInfo } = activity;

  if (!_.isArray(GpsInfo) || _.isEmpty(GpsInfo)) {
    return null;
  }

  const geometries = [];
  const coordinatesArray = GpsInfo.map((info) => [
    info.Longitude,
    info.Latitude,
    info.Altitude,
  ]);

  if (coordinatesArray.length === 1) {
    const [longitude, latitude, altitude] = coordinatesArray[0];
    geometries.push(createPoint(longitude, latitude, altitude));
  } else {
    geometries.push(createLineString(coordinatesArray));
  }

  return geometries;
}

function createPoint(longitude, latitude, altitude) {
  const coordinates = [];

  if (longitude) coordinates.push(longitude);
  if (latitude) coordinates.push(latitude);
  if (altitude) coordinates.push(altitude);

  return {
    type: "Point",
    coordinates,
  };
}

function createLineString(points) {
  return {
    type: "LineString",
    coordinates: points,
  };
}

function createPolygon() {
  const coordinates = [];

  return {
    type: "Polygon",
    coordinates,
  };
}

function getActivityLength(activity) {
  return activity.DistanceLength ? activity.DistanceLength : null;
}

function getActivityMaxAltitude(activity) {
  return activity.AltitudeHighestPoint ? activity.AltitudeHighestPoint : null;
}

function getActivityMinAltitude(activity) {
  return activity.AltitudeLowestPoint ? activity.AltitudeLowestPoint : null;
}

function getOpeningHours(activity) {
  const { OperationSchedule } = activity;

  if (!_.isArray(OperationSchedule) || _.isEmpty(OperationSchedule))
    return null;

  const hoursSpecification = {
    dailySchedules: null,
    weeklySchedules: null,
  };

  OperationSchedule.forEach((schedule) => {
    const { OperationScheduleTime } = schedule;

    if (schedule.Start === schedule.Stop) {
      if (!schedule.Start || !Array.isArray(OperationScheduleTime)) return;

      const dateRegex = /\d{4}-\d{2}-\d{2}/i;
      const matchArray = schedule.Start.match(dateRegex);

      if (!matchArray) return;

      const scheduleDate = matchArray[0];

      OperationScheduleTime.forEach((item) => {
        const openingWindow = createOpeningWindow(item.Start, item.End);
        addDailySchedule(hoursSpecification, scheduleDate, [openingWindow]);
      });
    } else {
      if (!schedule.Start || !Array.isArray(OperationScheduleTime)) return;

      const dateRegex = /T.*/;
      const validFrom = schedule.Start.replace(dateRegex, "");
      const validTo = schedule.Stop.replace(dateRegex, "");

      OperationScheduleTime.forEach((item) => {
        const weeklySchedule = createWeeklySchedule(validFrom, validTo);

        weeklySchedule.sunday = item.Sunday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.monday = item.Monday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.tuesday = item.Tuesday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.wednesday = item.Wednesday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.thursday = item.Thursday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.friday = item.Friday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;
        weeklySchedule.saturday = item.Saturday
          ? [createOpeningWindow(item.Start, item.End)]
          : null;

        addWeeklySchedule(hoursSpecification, weeklySchedule);
      });
    }
  });

  return !_.isEmpty(hoursSpecification.dailySchedules) ||
    !_.isEmpty(hoursSpecification.weeklySchedules)
    ? hoursSpecification
    : null;
}

function createOpeningWindow(opens, closes) {
  return {
    opens: opens || null,
    closes: closes || null,
  };
}

function addDailySchedule(hourSpecification, date, openingWindows) {
  if (!hourSpecification.dailySchedules) {
    hourSpecification.dailySchedules = {};
  }

  hourSpecification.dailySchedules[date] = openingWindows;
}

function createWeeklySchedule(validFrom, validTo) {
  return {
    validFrom,
    validTo,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };
}

function addWeeklySchedule(hourSpecification, weeklySchedule) {
  if (!hourSpecification.weeklySchedules) {
    hourSpecification.weeklySchedules = [];
  }

  hourSpecification.weeklySchedules.push(weeklySchedule);
}

function getActivityCategoriesIds(activity) {
  return activity?.SmgTags?.map((tag) => tag?.replace(/-|\/|\s/g, "-"))
    ?.map((tag) => tag?.replace(/-+/g, "-"))
    ?.map((tag) => `odh:${_.deburr(tag)}`);
}

function processEventTopic(odhTopic) {
  const categoryResourceValue = new ResourceValue();

  categoryResourceValue.id = getTopicId(odhTopic);
  categoryResourceValue.odhId = getTopicOdhId(odhTopic);
  categoryResourceValue.dataProvider = getItemDataProvider();
  categoryResourceValue.type = getCategoriesType();

  ResourceValue.values.push(categoryResourceValue);

  const categoryValue = new CategoryValue();

  categoryValue.id = categoryResourceValue.id;
  categoryValue.namespace = getOdhCategoryNamespace();

  CategoryValue.values.push(categoryValue);

  for (const [lang, content] of Object.entries(
    getActivityTypeOrTopicName(odhTopic) ?? {}
  )) {
    const topicNameValue = new NameValue();

    topicNameValue.id = categoryResourceValue.id;
    topicNameValue.lang = lang;
    topicNameValue.content = content;

    NameValue.values.push(topicNameValue);
  }

  const coveredType = new CategoryCoveredTypesValue();

  coveredType.categoryId = categoryValue.id;
  coveredType.type = db.defaults.resourceTypes.events;

  CategoryCoveredTypesValue.values.push(coveredType);
}

function getTopicId(topic) {
  return `odh:${topic.Id}`;
}

function getTopicOdhId(topic) {
  return topic.Id;
}

function getOdhCategoryNamespace() {
  return `odh`;
}

function processEvent(item) {
  const eventResourceValue = new ResourceValue();

  eventResourceValue.id = getItemId(item);
  eventResourceValue.odhId = getItemId(item);
  eventResourceValue.createdAt = getItemCreationDate(item);
  eventResourceValue.lastUpdate = getItemLastUpdate(item);
  eventResourceValue.dataProvider = getItemDataProvider();
  eventResourceValue.type = getEventsType();

  ResourceValue.values.push(eventResourceValue);

  const eventValue = new EventValue();

  eventValue.id = eventResourceValue.id;
  eventValue.inPersonCapacity = getEventCapacity(item);
  eventValue.endDate = getEventEndDate(item);
  eventValue.publisherId = getEventPublisherId(item);
  eventValue.startDate = getEventStartDate(item);
  eventValue.status = getEventStatus(item);

  EventValue.values.push(eventValue);

  for (const [lang, content] of Object.entries(getItemName(item) ?? {})) {
    const eventNameValue = new NameValue();

    eventNameValue.id = eventValue.id;
    eventNameValue.lang = lang;
    eventNameValue.content = content;

    NameValue.values.push(eventNameValue);
  }

  for (const [lang, content] of Object.entries(
    getItemDescription(item) ?? {}
  )) {
    const eventDescriptionValue = new DescriptionValue();

    eventDescriptionValue.id = eventValue.id;
    eventDescriptionValue.lang = lang;
    eventDescriptionValue.content = content;

    DescriptionValue.values.push(eventDescriptionValue);
  }

  const publisherResourceValue = new ResourceValue();

  publisherResourceValue.id = eventValue.publisherId;
  publisherResourceValue.dataProvider = getItemDataProvider();
  publisherResourceValue.type = getAgentsType();

  ResourceValue.values.push(publisherResourceValue);

  const publisherAgentValue = new AgentValue();

  publisherAgentValue.id = publisherResourceValue.id;

  AgentValue.values.push(publisherAgentValue);

  for (const [lang, content] of Object.entries(
    getEventPublisherName(item) ?? {}
  )) {
    const publisherNameValue = new NameValue();

    publisherNameValue.id = publisherResourceValue.id;
    publisherNameValue.lang = lang;
    publisherNameValue.content = content;

    NameValue.values.push(publisherNameValue);
  }

  const organizerResourceValue = new ResourceValue();

  organizerResourceValue.id = getEventOrganizerId(item);
  organizerResourceValue.dataProvider = getItemDataProvider();
  organizerResourceValue.type = getAgentsType();

  if (organizerResourceValue.id)
    ResourceValue.values.push(organizerResourceValue);

  const organizerAgentValue = new AgentValue();

  organizerAgentValue.id = organizerResourceValue.id;

  if (organizerResourceValue.id) AgentValue.values.push(organizerAgentValue);

  const organizerRelationshipValue = new OrganizerValue();

  organizerRelationshipValue.eventId = eventValue.id;
  organizerRelationshipValue.organizerId = organizerResourceValue.id;

  if (organizerResourceValue.id)
    OrganizerValue.values.push(organizerRelationshipValue);

  for (const [lang, content] of Object.entries(
    getEventOrganizerName(item) ?? {}
  )) {
    const organizerNameValue = new NameValue();

    organizerNameValue.id = organizerResourceValue.id;
    organizerNameValue.lang = lang;
    organizerNameValue.content = content;

    NameValue.values.push(organizerNameValue);
  }

  const organizerContactPointValue = new ContactPointValue();

  organizerContactPointValue.id = idCounter++;
  organizerContactPointValue.addressId = organizerContactPointValue.id;
  organizerContactPointValue.agentId = organizerAgentValue.id;
  organizerContactPointValue.email = getEventOrganizerEmail(item);
  organizerContactPointValue.telephone = getEventOrganizerTelephone(item);

  if (organizerResourceValue.id)
    ContactPointValue.addValue(organizerContactPointValue);

  const organizerAddressValue = new AddressValue();

  organizerAddressValue.id = organizerContactPointValue.id;
  organizerAddressValue.country = getEventOrganizerCountryCode(item) ?? "IT";
  organizerAddressValue.zipcode = getEventOrganizerZipCode(item);

  if (organizerResourceValue.id)
    AddressValue.addContactAddressValue(organizerAddressValue);

  for (const [lang, content] of Object.entries(
    getEventOrganizerCity(item) ?? {}
  )) {
    const cityValue = new CityValue();

    cityValue.id = organizerAddressValue.id;
    cityValue.lang = lang;
    cityValue.content = content;

    CityValue.addValue(cityValue);
  }

  for (const [lang, content] of Object.entries(
    getEventOrganizerStreet(item) ?? {}
  )) {
    const streetValue = new StreetValue();

    streetValue.id = organizerAddressValue.id;
    streetValue.lang = lang;
    streetValue.content = content;

    StreetValue.addValue(streetValue);
  }

  const venueResourceValue = new ResourceValue();

  venueResourceValue.id = eventValue.id + "_venue";
  venueResourceValue.dataProvider = getItemDataProvider();
  venueResourceValue.type = getVenuesType();

  ResourceValue.values.push(venueResourceValue);

  const venueValue = new VenueValue();

  venueValue.id = venueResourceValue.id;

  VenueValue.values.push(venueValue);

  for (const [lang, content] of Object.entries(getEventVenueName(item) ?? {})) {
    const venueName = new NameValue();

    venueName.id = venueValue.id;
    venueName.lang = lang;
    venueName.content = content;

    NameValue.values.push(venueName);
  }

  const eventVenueValue = new EventVenueValue();

  eventVenueValue.eventId = eventValue.id;
  eventVenueValue.venueId = venueValue.id;

  EventVenueValue.values.push(eventVenueValue);

  const venueAddressValue = new AddressValue();

  venueAddressValue.id = idCounter++;
  venueAddressValue.country = getVenueCountryCode(item) ?? "IT";
  venueAddressValue.zipcode = getVenueZipCode(item);

  AddressValue.values.push(venueAddressValue);

  for (const [lang, content] of Object.entries(getVenueCity(item) ?? {})) {
    const cityValue = new CityValue();

    cityValue.id = venueAddressValue.id;
    cityValue.lang = lang;
    cityValue.content = content;

    CityValue.addValue(cityValue);
  }

  for (const [lang, content] of Object.entries(getVenueStreet(item) ?? {})) {
    const streetValue = new StreetValue();

    streetValue.id = venueAddressValue.id;
    streetValue.lang = lang;
    streetValue.content = content;

    StreetValue.addValue(streetValue);
  }

  const venuePlaceValue = new PlaceValue();

  venuePlaceValue.id = venueValue.id;
  venuePlaceValue.addressId = venueAddressValue.id;
  venuePlaceValue.geometries = getVenueGeometry(item);

  PlaceValue.values.push(venuePlaceValue);

  const eventCategory = new ResourceCategoryValue();

  eventCategory.resourceId = eventValue.id;
  eventCategory.categoryId = getEventCategory(item);

  if (eventCategory.categoryId)
    ResourceCategoryValue.values.push(eventCategory);

  const inPersonEventCategory = new ResourceCategoryValue();

  inPersonEventCategory.resourceId = eventValue.id;
  inPersonEventCategory.categoryId = getInPersonEventCategory(item);

  ResourceCategoryValue.values.push(inPersonEventCategory);
}

function generateQueries() {
  const data =
    `DELETE FROM ${schemas.contactPoints._name};` +
    `\nDELETE FROM ${schemas.addresses._name};` +
    `\nDELETE FROM ${schemas.categories._name} WHERE ${schemas.categories.id} NOT LIKE 'schema:%' AND ${schemas.categories.id} NOT LIKE 'alpinebits:%';` +
    `\nDELETE FROM ${schemas.resources._name}  WHERE ${schemas.categories.id} NOT LIKE 'schema:%' AND ${schemas.categories.id} NOT LIKE 'alpinebits:%';` +
    `\n\n${ResourceValue.getInsertQuery()}` +
    `\n\n${AgentValue.getInsertQuery()}` +
    `\n\n${CategoryValue.getInsertQuery()}` +
    `\n\n${EventValue.getInsertQuery()}` +
    `\n\n${LiftValue.getInsertQuery()}` +
    `\n\n${SkiSlopeValue.getInsertQuery()}` +
    `\n\n${SnowparkValue.getInsertQuery()}` +
    `\n\n${MountainAreaValue.getInsertQuery()}` +
    `\n\n${VenueValue.getInsertQuery()}` +
    `\n\n${NameValue.getInsertQuery()}` +
    `\n\n${DescriptionValue.getInsertQuery()}` +
    `\n\n${OrganizerValue.getInsertQuery()}` +
    `\n\n${EventVenueValue.getInsertQuery()}` +
    `\n\n${ResourceCategoryValue.getInsertQuery()}` +
    `\n\n${CategoryCoveredTypesValue.getInsertQuery()}` +
    `\n\n${AddressValue.getInsertQuery()}` +
    `\n\n${PlaceValue.getInsertQuery()}` +
    `\n\n${CityValue.getInsertQuery()}` +
    `\n\n${StreetValue.getInsertQuery()}` +
    `\n\n${UrlValue.getInsertQuery()}` +
    `\n\n${ContactPointValue.getInsertQuery()}`;

  const outputFilePath = "./output.pgsql";

  fs.writeFileSync(outputFilePath, data);
}

function getItemId(item) {
  const cleanId = item.Id?.replace(/[^a-zA-Z0-9\-_:.@:%._~#=*\+]/g, "");
  return cleanId;
}

function getAreaOwnerId(item) {
  return getItemId(item) + "_areaOwner";
}

function getItemDataProvider() {
  return "http://tourism.opendatahub.bz.it/";
}

function getItemCreationDate(item) {
  return item.FirstImport ?? item._Meta.LastUpdate ?? new Date().toISOString();
}

function getItemLastUpdate(item) {
  return item._Meta.LastUpdate ?? new Date().toISOString();
}

function getItemName(item) {
  const title = extractFieldFromMultilingualObject(item?.Detail, "Title");
  return sanitizeAndConvertLanguageTags(title);
}

function getItemShortName(item) {
  const title = extractFieldFromMultilingualObject(item?.Detail, "Header");
  return sanitizeAndConvertLanguageTags(title);
}

function getItemAbstract(item) {
  const baseText = extractFieldFromMultilingualObject(
    item?.Detail,
    "SubHeader"
  );
  return sanitizeAndConvertLanguageTags(baseText);
}

function getItemDescription(item) {
  const baseText = extractFieldFromMultilingualObject(item?.Detail, "BaseText");
  return sanitizeAndConvertLanguageTags(baseText);
}

function getAgentsType() {
  return db.defaults.resourceTypes.agents;
}

function getCategoriesType() {
  return db.defaults.resourceTypes.categories;
}

function getEventsType() {
  return db.defaults.resourceTypes.events;
}

function getActivityType(activity) {
  const tag = activity?.SmgTags?.find((tag) => !!odhTagMapping[tag]);
  return odhTagMapping[tag] || null;
}

function getVenuesType() {
  return db.defaults.resourceTypes.venues;
}

function getEventCapacity(event) {
  const maxPersons = event?.EventDate?.[0]?.MaxPersons;
  return maxPersons > 0 ? maxPersons : null;
}

function getEventEndDate(event) {
  return event?.DateEnd ? event?.DateEnd : null;
}

function getEventPublisherId(eventItem) {
  return eventItem.Source ? eventItem.Source : "odh";
}

function getEventPublisherName(eventItem) {
  const name = eventItem.OrgRID ? eventItem.OrgRID : "Open Data Hub";
  return { ita: name };
}

function getEventStartDate(event) {
  return event?.DateBegin ? event?.DateBegin : null;
}

function getEventStatus(event) {
  const status = db.defaults.eventStatus;
  return event?.EventDate?.[0]?.Cancelled ? status.canceled : status.published;
}

function getEventOrganizerId(event) {
  return event.Source && event.OrgRID ? event.Source : null;
}

function getEventOrganizerName(item) {
  const companyName = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "CompanyName"
  );
  return sanitizeAndConvertLanguageTags(companyName);
}

function getEventOrganizerUrl(item) {
  const url = extractFieldFromMultilingualObject(item?.OrganizerInfos, "Url");
  return sanitizeAndConvertLanguageTags(url);
}

function getEventOrganizerCity(item) {
  const city = extractFieldFromMultilingualObject(item?.OrganizerInfos, "City");
  return sanitizeAndConvertLanguageTags(city);
}

function getEventOrganizerEmail(item) {
  let email = extractFieldFromMultilingualObject(item?.OrganizerInfos, "Email");
  email = sanitizeAndConvertLanguageTags(email);
  return !_.isEmpty(email) ? _.first(Object.values(email)) : null;
}

function getEventOrganizerStreet(item) {
  const address = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "Address"
  );
  return sanitizeAndConvertLanguageTags(address);
}

function getEventOrganizerCountryCode(item) {
  let countryCode = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "CountryCode"
  );
  countryCode = sanitizeAndConvertLanguageTags(countryCode);
  return !_.isEmpty(countryCode) ? _.first(Object.values(countryCode)) : null;
}

function getEventOrganizerZipCode(item) {
  let zipCode = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "ZipCode"
  );
  zipCode = sanitizeAndConvertLanguageTags(zipCode);
  return !_.isEmpty(zipCode) ? _.first(Object.values(zipCode)) : null;
}

function getEventOrganizerTelephone(item) {
  let phoneNumber = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "Phonenumber"
  );
  phoneNumber = sanitizeAndConvertLanguageTags(phoneNumber);
  return !_.isEmpty(phoneNumber) ? _.first(Object.values(phoneNumber)) : null;
}

function getEventOrganizerName(item) {
  const companyName = extractFieldFromMultilingualObject(
    item?.OrganizerInfos,
    "CompanyName"
  );
  return sanitizeAndConvertLanguageTags(companyName);
}

function getAreaOwnerUrl(item) {
  const url = extractFieldFromMultilingualObject(item?.ContactInfos, "Url");
  return sanitizeAndConvertLanguageTags(url);
}

function getAreaOwnerCity(item) {
  const city = extractFieldFromMultilingualObject(item?.ContactInfos, "City");
  return sanitizeAndConvertLanguageTags(city);
}

function getAreaOwnerEmail(item) {
  let email = extractFieldFromMultilingualObject(item?.ContactInfos, "Email");
  email = sanitizeAndConvertLanguageTags(email);
  return !_.isEmpty(email) ? _.first(Object.values(email)) : null;
}

function getAreaOwnerStreet(item) {
  const address = extractFieldFromMultilingualObject(
    item?.ContactInfos,
    "Address"
  );
  return sanitizeAndConvertLanguageTags(address);
}

function getAreaOwnerCountryCode(item) {
  let countryCode = extractFieldFromMultilingualObject(
    item?.ContactInfos,
    "CountryCode"
  );
  countryCode = sanitizeAndConvertLanguageTags(countryCode);
  return !_.isEmpty(countryCode) ? _.first(Object.values(countryCode)) : null;
}

function getAreaOwnerZipCode(item) {
  let zipCode = extractFieldFromMultilingualObject(
    item?.ContactInfos,
    "ZipCode"
  );
  zipCode = sanitizeAndConvertLanguageTags(zipCode);
  return !_.isEmpty(zipCode) ? _.first(Object.values(zipCode)) : null;
}

function getAreaOwnerTelephone(item) {
  let phoneNumber = extractFieldFromMultilingualObject(
    item?.ContactInfos,
    "Phonenumber"
  );
  phoneNumber = sanitizeAndConvertLanguageTags(phoneNumber);
  return !_.isEmpty(phoneNumber) ? _.first(Object.values(phoneNumber)) : null;
}

function getEventVenueName(event) {
  let venueName = extractFieldFromMultilingualObject(
    event?.EventAdditionalInfos,
    "Location"
  );

  if (_.isEmpty(venueName)) venueName = { eng: "Unnamed Venue" };

  return sanitizeAndConvertLanguageTags(venueName);
}

function getVenueGeometry(event) {
  return {
    type: "Point",
    coordinates: [event.Longitude, event.Latitude],
  };
}

function getVenueCountryCode(event) {
  let countryCode = extractFieldFromMultilingualObject(
    event?.ContactInfos,
    "CountryCode"
  );
  countryCode = sanitizeAndConvertLanguageTags(countryCode);
  return !_.isEmpty(countryCode) ? _.first(Object.values(countryCode)) : null;
}

function getVenueZipCode(event) {
  let zipCode = extractFieldFromMultilingualObject(
    event?.ContactInfos,
    "ZipCode"
  );
  zipCode = sanitizeAndConvertLanguageTags(zipCode);
  return !_.isEmpty(zipCode) ? _.first(Object.values(zipCode)) : null;
}

function getVenueCity(event) {
  const city = extractFieldFromMultilingualObject(event?.ContactInfos, "City");
  return sanitizeAndConvertLanguageTags(city);
}

function getVenueStreet(event) {
  const address = extractFieldFromMultilingualObject(
    event?.ContactInfos,
    "Address"
  );
  return sanitizeAndConvertLanguageTags(address);
}

function getEventCategory(event) {
  const topicRID = event?.Topics?.[0]?.TopicRID;
  return topicRID ? `odh:${topicRID}` : null;
}

function getInPersonEventCategory() {
  return "alpinebits:inPersonEvent";
}

function extractFieldFromMultilingualObject(object, fieldName) {
  if (_.isEmpty(object)) {
    return null;
  }

  const content = {};

  for (const lang in object) {
    const field = object[lang][fieldName];

    if (field) {
      content[lang] = field;
    }
  }

  return content;
}

function sanitizeAndConvertLanguageTags(multilingualObject) {
  if (_.isEmpty(multilingualObject)) {
    return null;
  }

  const output = {};

  for (const twoLetterLang in multilingualObject) {
    const threeLetterLang = mappings.iso6391to6393[twoLetterLang];

    if (threeLetterLang) {
      output[threeLetterLang] = sanitizeHtml(
        multilingualObject[twoLetterLang],
        htmlSanitizeOpts
      );

      if (typeof output[threeLetterLang] === "string") {
        output[threeLetterLang] = output[threeLetterLang].replace(
          /&amp;/g,
          "&"
        );
      }
    }
  }

  return _.isEmpty(output) ? null : output;
}
