const { Image } = require('../odh/image');
const { Agent } = require('../destinationdata/agents');
const { MediaObject } = require('../destinationdata/media_object');
const utils = require('./utils');
const _ = require('lodash');

function transformMultimediaDescriptions(resource, item, request) {
    const { ImageGallery } = item;

    if(!Array.isArray(ImageGallery) || _.isEmpty(ImageGallery)) {
        return null;
    }

    return ImageGallery.map(image => transformMediaObject(resource, image, request));
}

function transformMediaObject(containerResource, odhSource, request) {
    const image =  new Image(odhSource);
    const mediaObject = new MediaObject();

    mediaObject.id = transformId(image);

    mediaObject.meta = Object.assign({}, containerResource.meta)
    mediaObject.links = utils.transformResourceLinks(request, mediaObject.type, mediaObject.id);

    mediaObject.attributes.description = transformDescription(image);
    mediaObject.attributes.name = transformName(image);
    mediaObject.attributes.contentType = 'image/jpeg'; // TODO: ask ODH to provide contentType
    mediaObject.attributes.url = image.ImageUrl || null;
    mediaObject.attributes.license = transformLicense(image);
    mediaObject.attributes.height = transformHeight(image);
    mediaObject.attributes.width = transformWidth(image);

    mediaObject.relationships.copyrightOwner = transformCopyrightOwner(mediaObject, image, request);
    
    // mediaObject.attributes.abstract - No available data
    // mediaObject.attributes.duration - No available data
    // mediaObject.attributes.shortName - No available data
    // mediaObject.relationships.categories - No available data

    return mediaObject;
}

function transformId(odhImage) {
    const idRegex = /ID=(.*)/i;
    const idMatches = odhImage.ImageUrl.match(idRegex);
    return idMatches.length >= 2 ? idMatches[1] : odhImage.ImageUrl;
}

function transformDescription(odhImage) {
  return !_.isEmpty(odhImage.ImageDesc) ? utils.sanitizeAndConvertLanguageTags(odhImage.ImageDesc) : null;
}

function transformName(odhImage) {
  return !odhImage.ImageName
    ? null
    : {
        deu: odhImage.ImageName,
        eng: odhImage.ImageName,
        ita: odhImage.ImageName,
      };
}

function transformLicense(odhImage) {
    switch (odhImage.License) {
        case 'CC0':
            return 'CC0-1.0';
        case 'CC1':
            return 'CC1-1.0';
        default:
            return null;
    }
}

function transformHeight(odhImage) {
    return odhImage.Height && odhImage.Width ? odhImage.Height : null;
}

function transformWidth(odhImage) {
    return odhImage.Height && odhImage.Width ? odhImage.Width : null;
}

function transformCopyrightOwner(mediaObjectContainer, odhSource, request) {
    const { CopyRight } = odhSource;

    if(!CopyRight) {
        return null;
    }

    const agent = new Agent();

    agent.id = mediaObjectContainer.id + '_copyrightOwner';
    agent.meta = Object.assign({}, mediaObjectContainer.meta)
    agent.links = utils.transformResourceLinks(request, agent.type, agent.id);

    agent.attributes.name = {
        deu: CopyRight,
        eng: CopyRight,
        ita: CopyRight,
    }

    // agent.attributes.abstract - No data available
    // agent.attributes.contactPoints - No data available
    // agent.attributes.description - No data available
    // agent.attributes.shortName - No data available
    // agent.attributes.url - No data available

    // agent.relationships.categories - No data available
    // agent.relationships.multimediaDescriptions - No data available

    return agent;
}

module.exports = {
    transformMediaObject,
    transformMultimediaDescriptions
}