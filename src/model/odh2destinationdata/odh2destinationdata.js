const { Image } = require('../odh/image');
const { Activity } = require('../odh/activity');
const { Agent } = require('../destinationdata/agents');
const { Lift } = require('../destinationdata/lift');
const { MediaObject } = require('../destinationdata/media_object');
const utils = require('./utils');
const _ = require('lodash');

function getLiftsCollection(odhResponse) {
    throw new Error('Not implemented');
}

module.exports = {
    getLiftsCollection
}