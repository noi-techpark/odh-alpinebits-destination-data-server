const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');
const { transformOrganizer } = require('./organizer.transform');
const { transformPublisher } = require('./publisher.transform');
const { transformVenue } = require('./venue.transform');
const { transformMediaObject } = require('./media-object.transform');

module.exports = (originalObject, included = {}, request) => {
  const sourceEvent = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('Event');

  target.id = sourceEvent.Id;

  let meta = target.meta;
  Object.assign(meta, utils.transformMetadata(sourceEvent));

  let links = target.links;
  Object.assign(links, utils.createSelfLink(target, request));
  
  /**
   * 
   *  ATTRIBUTES
   * 
   */

  let attributes = target.attributes;
  Object.assign(attributes, utils.transformBasicProperties(sourceEvent));
  Object.assign(attributes, transformDates(sourceEvent));

  attributes.status = 'published';

  // // Event categories
  // const categoryMapping = {
  //   'Gastronomie/Typische Produkte': 'odh/gastronomy',
  //   'Musik/Tanz': 'odh/music',
  //   'Volksfeste/Festivals': 'odh/festival',
  //   'Sport': 'odh/sports',
  //   'Führungen/Besichtigungen': 'odh/tourism',
  //   'Theater/Vorführungen': 'odh/theather',
  //   'Kurse/Bildung': 'odh/education',
  //   'Tagungen Vorträge': 'odh/conference',
  //   'Familie': 'odh/family',
  //   'Handwerk/Brauchtum': 'odh/handicrafts',
  //   'Messen/Märkte': 'odh/market',
  //   'Wanderungen/Ausflüge': 'odh/hike',
  //   'Ausstellungen/Kunst': 'odh/art',
  // }
  let categories = [];
  
  sourceEvent.Topics.forEach(topic => {
    
    // if(categoryMapping[tag])
    //   categories.push(categoryMapping[tag]);
    
    if(topic && topic.TopicInfo)
      categories.push("odh/"+ topic.TopicInfo.replace(/[\/|\s]/g,'-').toLowerCase());
  })

  if(categories.length>0)
    attributes.categories = categories;

  /**
   * 
   *  RELATIONSHIPS
   * 
   */

  let relationships = target.relationships;
  
  // Venue
  let venue = transformVenue(sourceEvent, included, request);
  utils.addRelationshipToMany(relationships, 'venues', venue, links.self);
  utils.addIncludedResource(included, venue);
  
  
  // Organizer
  let organizer = transformOrganizer(sourceEvent, included, request)
  utils.addRelationshipToMany(relationships, 'organizers', organizer, links.self);
  utils.addIncludedResource(included, organizer);

  // Publisher
  let publisher = transformPublisher(sourceEvent, included, request);
  utils.addRelationshipToOne(relationships, 'publisher', publisher, links.self);
  utils.addIncludedResource(included, publisher);

  // Media Objects
  for (image of sourceEvent.ImageGallery){
    const { mediaObject, copyrightOwner } = transformMediaObject(image, links, request);
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', mediaObject, links.self);
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }

  return target;
}

function transformDates(sourceEvent) {
  let target = {}

  if(!sourceEvent.EventDate || sourceEvent.EventDate.length==0) {
    const mapping = [ ['DateBegin','startDate'], ['DateEnd','endDate'] ]
    utils.transformFields(sourceEvent, target, mapping);
  }
  else if(sourceEvent.EventDate && sourceEvent.EventDate.length===1) {
    const date = sourceEvent.EventDate[0];
    target.startDate = date.From.replace(/T.*/,'T'+date.Begin);
    target.endDate = date.To.replace(/T.*/,'T'+date.End);
  }
  else {
    let dateList = sourceEvent.EventDate.map( (entry, idx) => {
      const startDateTime = entry.From.replace(/T.*/,'T'+entry.Begin);
      return { date: new Date(startDateTime).getTime(), index: idx};
    })

    dateList.sort((a, b) => (a.date > b.date) ? 1 : -1);

    const firstDate = sourceEvent.EventDate[dateList.shift().index];
    const lastDate = sourceEvent.EventDate[dateList.pop().index];

    target.startDate = firstDate.From.replace(/T.*/,'T'+firstDate.Begin);
    target.endDate = lastDate.To.replace(/T.*/,'T'+lastDate.End);
  }

  target.startDate += '+01:00'
  target.endDate += '+01:00'

  return target;
}
