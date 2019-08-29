const fs = require('fs');

// const Ajv = require('ajv');
// let ajv = new Ajv();
// let schema = JSON.parse(fs.readFileSync('Event.schema.json'));
// let validate = ajv.compile(schema);

// let source = JSON.parse(fs.readFileSync('event1.json'));

let entry = JSON.parse(fs.readFileSync('input/events-with-image.json'));

const languageMapping = [
  ["it","ita"],
  ["en","eng"],
  ["de","deu"]
]

const text = {
  eng: null,
  ita: null,
  deu: null
};

const emptyEvent = {
  "@type": "Event",
  id: null,
  // name: { ...text },
  // shortName: { ...text },
  // description: { ...text },
  // abstract: { ...text },
  startDate: null,
  endDate: null,
  venues: []
}

const emptyImage = {
  "@type": "MediaObject",
  name: { ...text },
  description: { ...text },
  url: null,
  contentType: null,
  height: null,
  width: null,
  license: null,
  copyrightOwner: {
    "@type": "Agent",
    name: { ...text }
  }
}

// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
const translateMultilingualFields = (source, target, fieldMapping, languageMapping, isLanguageNested) => {
  // TODO: languageMapping and fieldMapping must be lists of
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(!target[targetField])
        target[targetField] = {}

      if(isLanguageNested && source[sourceField])
        target[targetField][targetLanguage] = source[sourceField][sourceLanguage];
      else if (!isLanguageNested && source[sourceLanguage])
        target[targetField][targetLanguage] = source[sourceLanguage][sourceField];
    }
  }
}

const translateFields = (source, target, fieldMapping, valueMapping = {}) => {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;
    target[targetField] = valueMapping[sourceField] ? valueMapping[sourceField][source[sourceField]] : source[sourceField];
  }
}

for (source of entry.Items) {

  // TODO: create function to create empty objects. It is better to have fields with null values than to have missing fields.

  let target = JSON.parse(JSON.stringify(emptyEvent));

  const directMapping = [
    ["Id", "id"],
    ["LastChange", "lastUpdate"],
    ["DateBegin", "startDate"],
    ["DateEnd", "endDate"],
  ]

  translateFields(source, target, directMapping);

  // target.id = source.Id;

  // Metadata
  target.dataProvider = "http://tourism.opendatahub.bz.it/";
  // target.lastUpdate = source.LastChange;

  // Basic textual descriptions
  if(source.Detail) {

    const descriptionMapping = [
      ["Title", "name"],
      ["BaseText", "description"]
    ];

    translateMultilingualFields(source.Detail, target, descriptionMapping, languageMapping, false);

  }

  // Dates
  // TODO: multiple days
  // target.startDate = source.DateBegin;
  // target.endDate = source.DateEnd;

  // Venue
  let venue = {

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
    let targetImage = {}

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
  }

  if(target.multimediaDescriptions.length>0) {

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

}

// console.log(alpineBitsEvent);
