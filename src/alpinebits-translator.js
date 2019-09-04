const fs = require('fs');
const Ajv = require('ajv');
const { translateFields, translateArrayFields, translateMultilingualFields } = require('./translation');
const { createObject } = require('./alpinebits-templates');

let schema = JSON.parse(fs.readFileSync('./src/Event.schema.json'));
let ajv = new Ajv( { verbose: false } );
let validate = ajv.compile(schema);

const inputFile = 'input/events-with-image.json'; // small dataset with 33 events
// const inputFile = 'input/events.json'; // medium dataset with 500 events (~5MB)
// const inputFile = 'input/events-all.json'; // large dataset with 25000 events (~190MB)
console.log("Reading " + inputFile + "...");

let entry = JSON.parse(fs.readFileSync(inputFile));
console.log("Converting " + entry.Items.length + " entries...\n");

const languageMapping = [
  ["it","ita"],
  ["en","eng"],
  ["de","deu"]
]

let results = {
  valid: 0,
  invalid: 0,
  error: 0
}

for (source of entry.Items) {
  try {
    let target = createObject('Event');

    const directMapping = [
      ["Id", "id"],
      ["DateBegin", "startDate"],
      ["DateEnd", "endDate"],
    ]
    translateFields(source, target, directMapping);

    const startDateMiliseconds = new Date(target.startDate).getTime();
    const endDateMiliseconds = new Date(target.endDate).getTime();
    const now = Date.now();

    if(now > endDateMiliseconds)
      target.status = 'realized';
    else if(now > startDateMiliseconds)
      target.status = 'ongoing';
    else
      target.status = 'scheduled';

    target.lastUpdate = source.LastChange+"+02:00";

    // Basic textual descriptions
    if(source.Detail) {
      const descriptionMapping = [
        ["Title", "name"],
        ["BaseText", "description"]
      ];
      translateMultilingualFields(source.Detail, target, descriptionMapping, languageMapping, false, true);
    }

    if(source.ContactInfos) {
      const urlMapping = [ ["Url", "url"] ];
      translateMultilingualFields(source.ContactInfos, target, urlMapping, languageMapping, false, true);
    }

    // Venue
    let venue = createObject('Venue');
    target.venues.push(venue);
    venue.id = source.Id+"/location";

    const venueMapping = [ ["Location", "name"] ];
    translateMultilingualFields(source.EventAdditionalInfos, venue, venueMapping, languageMapping, false);

    let address = createObject('Address');
    venue.address = address;

    if(source.ContactInfos) {
      const venueAddressMapping = [
        ["Address", "street"],
        ["City", "city"],
        ["ZipCode", "zipcode"],
      ];
      translateMultilingualFields(source.ContactInfos, address, venueAddressMapping, languageMapping, false);

      address.zipcode = address.zipcode.ita || address.zipcode.eng || address.zipcode.deu;
    }

    if(source.Latitude && source.Longitude) {
      let point = createObject('Point');
      point.id = source.Id+"/point";
      venue.geometries.push(point);

      point.coordinates.push(source.Latitude);
      point.coordinates.push(source.Longitude);

      if(source.Altitude)
        point.coordinates.push(source.Altitude);
    }

    // Dates and times
    if(source.EventDate && source.EventDate.length===1) {
      const date = source.EventDate[0];
      target.startDate = date.From.replace(/T.*/,"T"+date.Begin+"+02:00");
      target.endDate = date.To.replace(/T.*/,"T"+date.End+"+02:00");
    }
    else {
      target.startDate += "+02:00"
      target.endDate += "+02:00"

      for (date of source.EventDate) {
        let hoursSpec = createObject('HoursSpecification');
        venue.openingHours.push(hoursSpec);

        hoursSpec.validFrom = date.From.replace(/T.*/,"");
        hoursSpec.validTo = date.To.replace(/T.*/,"");

        hoursSpec.hours = [{
          opens: date.Begin,
          closes: date.End
        }];
      }
    }

    // Organizer
    const sourceOrganizer = source.OrganizerInfos;
    if(sourceOrganizer) {
      let targetOrganizer = createObject('Agent');
      target.organizers = [ targetOrganizer ];

      const organizerMapping = [ ["Url", "url"] ];
      translateMultilingualFields(sourceOrganizer, targetOrganizer, organizerMapping, languageMapping, false, true);

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
      orgAddress.zipcode = orgAddress.zipcode.ita || orgAddress.zipcode.eng || orgAddress.zipcode.deu;

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
          if(email)
            contactPoint.email = email;

          const orgId = sourceOrganizer[sourceLanguage].Tax || sourceOrganizer[sourceLanguage].Vat;
          if(orgId)
            targetOrganizer.id = orgId;

          const ignoreValues = ["Undefiniert","!","-",".","sonstige"];
          const companyName = sourceOrganizer[sourceLanguage].CompanyName.trim();
          const givenName = sourceOrganizer[sourceLanguage].Givenname.trim();
          const surname = sourceOrganizer[sourceLanguage].Surname.trim();

          const isValidCompanyName = companyName && !ignoreValues.includes(companyName);
          const isValidGivenName = givenName && !ignoreValues.includes(givenName);
          const isValidSurname = surname && !ignoreValues.includes(surname);

          if(!isValidCompanyName && !isValidGivenName && !isValidSurname) {
            inferredType.error++;
            // targetOrganizer.name[targetLanguage] = null;
          }
          else if(isValidCompanyName) {
            inferredType.organization++;
            if(!targetOrganizer.name) targetOrganizer = {};

            targetOrganizer.name[targetLanguage] = companyName;
          }
          else if ((isValidGivenName || isValidSurname) && !(isValidGivenName && isValidSurname)){
            if(isValidSurname){
              inferredType.organization++;

              if(!targetOrganizer.name) targetOrganizer = {};
              targetOrganizer.name[targetLanguage] = surname;
            }
            else {
              inferredType.organization++;

              if(!targetOrganizer.name) targetOrganizer = {};
              targetOrganizer.name[targetLanguage] = givenName;
            }
          }
          else {
            inferredType.person++;

            if(!targetOrganizer.name) targetOrganizer = {};
            targetOrganizer.name[targetLanguage] = givenName+" "+surname;
          }
        }
      }

      //If email and telephone number are not specified in organizer, try to get it from the ContactInfos field.
      if(!targetOrganizer.email){
        if(source.ContactInfos.de && source.ContactInfos.de.Email && source.ContactInfos.de.Email.trim())
          targetOrganizer.email = source.ContactInfos.de.Email.trim();
        else if(source.ContactInfos.it && source.ContactInfos.it.Email && source.ContactInfos.it.Email.trim())
          targetOrganizer.email = source.ContactInfos.it.Email.trim();
        else if(source.ContactInfos.en && source.ContactInfos.en.Email && source.ContactInfos.en.Email.trim())
          targetOrganizer.email = source.ContactInfos.en.Email.trim();
      }

      if(!targetOrganizer.telephone){
        if(source.ContactInfos.de && source.ContactInfos.de.Phonenumber && source.ContactInfos.de.Phonenumber.trim())
          targetOrganizer.telephone = source.ContactInfos.de.Phonenumber.trim();
        else if(source.ContactInfos.it && source.ContactInfos.it.Phonenumber && source.ContactInfos.it.Phonenumber.trim())
          targetOrganizer.telephone = source.ContactInfos.it.Phonenumber.trim();
        else if(source.ContactInfos.en && source.ContactInfos.en.Phonenumber && source.ContactInfos.en.Phonenumber.trim())
          targetOrganizer.telephone = source.ContactInfos.en.Phonenumber.trim();
      }

      if(!targetOrganizer.id)
        console.log("NO ID!");

      if(inferredType.organization)
        targetOrganizer.category = "organization";
      else if (inferredType.person)
        targetOrganizer.category = "person";
      else
        targetOrganizer.category = "organization"; // TODO: decide how to handle cases like this.
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

      const match = sourceImage.ImageUrl.match(/ID=(.*)/i);
      if(match.length>=2)
        targetImage.id = match[1];
      else
        targetImage.id = sourceImage.ImageUrl;


      const imageFieldMapping = [
        ["ImageUrl","url"],
        // ["Width","width"],
        // ["Height","height"],
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
        // ["ImageTitle", "name"],
        ["ImageDesc", "description"],
      ];

      translateMultilingualFields(sourceImage, targetImage, imageMultilingualFieldMapping, languageMapping, true);

      const owner = createObject('Agent');
      owner.name.ita = owner.name.deu = owner.name.eng = sourceImage.CopyRight;
      targetImage.copyrightOwner = owner;
    }

    const outputFile = "output/"+target.id+".json";
    const outputContent = JSON.stringify(target, null, 2);

    fs.writeFile(outputFile, outputContent, function (err) {
      if (err) throw err;
    });

    var isValid = validate(target);

    if(isValid){
      console.log('OK: Event <'+target.id+'> is VALID.');
      results.valid++;
    }
    else {
      results.invalid++;
      console.log('WARNING: Event <'+target.id+'> is INVALID!');
      // console.log(JSON.stringify(validate.errors,null,2));
    }
  }
  catch(e){
    results.error++;
    console.log('ERROR: Event <'+source.id+'> could not be converted!');
    console.log(e);

  }

}

console.log("\nRESULTS:")
console.log("Generated "+results.valid+" VALID events.");
console.log("Generated "+results.invalid+" INVALID events.");
console.log("Failed to convert "+results.invalid+" events.");

// console.log(alpineBitsEvent);
