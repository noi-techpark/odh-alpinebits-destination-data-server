const { Activity } = require('../odh/activity');
const { Lift } = require('../destinationdata/lift');
const utils = require('./utils');
const { transformMultimediaDescriptions } = require('./media_object_transform');
const _ = require('lodash');

function transformLift(odhItem, request) {
    const activity =  new Activity(odhItem);
    const lift = new Lift();

    lift.id = activity.Id;

    lift.meta = utils.transformMeta(activity);
    lift.links = utils.transformResourceLinks(request, lift.type, lift.id);
    
    lift.attributes.abstract = utils.transformAbstract(activity);
    lift.attributes.description = utils.transformDescription(activity);
    lift.attributes.name = utils.transformName(activity);
    lift.attributes.shortName = utils.transformShortName(activity);
    lift.attributes.url = utils.transformUrl(activity);

    lift.attributes.address = utils.transformAddress(activity);
    lift.attributes.geometries = utils.transformGeometries(activity);
    lift.attributes.howToArrive = utils.transformHowToArrive(activity);
    lift.attributes.length = utils.transformLength(activity);
    lift.attributes.openingHours = utils.transformOpeningHours(activity);
    
    lift.relationships.multimediaDescriptions = transformMultimediaDescriptions(lift, activity, request);
    // lift.relationships.categories = transformMultimediaDescriptions(lift, activity, request);

    // lift.attributes.capacity - No available data
    // lift.attributes.maxAltitude - No available data
    // lift.attributes.minAltitude - No available data
    // lift.attributes.personsPerChair - No available data
    // TODO: review idea of extracting maxAltitude and minAltitude from the coordinates' altitude; for this case with 'LineString' geometries this might work

    // lift.relationships.connections - No available data
    
    return lift;
}

module.exports = {
    transformLift
}