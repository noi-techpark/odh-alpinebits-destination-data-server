var shajs = require('sha.js')
const { transformFields, transformArrayFields, transformMultilingualFields, safeGet } = require('./transformation');
const { createObject } = require('./templates');

module.exports = {
  transformEventArray: function(data) {
    try {
      let result = [];

      for (object of data.Items)
        result.push(transformEvent(object));

      return result;
    }
    catch(exception){
      console.log(exception);
      return null;
    }
  },
  transformEvent: function(data) {
    try {
      return transformEvent(data);
    }
    catch(exception){
      console.log(exception);
      return null;
    }
  }
}

const languageMapping = [
  ['it','ita'],
  ['en','eng'],
  ['de','deu']
]

function transformEvent(object) {
  const source = JSON.parse(JSON.stringify(object));
  let target = createObject('Event');

  Object.assign(target, transformMetadata(source));
  Object.assign(target, transformBasicProperties(source));
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

function transformBasicProperties(source) {
  let target = {};
  let fieldMapping = [['Id','id']]
  transformFields(source, target, fieldMapping);

  // Basic textual descriptions
  if(source.Detail) {
    fieldMapping = [['Title','name'],['BaseText','description']];
    transformMultilingualFields(source.Detail, target, fieldMapping, languageMapping, false, true);
  }

  if(source.ContactInfos) {
    fieldMapping = [['Url', 'url']];
    transformMultilingualFields(source.ContactInfos, target, fieldMapping, languageMapping, false, true);
  }

  return target;
}

function transformMetadata(source) {
  target = {};
  target.lastUpdate = source.LastChange+'+02:00';
  target.dataProvider = "http://tourism.opendatahub.bz.it/";
  return target;
}

function transformDates(source) {
  let target = {}

  if(!source.EventDate || source.EventDate.length==0) {
    const mapping = [ ['DateBegin','startDate'], ['DateEnd','endDate'] ]
    transformFields(source, target, mapping);
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
  let publisher = createObject('Agent');
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

  let newOrganizer = createObject('Agent');

  const organizerMapping = [['Url','url']];
  transformMultilingualFields(organizer, newOrganizer, organizerMapping, languageMapping, false, true);

  let newContact = createObject('ContactPoint');
  newOrganizer.contacts = [newContact];

  let newAddress = createObject('Address');
  newContact.address = newAddress;

  const addressMapping = [['Address','street'], ['City','city'], ['ZipCode','zipcode']];
  transformMultilingualFields(organizer, newAddress, addressMapping, languageMapping, false);
  newAddress.zipcode = newAddress.zipcode.ita || newAddress.zipcode.eng || newAddress.zipcode.deu;

  let inferredType = {
    error: 0,
    organization: 0,
    person: 0
  };

  for (languageEntry of languageMapping) {
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
  // TODO: improve this part of the code. Too many duplicate...
  if(!newOrganizer.email) {
    const deEmail = safeGet(['de','Email']);
    const itEmail = safeGet(['it','Email']);
    const enEmail = safeGet(['en','Email']);
    newOrganizer.email = deEmail || itEmail || enEmail;
  }

  if(!newOrganizer.telephone) {
    const deTelephone = safeGet(['de','Phonenumber']);
    const itTelephone = safeGet(['it','Phonenumber']);
    const enTelephone = safeGet(['en','Phonenumber']);
    newOrganizer.telephone = deTelephone || itTelephone || enTelephone;
  }

  if(!newOrganizer.id)
    console.log('NO ID!');

  return newOrganizer;
}

function transformVenue(source) {
  let venue = createObject('Venue');
  venue.id = source.Id+'+location';

  const venueMapping = [ ['Location', 'name'] ];
  transformMultilingualFields(source.EventAdditionalInfos, venue, venueMapping, languageMapping, false);

  let address = createObject('Address');
  venue.address = address;

  if(source.ContactInfos) {
    const venueAddressMapping = [
      ['Address', 'street'],
      ['City', 'city'],
      ['ZipCode', 'zipcode'],
    ];
    transformMultilingualFields(source.ContactInfos, address, venueAddressMapping, languageMapping, false);

    address.zipcode = address.zipcode.ita || address.zipcode.eng || address.zipcode.deu;
  }

  if(source.Latitude && source.Longitude) {
    let point = createObject('Point');
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
      let hoursSpec = createObject('HoursSpecification');
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
  let newMediaObject = createObject('MediaObject');

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

  transformFields(mediaObject, newMediaObject, imageFieldMapping, imageValueMapping);

  // ['ImageTitle', 'name']
  const imageMultilingualFieldMapping = [ ['ImageDesc', 'description'] ];

  transformMultilingualFields(mediaObject, newMediaObject, imageMultilingualFieldMapping, languageMapping, true);

  const owner = createObject('Agent');
  owner.name.ita = owner.name.deu = owner.name.eng = mediaObject.CopyRight;
  owner.id = shajs('sha256').update(mediaObject.CopyRight).digest('hex');
  newMediaObject.copyrightOwner = owner;

  return newMediaObject;
}
