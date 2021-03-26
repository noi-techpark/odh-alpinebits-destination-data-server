const { Activity } = require('../odh/activity');
const { Lift } = require('../destinationdata/lift');
const utils = require('./utils');

module.exports.getLiftsCollection = function getLiftsCollection(odhResponse) {
    throw new Error('Not implemented');
}

module.exports.transformLift = function transformLift(item, request) {
    const activity =  new Activity(item);
    const lift = new Lift();

    lift.id = activity.Id;

    lift.meta = utils.transformMeta(activity);
    lift.links = utils.transformResourceLinks(request, lift.type, lift.id);
    
    lift.attributes.abstract = utils.transformAbstract(activity);
    lift.attributes.description = utils.transformDescription(activity);
    lift.attributes.name = utils.transformName(activity);
    lift.attributes.shortName = utils.transformShortName(activity);
    lift.attributes.url = utils.transformUrl(activity);

    lift.attributes.geometries = utils.transformGeometries(activity);
    lift.attributes.howToArrive = utils.transformHowToArrive(activity);
    lift.attributes.length = utils.transformLength(activity);

    return lift;
}

