const fs = require('fs');

const { translateFields, translateArrayFields, translateMultilingualFields } = require('./translator');
const { createObject } = require('./templates');

// const Ajv = require('ajv');
// let ajv = new Ajv();
// let schema = JSON.parse(fs.readFileSync('Event.schema.json'));
// let validate = ajv.compile(schema);

// let source = JSON.parse(fs.readFileSync('event1.json'));
const inputFile = 'input/events-with-image.json';
console.log("Reading " + inputFile + "...");
let entry = JSON.parse(fs.readFileSync(inputFile));
console.log("Converting " + entry.Items.length + " entries...")

const languageMapping = [
  ["it","ita"],
  ["en","eng"],
  ["de","deu"]
]

for (source of entry.Items) {

  let target = createObject('Event');
  
  const directMapping = [
    ["Id", "id"],
    ["LastChange", "lastUpdate"],
    ["DateBegin", "startDate"],
    ["DateEnd", "endDate"],
  ]
  translateFields(source, target, directMapping);

  // Basic textual descriptions
  if(source.Detail) {
    const descriptionMapping = [
      ["Title", "name"],
      ["BaseText", "description"]
    ];
    translateMultilingualFields(source.Detail, target, descriptionMapping, languageMapping, false);
  }

  if(source.ContactInfos) {
    const urlMapping = [ ["Url", "url"] ];
    translateMultilingualFields(source.ContactInfos, target, urlMapping, languageMapping, false);
  }

  // Dates
  // TODO: multiple days

  // Venue
  // TODO: add the venue's address
  let venue = createObject('Venue');
  target.venues.push(venue);

  const venueMapping = [ ["Location", "name"] ];
  translateMultilingualFields(source.EventAdditionalInfos, venue, venueMapping, languageMapping, false);

  let address = createObject('Address');
  venue.address = address;

  if(source.LocationInfo && source.LocationInfo.MunicipalityInfo) {
    const cityMapping = [ ["Name", "city"] ];
    translateMultilingualFields(source.LocationInfo.MunicipalityInfo, address, cityMapping, languageMapping, true);
  }

  if(source.Latitude && source.Longitude) {
    let point = createObject('Point');
    venue.geometries.push(point);

    point.coordinates.push(source.Latitude);
    point.coordinates.push(source.Longitude);

    if(source.Altitude)
      point.coordinates.push(source.Altitude);
  }

  // Organizer
  // Basic textual descriptions
  const sourceOrganizer = source.OrganizerInfos;
  if(sourceOrganizer) {
    let targetOrganizer = createObject('Agent');
    target.organizers = [ targetOrganizer ];

    const organizerMapping = [ ["Url", "url"] ];
    translateMultilingualFields(sourceOrganizer, targetOrganizer, organizerMapping, languageMapping, false);

    let contactPoint = createObject('ContactPoint');
    targetOrganizer.contacts = [contactPoint];

    let orgAddress = createObject('Address');
    contactPoint.address = orgAddress;

    const addressMapping = [
      ["Address", "street"],
      ["City", "city"],
      ["ZipCode", "zipcode"],
    ];
    translateMultilingualFields(sourceOrganizer, orgAddress, addressMapping, languageMapping, false);

    let inferredType = {
      error: 0,
      organization: 0,
      person: 0
    };

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(sourceOrganizer[sourceLanguage]) {
        const phonenumber = sourceOrganizer[sourceLanguage].Phonenumber.trim();
        contactPoint.telephone = contactPoint.telephone || phonenumber;

        const email = sourceOrganizer[sourceLanguage].Email.trim();
        contactPoint.email = contactPoint.email || email;

        const ignoreValues = ["Undefiniert","!","-",".","sonstige"];
        const companyName = sourceOrganizer[sourceLanguage].CompanyName.trim();
        const givenName = sourceOrganizer[sourceLanguage].Givenname.trim();
        const surname = sourceOrganizer[sourceLanguage].Surname.trim();

        const isValidCompanyName = companyName && !ignoreValues.includes(companyName);
        const isValidGivenName = givenName && !ignoreValues.includes(givenName);
        const isValidSurname = surname && !ignoreValues.includes(surname);

        if(!isValidCompanyName && !isValidGivenName && !isValidSurname) {
          inferredType.error++;
          targetOrganizer.name[targetLanguage] = null;
        }
        else if(isValidCompanyName) {
          inferredType.organization++;
          targetOrganizer.name[targetLanguage] = companyName;
        }
        else if ((isValidGivenName || isValidSurname) && !(isValidGivenName && isValidSurname)){
            if(isValidSurname){
              inferredType.organization++;
              targetOrganizer.name[targetLanguage] = surname;
            }
            else {
              inferredType.organization++;
              targetOrganizer.name[targetLanguage] = givenName;
            }
        }
        else {
          inferredType.person++;
          targetOrganizer.name[targetLanguage] = givenName+" "+surname;
        }
      }
    }

    if(inferredType.organization)
      targetOrganizer.category = "organization";
    else if (inferredType.person)
      targetOrganizer.category = "person";
    else
      targetOrganizer.category = null;

  }

  // Event categories
  const categoryMapping = {
      "Gastronomie/Typische Produkte": "alpinebits/gastronomy",
      "Musik/Tanz": "alpinebits/music",
      "Volksfeste/Festivals": "alpinebits/festival",
      "Sport": "alpinebits/sports",
      "Führungen/Besichtigungen": "alpinebits/tourism",
      "Theater/Vorführungen": "alpinebits/theather",
      "Kurse/Bildung": "alpinebits/education",
      "Tagungen Vorträge": "alpinebits/conference",
      "Familie": "alpinebits/family",
      "Handwerk/Brauchtum": "alpinebits/handicrafts",
      "Messen/Märkte": "alpinebits/market",
      "Wanderungen/Ausflüge": "alpinebits/hike",
      "Ausstellungen/Kunst": "alpinebits/art",
  }

  target.categories = [];
  for (sourceCategory of source.Topics) {
    target.categories.push(categoryMapping[sourceCategory.TopicInfo]);
  }

  // Images
  target.multimediaDescriptions = []
  for (sourceImage of source.ImageGallery) {
    let targetImage = createObject('MediaObject');

    target.multimediaDescriptions.push(targetImage);

    // targetImage.url = sourceImage.ImageUrl;
    const imageFieldMapping = [
      ["ImageUrl","url"],
      ["Width","width"],
      ["Height","height"],
      ["License","license"]
    ]

    const imageValueMapping = {
      License: {
        "CC0": "CC0-1.0",
        "CC1": "CC1-1.0"
      }
    }

    translateFields(sourceImage, targetImage, imageFieldMapping, imageValueMapping);

    const imageMultilingualFieldMapping = [
      ["ImageTitle", "name"],
      ["ImageDesc", "description"],
    ];

    translateMultilingualFields(sourceImage, targetImage, imageMultilingualFieldMapping, languageMapping, true);

    const owner = createObject('Agent');
    owner.name.ita = owner.name.deu = owner.name.eng = sourceImage.CopyRight;
    targetImage.copyrightOwner = owner;

  }

  // const outputFile = "target.json";
  const outputFile = "output/"+target.id+".json";
  const outputContent = JSON.stringify(target, null, 2);

  fs.writeFile(outputFile, outputContent, function (err) {
    if (err) throw err;
  });

  // var isValid = validate(target);
  //
  // if(isValid){
  //   console.log('OK: The object is VALID!');
  // }
  // else {
  //   console.log('ERROR: The object is INVALID!');
  //   console.log(JSON.stringify(validate.errors,null,2));
  // }

}

// console.log(alpineBitsEvent);
