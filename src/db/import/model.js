const _ = require("lodash");

const db = require("..");

function getInsertQuery(tableName, columnNames, values, conflictColumns) {
  if (_.isEmpty(values)) return "";

  let query =
    `INSERT INTO ${tableName}` + `\n\t(${columnNames.join(", ")})` + `\nVALUES`;

  const length = values.length;

  for (const [index, value] of values.entries()) {
    query += `\n\t${value}`;

    if (index < length - 1) query += ",";
    else if (!conflictColumns) query += ";";
  }

  if (conflictColumns) {
    query += `\nON CONFLICT (${conflictColumns.join(", ")}) DO NOTHING;`;
  }

  return query;
}

function getDeleteQuery(tableName) {
  return `DELETE FROM ${tableName};`;
}

function toBracketsStringOrNull(value) {
  const replaceWithNull = (x) => !x || typeof x !== "string";
  const hasSurroundingBrackets = (x) =>
    typeof x === "string" && x.startsWith("'") && x.endsWith("'");
  const containsSimpleBrackets = (x) =>
    typeof x === "string" && x.includes("'");
  const replaceSimpleBrackets = (x) => x.replace(/'/g, "''");

  if (_.isObject(value)) value = JSON.stringify(value);

  if (replaceWithNull(value)) return "NULL";
  if (hasSurroundingBrackets(value)) return value;
  return containsSimpleBrackets(value)
    ? `'${replaceSimpleBrackets(value)}'`
    : `'${value}'`;
}

class ResourceValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.resources;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.odhId,
      schema.type,
      schema.dataProvider,
      schema.createdAt,
      schema.lastUpdate,
      schema.simpleUrl,
    ];
    const conflictColumns = [schema.id];
    const values = ResourceValue.values.map((res) => res.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.resources._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.odhId = null;
    this.type = null;
    this.dataProvider = null;
    this.createdAt = new Date().toISOString();
    this.lastUpdate = new Date().toISOString();
    this.simpleUrl = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${toBracketsStringOrNull(this.odhId)}` +
      `, ${toBracketsStringOrNull(this.type)}` +
      `, ${toBracketsStringOrNull(this.dataProvider)}` +
      `, ${toBracketsStringOrNull(this.createdAt)}` +
      `, ${toBracketsStringOrNull(this.lastUpdate)}` +
      `, ${toBracketsStringOrNull(this.simpleUrl)})`
    );
  }
}

class AgentValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.agents;
    const tableName = schema._name;
    const columnNames = [schema.id];
    const conflictColumns = [schema.id];
    const values = AgentValue.values.map((agent) => agent.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.agents._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
  }

  toValue() {
    return `(${toBracketsStringOrNull(this.id)})`;
  }
}

class CategoryValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.categories;
    const tableName = schema._name;
    const columnNames = [schema.id, schema.namespace];
    const conflictColumns = [schema.id];
    const values = CategoryValue.values.map((category) => category.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.categories._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.namespace = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${toBracketsStringOrNull(this.namespace)})`
    );
  }
}

class EventValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.events;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.inPersonCapacity,
      schema.endDate,
      schema.publisherId,
      schema.startDate,
      schema.status,
    ];
    const conflictColumns = [schema.id];
    const values = EventValue.values.map((event) => event.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.events._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.inPersonCapacity = null;
    this.endDate = null;
    this.publisherId = null;
    this.startDate = null;
    this.status = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${this.inPersonCapacity ? this.inPersonCapacity : `NULL`}` +
      `, ${toBracketsStringOrNull(this.endDate)}` +
      `, ${toBracketsStringOrNull(this.publisherId)}` +
      `, ${toBracketsStringOrNull(this.startDate)}` +
      `, ${toBracketsStringOrNull(this.status)})`
    );
  }
}

class MountainAreaValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.mountainAreas;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.area,
      schema.areaOwnerId,
      schema.totalParkArea,
      schema.totalSlopeLength,
    ];
    const conflictColumns = [schema.id];
    const values = MountainAreaValue.values.map((mountainAreas) =>
      mountainAreas.toValue()
    );

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.mountainAreas._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.area = null;
    this.areaOwnerId = null;
    this.totalParkArea = null;
    this.totalSlopeLength = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${this.area ? this.area : `NULL`}` +
      `, ${toBracketsStringOrNull(this.areaOwnerId)}` +
      `, ${this.totalParkArea ? this.totalParkArea : `NULL`}` +
      `, ${this.totalSlopeLength ? this.totalSlopeLength : `NULL`})`
    );
  }
}

class LiftValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.lifts;
    const tableName = schema._name;
    const columnNames = [schema.id, schema.capacity, schema.personsPerChair];
    const conflictColumns = [schema.id];
    const values = LiftValue.values.map((lift) => lift.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.lifts._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.capacity = null;
    this.personsPerChair = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${this.capacity ? this.capacity : `NULL`}` +
      `, ${this.personsPerChair ? this.personsPerChair : `NULL`})`
    );
  }
}

class SkiSlopeValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.skiSlopes;
    const tableName = schema._name;
    const columnNames = [schema.id, schema.difficultyEu, schema.difficultyUs];
    const conflictColumns = [schema.id];
    const values = SkiSlopeValue.values.map((skiSlope) => skiSlope.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.skiSlopes._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.difficultyEu = null;
    this.difficultyUs = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${toBracketsStringOrNull(this.difficultyEu)}` +
      `, ${toBracketsStringOrNull(this.difficultyUs)})`
    );
  }
}

class SnowparkValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.snowparks;
    const tableName = schema._name;
    const columnNames = [schema.id, schema.difficulty];
    const conflictColumns = [schema.id];
    const values = SnowparkValue.values.map((snowpark) => snowpark.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.snowparks._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.difficulty = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${toBracketsStringOrNull(this.difficultyUs)})`
    );
  }
}

class VenueValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.venues;
    const tableName = schema._name;
    const columnNames = [schema.id];
    const conflictColumns = [schema.id];
    const values = VenueValue.values.map((venue) => venue.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.venues._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
  }

  toValue() {
    return `(${toBracketsStringOrNull(this.id)})`;
  }
}

class PlaceValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.places;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.addressId,
      schema.geometries,
      schema.length,
      schema.maxAltitude,
      schema.minAltitude,
      schema.openingHours,
    ];
    const conflictColumns = [schema.id];
    const values = PlaceValue.values.map((place) => place.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.venues._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.addressId = null;
    this.geometries = null;
    this.length = null;
    this.maxAltitude = null;
    this.minAltitude = null;
    this.openingHours = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${this.addressId ? this.addressId : `NULL`}` +
      `, ${toBracketsStringOrNull(this.geometries)}` +
      `, ${this.length ? this.length : `NULL`}` +
      `, ${this.maxAltitude ? this.maxAltitude : `NULL`}` +
      `, ${this.minAltitude ? this.minAltitude : `NULL`}` +
      `, ${toBracketsStringOrNull(this.openingHours)})`
    );
  }
}

class TextValue {
  constructor() {
    this.id = null;
    this.lang = null;
    this.content = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.id)}` +
      `, ${toBracketsStringOrNull(this.lang)}` +
      `, ${toBracketsStringOrNull(this.content)})`
    );
  }
}

class NameValue extends TextValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.names;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.lang, schema.content];
    const conflictColumns = [schema.resourceId, schema.lang];
    const values = NameValue.values.map((name) => name.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.names._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }
}

class DescriptionValue extends TextValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.descriptions;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.lang, schema.content];
    const conflictColumns = [schema.resourceId, schema.lang];
    const values = DescriptionValue.values.map((desc) => desc.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.descriptions._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }
}

class AbstractValue extends TextValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.abstracts;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.lang, schema.content];
    const conflictColumns = [schema.resourceId, schema.lang];
    const values = AbstractValue.values.map((abs) => abs.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.abstracts._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }
}

class ShortNameValue extends TextValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.shortNames;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.lang, schema.content];
    const conflictColumns = [schema.resourceId, schema.lang];
    const values = ShortNameValue.values.map((shortName) =>
      shortName.toValue()
    );

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.shortNames._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }
}

class UrlValue extends TextValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.urls;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.lang, schema.content];
    const conflictColumns = [schema.resourceId, schema.lang];
    const values = UrlValue.values.map((url) => url.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.urls._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }
}

class ContactPointValue {
  static values = [];

  static addValue(value) {
    const containsAgentContact = (contactA) =>
      ContactPointValue.values.find(
        (contactB) => contactB?.agentId === contactA?.agentId
      );

    if (!containsAgentContact(value)) ContactPointValue.values.push(value);
  }

  static getInsertQuery() {
    const schema = db.schemas.contactPoints;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.addressId,
      schema.agentId,
      schema.availableHours,
      schema.email,
      schema.telephone,
    ];
    const conflictColumns = [schema.id];
    const values = ContactPointValue.values.map((cp) => cp.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.contactPoints._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.addressId = null;
    this.agentId = null;
    this.availableHours = null;
    this.email = null;
    this.telephone = null;
  }

  toValue() {
    return (
      `(${this.id ? this.id : "NULL"}` +
      `, ${this.addressId ? this.addressId : "NULL"}` +
      `, ${toBracketsStringOrNull(this.agentId)}` +
      `, ${toBracketsStringOrNull(this.availableHours)}` +
      `, ${toBracketsStringOrNull(this.email)}` +
      `, ${toBracketsStringOrNull(this.telephone)})`
    );
  }
}

class AddressValue {
  static values = [];

  static addContactAddressValue(value) {
    const containsContactAddress = (address) =>
      ContactPointValue.values.find(
        (contact) => contact?.addressId === address?.id
      );

    if (containsContactAddress(value)) AddressValue.values.push(value);
  }

  static getInsertQuery() {
    const schema = db.schemas.addresses;
    const tableName = schema._name;
    const columnNames = [
      schema.id,
      schema.country,
      schema.type,
      schema.zipcode,
    ];
    const conflictColumns = [schema.id];
    const values = AddressValue.values.map((cp) => cp.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.addresses._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.id = null;
    this.country = null;
    this.type = null;
    this.zipcode = null;
  }

  toValue() {
    return (
      `(${this.id ? this.id : "NULL"}` +
      `, ${toBracketsStringOrNull(this.country)}` +
      `, ${toBracketsStringOrNull(this.type)}` +
      `, ${toBracketsStringOrNull(this.zipcode)})`
    );
  }
}

class CityValue extends TextValue {
  static values = [];

  static addValue(value) {
    const existingAddress = (city) =>
      AddressValue.values.find((address) => address.id === city.id);

    if (existingAddress(value)) CityValue.values.push(value);
  }

  static getInsertQuery() {
    const schema = db.schemas.cities;
    const tableName = schema._name;
    const columnNames = [schema.addressId, schema.lang, schema.content];
    const conflictColumns = [schema.addressId, schema.lang];
    const values = CityValue.values.map((desc) => desc.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.cities._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }

  toValue() {
    return (
      `(${this.id ? this.id : "'NULL"}` +
      `, ${toBracketsStringOrNull(this.lang)}` +
      `, ${toBracketsStringOrNull(this.content)})`
    );
  }
}

class StreetValue extends TextValue {
  static values = [];

  static addValue(value) {
    const existingAddress = (street) =>
      AddressValue.values.find((address) => address.id === street.id);

    if (existingAddress(value)) StreetValue.values.push(value);
  }

  static getInsertQuery() {
    const schema = db.schemas.streets;
    const tableName = schema._name;
    const columnNames = [schema.addressId, schema.lang, schema.content];
    const conflictColumns = [schema.addressId, schema.lang];
    const values = StreetValue.values.map((desc) => desc.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.streets._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    super();
  }

  toValue() {
    return (
      `(${this.id ? this.id : "'NULL"}` +
      `, ${toBracketsStringOrNull(this.lang)}` +
      `, ${toBracketsStringOrNull(this.content)})`
    );
  }
}

class ResourceCategoryValue {
  static values = [];

  static addValue(value) {
    const isStandardCategory = (rcvalue) =>
      rcvalue.categoryId.includes("schema:") ||
      rcvalue.categoryId.includes("alpinebits:");
    const containsCategory = (rcvalue) =>
      CategoryValue.values.find((cvalue) => cvalue.id === rcvalue?.categoryId);

    if (isStandardCategory(value) || containsCategory(value))
      ResourceCategoryValue.values.push(value);
  }

  static getInsertQuery() {
    const schema = db.schemas.resourceCategories;
    const tableName = schema._name;
    const columnNames = [schema.resourceId, schema.categoryId];
    const conflictColumns = [schema.resourceId, schema.categoryId];
    const values = ResourceCategoryValue.values.map((rel) => rel.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.resourceCategories._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.resourceId = null;
    this.categoryId = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.resourceId)}` +
      `, ${toBracketsStringOrNull(this.categoryId)})`
    );
  }
}

class CategoryCoveredTypesValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.categoryCoveredTypes;
    const tableName = schema._name;
    const columnNames = [schema.type, schema.categoryId];
    const conflictColumns = [schema.type, schema.categoryId];
    const values = CategoryCoveredTypesValue.values.map((rel) => rel.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.categoryCoveredTypes._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.type = null;
    this.categoryId = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.type)}` +
      `, ${toBracketsStringOrNull(this.categoryId)})`
    );
  }
}

class OrganizerValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.organizers;
    const tableName = schema._name;
    const columnNames = [schema.eventId, schema.organizerId];
    const conflictColumns = [schema.eventId, schema.organizerId];
    const values = OrganizerValue.values.map((rel) => rel.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.organizers._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.eventId = null;
    this.organizerId = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.eventId)}` +
      `, ${toBracketsStringOrNull(this.organizerId)})`
    );
  }
}

class EventVenueValue {
  static values = [];

  static getInsertQuery() {
    const schema = db.schemas.eventVenues;
    const tableName = schema._name;
    const columnNames = [schema.eventId, schema.venueId];
    const conflictColumns = [schema.eventId, schema.venueId];
    const values = EventVenueValue.values.map((rel) => rel.toValue());

    return getInsertQuery(tableName, columnNames, values, conflictColumns);
  }

  static getDeleteQuery() {
    const tableName = db.schemas.eventVenues._name;
    return getDeleteQuery(tableName);
  }

  constructor() {
    this.eventId = null;
    this.venueId = null;
  }

  toValue() {
    return (
      `(${toBracketsStringOrNull(this.eventId)}` +
      `, ${toBracketsStringOrNull(this.venueId)})`
    );
  }
}

module.exports = {
  ResourceValue,
  AgentValue,
  CategoryValue,
  EventValue,
  LiftValue,
  SkiSlopeValue,
  SnowparkValue,
  MountainAreaValue,
  VenueValue,
  TextValue,
  NameValue,
  DescriptionValue,
  AbstractValue,
  ShortNameValue,
  UrlValue,
  ContactPointValue,
  AddressValue,
  CityValue,
  StreetValue,
  OrganizerValue,
  EventVenueValue,
  PlaceValue,
  ResourceCategoryValue,
  CategoryCoveredTypesValue,
};
