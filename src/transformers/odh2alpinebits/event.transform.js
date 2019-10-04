const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Event');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));
  Object.assign(target, transformDates(source));

  target.status = transformStatus(source.DateBegin, source.DateEnd);

  // Venue
  let newVenue = transformVenue(source);
  target.venues.push(newVenue);

  // Organizer
  let newOrganizer = transformOrganizer(source.OrganizerInfos, source.ContactInfos)
  target.organizers = [newOrganizer];

  // Publisher
  let newPublisher = transformPublisher();
  target.publisher = newPublisher;

  // Event categories
  target.categories = [];
  for (category of source.Topics) {
    target.categories.push(transformCategory(category));
  }

  // Media Objects
  target.multimediaDescriptions = []
  for (image of source.ImageGallery)
    target.multimediaDescriptions.push(transformMediaObject(image));

  return target;
}

function transformDates(source) {
  let target = {}

  if(!source.EventDate || source.EventDate.length==0) {
    const mapping = [ ['DateBegin','startDate'], ['DateEnd','endDate'] ]
    utils.transformFields(source, target, mapping);
  }
  else if(source.EventDate && source.EventDate.length===1) {
    const date = source.EventDate[0];
    target.startDate = date.From.replace(/T.*/,'T'+date.Begin);
    target.endDate = date.To.replace(/T.*/,'T'+date.End);
  }
  else {
    let dateList = source.EventDate.map( (entry, idx) => {
      const startDateTime = entry.From.replace(/T.*/,'T'+entry.Begin);
      return { date: new Date(startDateTime).getTime(), index: idx};
    })

    dateList.sort((a, b) => (a.date > b.date) ? 1 : -1);

    const firstDate = source.EventDate[dateList.shift().index];
    const lastDate = source.EventDate[dateList.pop().index];

    target.startDate = firstDate.From.replace(/T.*/,'T'+firstDate.Begin);
    target.endDate = lastDate.To.replace(/T.*/,'T'+lastDate.End);
  }

  target.startDate += '+02:00'
  target.endDate += '+02:00'

  return target;
}

function transformStatus(startDate, endDate) {
  const startDateMiliseconds = new Date(startDate).getTime();
  const endDateMiliseconds = new Date(endDate).getTime();
  const now = Date.now();

  if(now > endDateMiliseconds)
    return 'realized';
  if(now > startDateMiliseconds)
    return 'ongoing';

  return 'scheduled';
}

function transformCategory(category) {

  const categoryMapping = {
    'Gastronomie/Typische Produkte': 'alpinebits/gastronomy',
    'Musik/Tanz': 'alpinebits/music',
    'Volksfeste/Festivals': 'alpinebits/festival',
    'Sport': 'alpinebits/sports',
    'Führungen/Besichtigungen': 'alpinebits/tourism',
    'Theater/Vorführungen': 'alpinebits/theather',
    'Kurse/Bildung': 'alpinebits/education',
    'Tagungen Vorträge': 'alpinebits/conference',
    'Familie': 'alpinebits/family',
    'Handwerk/Brauchtum': 'alpinebits/handicrafts',
    'Messen/Märkte': 'alpinebits/market',
    'Wanderungen/Ausflüge': 'alpinebits/hike',
    'Ausstellungen/Kunst': 'alpinebits/art',
  }

  return categoryMapping[category.TopicInfo];
}

function transformPublisher() {
  let publisher = templates.createObject('Agent');
  let lts = {
    id: shajs('sha256').update('lts').digest('hex'),
    name: {
      deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      ita: "LTS - Landesverband der Tourismusorganisationen Südtirols"
    },
    url: "https://lts.it"
  }

  Object.assign(publisher, lts);
  return publisher;
}

