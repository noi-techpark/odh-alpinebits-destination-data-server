// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Area: OdhArea } = require("../odh/area");
const { MountainArea: DestinationDataMountainArea } = require("../destinationdata/mountain_area");
const { Agent } = require("../destinationdata/agents");
const datatypes = require("./../destinationdata/datatypes");
const utils = require("./utils");
const categoriesData = require("./../../../data/categories.data");
const _ = require("lodash");
const { transformMultimediaDescriptions } = require("./image_transform");
const { transformToLift, transformToSkiSlope, transformToSnowpark } = require("./activity_transform");

function transformToMountainArea(odhItem, request) {
  const odhArea = new OdhArea(odhItem);
  const mountainArea = new DestinationDataMountainArea();

  mountainArea.id = odhArea.Id;

  mountainArea.meta = utils.transformMeta(odhArea);
  mountainArea.links = utils.transformResourceLinks(request, mountainArea.type, mountainArea.id);

  mountainArea.attributes.abstract = utils.transformAbstract(odhArea);
  mountainArea.attributes.description = utils.transformDescription(odhArea);
  mountainArea.attributes.name = utils.transformName(odhArea);
  mountainArea.attributes.shortName = utils.transformShortName(odhArea);
  mountainArea.attributes.url = utils.transformUrl(odhArea);

  mountainArea.attributes.area;
  mountainArea.attributes.geometries = transformGeometriesAttribute(odhArea);
  mountainArea.attributes.howToArrive = utils.transformHowToArrive(odhArea);
  mountainArea.attributes.maxAltitude = transformMaxAltitudeAttribute(odhArea);
  mountainArea.attributes.minAltitude = transformMinAltitudeAttribute(odhArea);
  mountainArea.attributes.openingHours = utils.transformOpeningHours(odhArea);
  mountainArea.attributes.totalSlopeLength = transformTotalSlopeLengthAttribute(odhArea);

  mountainArea.relationships.areaOwner = transformAreaOwner(odhArea, mountainArea, request);
  mountainArea.relationships.multimediaDescriptions = transformMultimediaDescriptions(mountainArea, odhArea, request);

  mountainArea.relationships.lifts = transformLifts(odhArea, request);
  mountainArea.relationships.snowparks = transformSnowparks(odhArea, request);
  mountainArea.relationships.skiSlopes = transformSkiSlopes(odhArea, request);

  // TODO: review possibilities regarding regarding categories
  // mountainArea.relationships.categories - No available data
  // mountainArea.attributes.snowCondition - No available data
  // mountainArea.attributes.totalParkLength - No available data
  // mountainArea.relationships.subAreas - No available data
  // mountainArea.relationships.connections - No available data

  return mountainArea;
}

function transformMinAltitudeAttribute(odhArea) {
  return odhArea.AltitudeFrom || null;
}

function transformMaxAltitudeAttribute(odhArea) {
  return odhArea.AltitudeTo || null;
}

function transformTotalSlopeLengthAttribute(odhArea) {
  return parseInt(odhArea.TotalSlopeKm) || null;
}

function transformGeometriesAttribute(odhArea) {
  const geometries = [];

  if (odhArea.Longitude && odhArea.Latitude) {
    const point = datatypes.createPoint(odhArea.Longitude, odhArea.Latitude, odhArea.Altitude);
    geometries.push(point);
  }

  if (odhArea.GpsPolygon) {
    const polygon = datatypes.createPolygon();
    const outerRing = [];

    odhArea.GpsPolygon.forEach((point) => outerRing.push([point.Latitude, point.Longitude]));
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

function transformAreaOwner(odhArea, mountainArea, request) {
  const areaOwner = new Agent();

  areaOwner.id = mountainArea.id + "_areaOwner";
  areaOwner.meta = Object.assign({}, mountainArea.meta);
  areaOwner.links = utils.transformResourceLinks(request, areaOwner.type, areaOwner.id);

  areaOwner.attributes.name = utils.transformContactName(odhArea);
  areaOwner.attributes.url = utils.transformUrl(odhArea);

  areaOwner.attributes.contactPoints = transformAreaOwnerContactPoints(odhArea);

  areaOwner.relationships.categories = transformCategories(odhArea);

  // TODO: check the possibility of using 'LogoUrl' to create owner's multimedia descriptions
  // areaOwner.attributes.abstract - No data available
  // areaOwner.attributes.description - No data available
  // areaOwner.attributes.shortName - No data available
  // areaOwner.relationships.multimediaDescriptions - No data available

  return areaOwner;
}

function transformAreaOwnerContactPoints(odhArea) {
  const address = datatypes.createAddress();
  const email = utils.transformContactEmail(odhArea);
  const telephone = utils.transformContactTelephone(odhArea);

  address.street = utils.transformContactStreet(odhArea);
  address.city = utils.transformContactCity(odhArea);
  address.country = utils.transformContactCountry(odhArea);
  address.zipcode = utils.transformContactZipCode(odhArea);

  const organizerContactPoint = datatypes.createContactPoints(address, null, email, telephone);

  return [organizerContactPoint];
}

function transformCategories(odhArea) {
  const categories = [];

  if (utils.isContactOrganization(odhArea)) {
    const category = categoriesData.categoriesMap["alpinebits:organization"];
    categories.push(category);
  } else if (utils.isContactPerson(odhArea)) {
    const category = categoriesData.categoriesMap["alpinebits:person"];
    categories.push(category);
  }

  return !_.isEmpty(categories) ? categories : null;
}

function transformLifts(odhArea, request) {
  const { lifts } = odhArea.subResources;

  if (_.isEmpty(lifts)) {
    return null;
  }

  return lifts.map((lift) => transformToLift(lift, request));
}

function transformSnowparks(odhArea, request) {
  const { snowparks } = odhArea.subResources;

  if (_.isEmpty(snowparks)) {
    return null;
  }

  return snowparks.map((snowpark) => transformToSnowpark(snowpark, request));
}

function transformSkiSlopes(odhArea, request) {
  const { skiSlopes } = odhArea.subResources;

  if (_.isEmpty(skiSlopes)) {
    return null;
  }

  return skiSlopes.map((skiSlope) => transformToSkiSlope(skiSlope, request));
}

module.exports = {
  transformToMountainArea,
};
