const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');


function transformVenuesRelationship(sourceEvent, included, request) {
  let venue = transformVenue(sourceEvent, included, request);

  if(!venue)
    return null;

  return [ venue ];
}

function transformVenue(sourceEvent, included, request) {
  let venue = templates.createObject('Venue', request.apiVersion);
  venue.id = sourceEvent.Id+'+location';
  
  let links = venue.links;
  Object.assign(links, utils.createSelfLink(venue, request));

  /**
   * 
   *  ATTRIBUTES
   * 
   */
  let attributes = venue.attributes;

  const fieldMapping = [ ['Location', 'name'] ];
  utils.transformMultilingualFields(sourceEvent.EventAdditionalInfos, attributes, fieldMapping, false);

  if(!attributes.name)
    attributes.name = {
      "eng": "Unnamed venue"
    };

  let address = templates.createObject('Address');
  attributes.address = address;

  if(sourceEvent.ContactInfos) {
    const addressFieldMapping = [
      ['Address', 'street'],
      ['City', 'city'],
      ['ZipCode', 'zipcode'],
    ];
    utils.transformMultilingualFields(sourceEvent.ContactInfos, address, addressFieldMapping, false);
    address.zipcode = utils.safeGetOne([['zipcode','ita'],['zipcode','eng'],['zipcode','deu']], address);
    address.country = 'IT';
    
    if(!address.city)
      address.city = {
        eng: "Missing city!!! FIX ME!"
      }
  }

  if(sourceEvent.Latitude && sourceEvent.Longitude) {
    let point = templates.createObject('Point');
    attributes.geometries = [point];
    
    point.coordinates.push(sourceEvent.Latitude);
    point.coordinates.push(sourceEvent.Longitude);

    if(sourceEvent.Altitude)
      point.coordinates.push(sourceEvent.Altitude);
  }

  /**
   * 
   *  RELATIONSHIPS: No relationship is transformed
   * 
   */

  return venue;
}

module.exports = {
  transformVenuesRelationship,
  transformVenue
}