function transformOrganizer(organizer, contact) {

  if(!organizer)
    return {};

  let newOrganizer = templates.createObject('Agent');

  const organizerMapping = [['Url','url']];
  utils.transformMultilingualFields(organizer, newOrganizer, organizerMapping, utils.languageMapping, false, true);

  let newContact = templates.createObject('ContactPoint');
  newOrganizer.contacts = [newContact];

  let newAddress = templates.createObject('Address');
  newContact.address = newAddress;

  const addressMapping = [['Address','street'], ['City','city'], ['ZipCode','zipcode']];
  utils.transformMultilingualFields(organizer, newAddress, addressMapping, utils.languageMapping, false);
  newAddress.zipcode = newAddress.zipcode.ita || newAddress.zipcode.eng || newAddress.zipcode.deu;

  let inferredType = {
    error: 0,
    organization: 0,
    person: 0
  };

  for (languageEntry of utils.languageMapping) {
    let [sourceLanguage, targetLanguage] = languageEntry;

    if(organizer[sourceLanguage]) {
      const phonenumber = organizer[sourceLanguage].Phonenumber.trim();
      newContact.telephone = newContact.telephone || phonenumber;

      const email = organizer[sourceLanguage].Email.trim();
      if(email)
        newContact.email = email;

      const orgId = organizer[sourceLanguage].Tax || organizer[sourceLanguage].Vat;
      if(orgId)
        newOrganizer.id = orgId;

      const ignoreValues = ['Undefiniert','!','-','.','sonstige'];
      const companyName = organizer[sourceLanguage].CompanyName.trim();
      const givenName = organizer[sourceLanguage].Givenname.trim();
      const surname = organizer[sourceLanguage].Surname.trim();

      const isValidCompanyName = companyName && !ignoreValues.includes(companyName);
      const isValidGivenName = givenName && !ignoreValues.includes(givenName);
      const isValidSurname = surname && !ignoreValues.includes(surname);

      if(!isValidCompanyName && !isValidGivenName && !isValidSurname) {
        inferredType.error++;
      }
      else if(isValidCompanyName) {
        inferredType.organization++;
        newOrganizer.name[targetLanguage] = companyName;
      }
      else if ((isValidGivenName || isValidSurname) && !(isValidGivenName && isValidSurname)){
        if(isValidSurname){
          inferredType.organization++;
          newOrganizer.name[targetLanguage] = surname;
        }
        else {
          inferredType.organization++;
          newOrganizer.name[targetLanguage] = givenName;
        }
      }
      else {
        inferredType.person++;
        newOrganizer.name[targetLanguage] = givenName+' '+surname;
      }
    }
  }

  // TODO: Decide how to handle the case in which we cannot infer whether the organizer is a person or an organization. We are currently setting the organizer to be an organization
  newOrganizer.category = !inferredType.organization && inferredType.person ? 'person' : 'organization'

  //If email and telephone number are not specified in organizer, try to get it from the ContactInfos field.
  // TODO: improve this part of the code. Too many duplicates...
  if(!newOrganizer.email) {
    const deEmail = utils.safeGet(['de','Email']);
    const itEmail = utils.safeGet(['it','Email']);
    const enEmail = utils.safeGet(['en','Email']);
    newOrganizer.email = deEmail || itEmail || enEmail;
  }

  if(!newOrganizer.telephone) {
    const deTelephone = utils.safeGet(['de','Phonenumber']);
    const itTelephone = utils.safeGet(['it','Phonenumber']);
    const enTelephone = utils.safeGet(['en','Phonenumber']);
    newOrganizer.telephone = deTelephone || itTelephone || enTelephone;
  }

  if(!newOrganizer.id)
    console.log('NO ID!');

  return newOrganizer;
}

function transformVenue(source) {
  let venue = templates.createObject('Venue');
  venue.id = source.Id+'+location';

  const venueMapping = [ ['Location', 'name'] ];
  utils.transformMultilingualFields(source.EventAdditionalInfos, venue, venueMapping, utils.languageMapping, false);

  let address = templates.createObject('Address');
  venue.address = address;

  if(source.ContactInfos) {
    const venueAddressMapping = [
      ['Address', 'street'],
      ['City', 'city'],
      ['ZipCode', 'zipcode'],
    ];
    utils.transformMultilingualFields(source.ContactInfos, address, venueAddressMapping, utils.languageMapping, false);

    address.zipcode = address.zipcode.ita || address.zipcode.eng || address.zipcode.deu;
  }

  if(source.Latitude && source.Longitude) {
    let point = templates.createObject('Point');
    point.id = source.Id+'+point';
    venue.geometries.push(point);

    point.coordinates.push(source.Latitude);
    point.coordinates.push(source.Longitude);

    if(source.Altitude)
      point.coordinates.push(source.Altitude);
  }

  // Opening hours
  if(source.EventDate && source.EventDate.length>1) {
    for (date of source.EventDate) {
      let hoursSpec = templates.createObject('HoursSpecification');
      venue.openingHours.push(hoursSpec);

      hoursSpec.validFrom = date.From.replace(/T.*/,'');
      hoursSpec.validTo = date.To.replace(/T.*/,'');

      hoursSpec.hours = [{
        opens: date.Begin,
        closes: date.End
      }];
    }
  }

  return venue;
}

function transformMediaObject(mediaObject) {
  let newMediaObject = templates.createObject('MediaObject');

  const match = mediaObject.ImageUrl.match(/ID=(.*)/i);
  newMediaObject.id = match.length>=2 ? match[1] : mediaObject.ImageUrl;

  newMediaObject.contentType = 'image/jpeg'

  // ['Width','width'], ['Height','height']
  const imageFieldMapping = [ ['ImageUrl','url'], ['License','license'] ];

  const imageValueMapping = {
    License: {
      'CC0': 'CC0-1.0',
      'CC1': 'CC1-1.0'
    }
  }

  utils.transformFields(mediaObject, newMediaObject, imageFieldMapping, imageValueMapping);

  // ['ImageTitle', 'name']
  const imageMultilingualFieldMapping = [ ['ImageDesc', 'description'] ];

  utils.transformMultilingualFields(mediaObject, newMediaObject, imageMultilingualFieldMapping, utils.languageMapping, true);

  const owner = templates.createObject('Agent');
  owner.name.ita = owner.name.deu = owner.name.eng = mediaObject.CopyRight;
  owner.id = shajs('sha256').update(mediaObject.CopyRight).digest('hex');
  newMediaObject.copyrightOwner = owner;

  return newMediaObject;
}
