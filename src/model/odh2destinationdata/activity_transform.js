// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Activity } = require("../odh/activity");
const { Lift } = require("../destinationdata/lift");
const { SkiSlope } = require("../destinationdata/ski_slope");
const { Snowpark } = require("../destinationdata/snowpark");
const utils = require("./utils");
const categoriesData = require("./../../../data/categories.data");
const _ = require("lodash");
const { transformMultimediaDescriptions } = require("./image_transform");

function transformToLift(odhItem, request) {
  const activity = new Activity(odhItem);
  const lift = new Lift();

  lift.id = activity.Id;

  lift.meta = utils.transformMeta(activity);
  lift.links = utils.transformResourceLinks(request, lift.type, lift.id);

  lift.attributes.abstract = utils.transformAbstract(activity);
  lift.attributes.address = utils.transformAddress(activity);
  lift.attributes.description = utils.transformDescription(activity);
  lift.attributes.geometries = utils.transformGeometries(activity);
  lift.attributes.howToArrive = utils.transformHowToArrive(activity);
  lift.attributes.length = utils.transformLength(activity);
  lift.attributes.maxAltitude = utils.transformMinAltitude(activity);
  lift.attributes.minAltitude = utils.transformMaxAltitude(activity);
  lift.attributes.name = utils.transformName(activity);
  lift.attributes.openingHours = utils.transformOpeningHours(activity);
  lift.attributes.shortName = utils.transformShortName(activity);
  lift.attributes.url = utils.transformUrl(activity);

  // TODO: update categories relationship
  lift.relationships.categories = transformCategories(activity);
  lift.relationships.multimediaDescriptions = transformMultimediaDescriptions(lift, activity, request);

  // lift.attributes.capacity - No available data
  // lift.attributes.personsPerChair - No available data
  // TODO: review idea of extracting maxAltitude and minAltitude from the coordinates' altitude; for this case with 'LineString' geometries this might work

  // lift.relationships.connections - No available data

  return lift;
}

function transformToSkiSlope(odhItem, request) {
  const activity = new Activity(odhItem);
  const skiSlope = new SkiSlope();

  skiSlope.id = activity.Id;

  skiSlope.meta = utils.transformMeta(activity);
  skiSlope.links = utils.transformResourceLinks(request, skiSlope.type, skiSlope.id);

  skiSlope.attributes.abstract = utils.transformAbstract(activity);
  skiSlope.attributes.address = utils.transformAddress(activity);
  skiSlope.attributes.description = utils.transformDescription(activity);
  skiSlope.attributes.difficulty = utils.transformSkiSlopeDifficulty(activity);
  skiSlope.attributes.geometries = utils.transformGeometries(activity);
  skiSlope.attributes.howToArrive = utils.transformHowToArrive(activity);
  skiSlope.attributes.length = utils.transformLength(activity);
  skiSlope.attributes.maxAltitude = utils.transformMinAltitude(activity);
  skiSlope.attributes.minAltitude = utils.transformMaxAltitude(activity);
  skiSlope.attributes.name = utils.transformName(activity);
  skiSlope.attributes.openingHours = utils.transformOpeningHours(activity);
  skiSlope.attributes.shortName = utils.transformShortName(activity);
  skiSlope.attributes.url = utils.transformUrl(activity);

  // TODO: update categories relationship
  skiSlope.relationships.categories = transformCategories(activity);
  skiSlope.relationships.multimediaDescriptions = transformMultimediaDescriptions(skiSlope, activity, request);

  // skiSlope.attributes.snowCondition - No available data
  // skiSlope.relationships.connections - No available data

  return skiSlope;
}

function transformToSnowpark(odhItem, request) {
  const activity = new Activity(odhItem);
  const snowpark = new Snowpark();

  snowpark.id = activity.Id;

  snowpark.meta = utils.transformMeta(activity);
  snowpark.links = utils.transformResourceLinks(request, snowpark.type, snowpark.id);

  snowpark.attributes.abstract = utils.transformAbstract(activity);
  snowpark.attributes.address = utils.transformAddress(activity);
  snowpark.attributes.description = utils.transformDescription(activity);
  snowpark.attributes.difficulty = utils.transformSnowparkDifficulty(activity);
  snowpark.attributes.geometries = utils.transformGeometries(activity);
  snowpark.attributes.howToArrive = utils.transformHowToArrive(activity);
  snowpark.attributes.length = utils.transformLength(activity);
  snowpark.attributes.maxAltitude = utils.transformMinAltitude(activity);
  snowpark.attributes.minAltitude = utils.transformMaxAltitude(activity);
  snowpark.attributes.name = utils.transformName(activity);
  snowpark.attributes.openingHours = utils.transformOpeningHours(activity);
  snowpark.attributes.shortName = utils.transformShortName(activity);
  snowpark.attributes.url = utils.transformUrl(activity);

  // TODO: update categories relationship
  snowpark.relationships.categories = transformCategories(activity);
  snowpark.relationships.multimediaDescriptions = transformMultimediaDescriptions(snowpark, activity, request);

  // snowpark.attributes.snowCondition - No available data
  // snowpark.relationships.connections - No available data

  return snowpark;
}

function transformCategories(odhActivity) {
  const { ODHTags } = odhActivity;

  if (!Array.isArray(ODHTags)) {
    return null;
  }

  const categories = [];

  ODHTags.forEach((tag) => {
    const category = categoriesData.categoriesMap[tag.Id];
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

module.exports = {
  transformToLift,
  transformToSkiSlope,
  transformToSnowpark,
};
