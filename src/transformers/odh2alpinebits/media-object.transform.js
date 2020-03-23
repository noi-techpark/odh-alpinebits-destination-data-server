const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

function transformMockMultimediaDescriptionsRelationship(sourceResource, included, request) {
  let sourceArray = sourceResource.relationships.multimediaDescriptions;

  if(!sourceArray || !sourceArray.data)
    return null;
  
  let data = [];

  for (reference of sourceArray.data){
    let mediaObject = sourceResource.included.find( element => 
      element.type===reference.type && element.id===reference.id
    );
    Object.assign(mediaObject.links, utils.createSelfLink(mediaObject, request));
    data.push(mediaObject);
  }

  if(data.length===0)
    return null;

  return data;
}

function transformMultimediaDescriptionsRelationship(sourceResource, included, request) {
  let data = [];

  // Media Objects
  for (image of sourceResource.ImageGallery){
    const { mediaObject, copyrightOwner } = transformMediaObject(image, included, request);
    data.push(mediaObject);
    
    if(copyrightOwner)
      utils.addIncludedResource(included, copyrightOwner);
  }  
  
  if(data.length===0)
    return null;

  return data;
}

function transformMediaObject(source, included, request) {
  let mediaObject = templates.createObject('MediaObject');
  let attributes = mediaObject.attributes;
  let relationships = mediaObject.relationships;

  const match = source.ImageUrl.match(/ID=(.*)/i);
  mediaObject.id = match.length>=2 ? match[1] : source.ImageUrl;
  
  let links = mediaObject.links;
  Object.assign(links, utils.createSelfLink(mediaObject, request));

  /**
   * 
   *  ATTRIBUTES
   * 
   */

  attributes.contentType = 'image/jpeg'

  // ['Width','width'], ['Height','height']
  const imageFieldMapping = [ ['ImageUrl','url'], ['License','license'] ];

  const imageValueMapping = {
    License: {
      'CC0': 'CC0-1.0',
      'CC1': 'CC1-1.0'
    }
  }

  utils.transformFields(source, attributes, imageFieldMapping, imageValueMapping);

  // ['ImageTitle', 'name']
  const imageMultilingualFieldMapping = [ ['ImageDesc', 'description'] ];
  utils.transformMultilingualFields(source, attributes, imageMultilingualFieldMapping, true);

  /**
   * 
   *  RELATIONSHIPS
   * 
   */

  const copyrightOwner = templates.createObject('Agent');
  copyrightOwner.id = shajs('sha256').update(source.CopyRight).digest('hex');
  copyrightOwner.attributes.name = {
    deu: source.CopyRight,
    eng: source.CopyRight,
    ita: source.CopyRight
  };
  
  utils.addRelationshipToOne(relationships, 'copyrightOwner', copyrightOwner, links.self)

  return ({ 
    mediaObject,
    copyrightOwner
  });
}

module.exports = {
  transformMediaObject,
  transformMultimediaDescriptionsRelationship,
  transformMockMultimediaDescriptionsRelationship
}


