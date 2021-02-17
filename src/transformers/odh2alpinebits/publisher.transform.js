const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

function transformPublisherRelationship(sourceEvent, included, request) {
  let publisher = transformPublisher(sourceEvent, included, request);

  if(!publisher)
    return null;

  return publisher;
}

function transformPublisher(originalObject, included, request) {
  let publisher = templates.createObject('Agent', request.apiVersion);
  
  publisher.id = shajs('sha256').update('lts').digest('hex'),
  publisher.attributes.name = {
    deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    ita: "LTS - Landesverband der Tourismusorganisationen Südtirols"
  };
  publisher.attributes.url = "https://lts.it";

  let links = publisher.links;
  Object.assign(links, utils.createSelfLink(publisher, request));
  
  return publisher;
}

module.exports = {
  transformPublisher,
  transformPublisherRelationship
}


