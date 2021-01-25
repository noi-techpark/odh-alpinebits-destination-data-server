const iso6391to6393 = {};

for (const [iso6393tag, iso6391tag] of Object.entries(
  require("iso-639-3/to-1.json")
)) {
  iso6391to6393[iso6391tag] = iso6393tag;
}

const eventCategoryToTopicId = {
  "schema:FoodEvent": "252200A028C8449D9A6205369A6D0D36", // 'Gastronomie/Typische Produkte'
  "schema:MusicEvent": "7E048074BA004EC58E29E330A9AA476B", // 'Musik/Tanz'
  "schema:Festival": "9C3449EE278C4D94AA5A7C286729DEA0", // 'Volksfeste/Festivals'
  "schema:SportsEvent": "162C0067811B477DA725D2F5F2D98398", // 'Sport'
  "schema:TheaterEvent": "6884FE362C88434B9F49725E3328112B", // 'Theater/Vorführungen'
  "schema:EducationEvent": "767F6F43FC394CE9A3C8A9725C6FF134", // 'Kurse/Bildung'
  "schema:BusinessEvent": "0D25868CC23242D6AC97AEB2973CB3D6", // 'Tagungen Vorträge'
  "schema:ChildrensEvent": "D98B49DF24C342D09A8161836435CF86", // 'Familie'
  "schema:VisualArts": "C72CE969B98947FABC99CBC7B033F28E", // 'Ausstellungen/Kunst'
  "odh:gastronomie-typische-produkte": "252200A028C8449D9A6205369A6D0D36", // 'Gastronomie/Typische Produkte'
  "odh:musik-tanz": "7E048074BA004EC58E29E330A9AA476B", // 'Musik/Tanz'
  "odh:volksfeste-festivals": "9C3449EE278C4D94AA5A7C286729DEA0", // 'Volksfeste/Festivals'
  "odh:sport": "162C0067811B477DA725D2F5F2D98398", // 'Sport'
  "odh:führungen-besichtigungen": "B5467FEFE5C74FA5AD32B83793A76165", // 'Führungen/Besichtigungen'
  "odh:theater-vorführungen": "6884FE362C88434B9F49725E3328112B", // 'Theater/Vorführungen'
  "odh:kurse-bildung": "767F6F43FC394CE9A3C8A9725C6FF134", // 'Kurse/Bildung'
  "odh:tagungen-vortrage": "0D25868CC23242D6AC97AEB2973CB3D6", // 'Tagungen Vorträge'
  "odh:familie": "D98B49DF24C342D09A8161836435CF86", // 'Familie'
  "odh:handwerk-brauchtum": "33BDC54BD39946F4852B3394B00610AE", // 'Handwerk/Brauchtum'
  "odh:messen-markte": "4C4961D9FC5B48EEB73067BEB9D4402A", // 'Messen/Märkte'
  "odh:wanderungen-ausflüge": "ACE8B613F2074A7BB59C0B1DD40A43CD", // 'Wanderungen/Ausflüge'
  "odh:ausstellungen-kunst": "C72CE969B98947FABC99CBC7B033F28E", // 'Ausstellungen/Kunst'
};

const eventCategoryToTopicBitmask = {
  "schema:BusinessEvent": 1,
  "schema:SportsEvent": 2,
  "schema:FoodEvent": 4,
  "schema:TheaterEvent": 32,
  "schema:EducationEvent": 64,
  "schema:MusicEvent": 128,
  "schema:Festival": 256,
  "schema:VisualArts": 2048,
  "schema:ChildrensEvent": 4096,
  "odh:tagungen-vortrage": 1,
  "odh:sport": 2,
  "odh:gastronomie-typische-produkte": 4,
  "odh:handwerk-brauchtum": 8,
  "odh:messen-markte": 16,
  "odh:theater-vorführungen": 32,
  "odh:kurse-bildung": 64,
  "odh:musik-tanz": 128,
  "odh:volksfeste-festivals": 256,
  "odh:wanderungen-ausflüge": 512,
  "odh:führungen-besichtigungen": 1024,
  "odh:ausstellungen-kunst": 2048,
  "odh:familie": 4096,
};

const eventTopicIdToAlpineBitsCategories = {
  "252200A028C8449D9A6205369A6D0D36": "schema:FoodEvent",
  "7E048074BA004EC58E29E330A9AA476B": "schema:MusicEvent",
  "9C3449EE278C4D94AA5A7C286729DEA0": "schema:Festival",
  "162C0067811B477DA725D2F5F2D98398": "schema:SportsEvent",
  "6884FE362C88434B9F49725E3328112B": "schema:TheaterEvent",
  "767F6F43FC394CE9A3C8A9725C6FF134": "schema:EducationEvent",
  "0D25868CC23242D6AC97AEB2973CB3D6": "schema:BusinessEvent",
  D98B49DF24C342D09A8161836435CF86: "schema:ChildrensEvent",
  C72CE969B98947FABC99CBC7B033F28E: "schema:VisualArts",
};

const eventTopicIdToODHCategories = {
  "252200A028C8449D9A6205369A6D0D36": "odh:gastronomie-typische-produkte",
  "7E048074BA004EC58E29E330A9AA476B": "odh:musik-tanz",
  "9C3449EE278C4D94AA5A7C286729DEA0": "odh:volksfeste-festivals",
  "162C0067811B477DA725D2F5F2D98398": "odh:sport",
  B5467FEFE5C74FA5AD32B83793A76165: "odh:führungen-besichtigungen",
  "6884FE362C88434B9F49725E3328112B": "odh:theater-vorführungen",
  "767F6F43FC394CE9A3C8A9725C6FF134": "odh:kurse-bildung",
  "0D25868CC23242D6AC97AEB2973CB3D6": "odh:tagungen-vortrage",
  D98B49DF24C342D09A8161836435CF86: "odh:familie",
  "33BDC54BD39946F4852B3394B00610AE": "odh:handwerk-brauchtum",
  "4C4961D9FC5B48EEB73067BEB9D4402A": "odh:messen-markte",
  ACE8B613F2074A7BB59C0B1DD40A43CD: "odh:wanderungen-ausflüge",
  C72CE969B98947FABC99CBC7B033F28E: "odh:ausstellungen-kunst",
};

const eventCategoryInOdhToSchemaOrg = {
  "odh:tagungen-vortrage": "schema:BusinessEvent",
  "odh:sport": "schema:SportsEvent",
  "odh:gastronomie-typische-produkte": "schema:FoodEvent",
  "odh:handwerk-brauchtum": null,
  "odh:messen-markte": null,
  "odh:theater-vorführungen": "schema:TheaterEvent",
  "odh:kurse-bildung": "schema:EducationEvent",
  "odh:musik-tanz": "schema:MusicEvent",
  "odh:volksfeste-festivals": "schema:Festival",
  "odh:wanderungen-ausflüge": null,
  "odh:führungen-besichtigungen": null,
  "odh:ausstellungen-kunst": "schema:VisualArts",
  "odh:familie": "schema:ChildrensEvent",
};

const eventCategoryInSchemaOrgToOdh = {
  "schema:BusinessEvent": "odh:tagungen-vortrage",
  "schema:SportsEvent": "odh:sport",
  "schema:FoodEvent": "odh:gastronomie-typische-produkte",
  "schema:TheaterEvent": "odh:theater-vorführungen",
  "schema:EducationEvent": "odh:kurse-bildung",
  "schema:MusicEvent": "odh:musik-tanz",
  "schema:Festival": "odh:volksfeste-festivals",
  "schema:VisualArts": "odh:ausstellungen-kunst",
  "schema:ChildrensEvent": "odh:familie",
};

const eventCategoryToNamespace = {
  "schema:BusinessEvent": "schema",
  "schema:SportsEvent": "schema",
  "schema:FoodEvent": "schema",
  "schema:TheaterEvent": "schema",
  "schema:EducationEvent": "schema",
  "schema:MusicEvent": "schema",
  "schema:Festival": "schema",
  "schema:VisualArts": "schema",
  "schema:ChildrensEvent": "schema",
  "odh:tagungen-vortrage": "odh",
  "odh:sport": "odh",
  "odh:gastronomie-typische-produkte": "odh",
  "odh:handwerk-brauchtum": "odh",
  "odh:messen-markte": "odh",
  "odh:theater-vorführungen": "odh",
  "odh:kurse-bildung": "odh",
  "odh:musik-tanz": "odh",
  "odh:volksfeste-festivals": "odh",
  "odh:wanderungen-ausflüge": "odh",
  "odh:führungen-besichtigungen": "odh",
  "odh:ausstellungen-kunst": "odh",
  "odh:familie": "odh",
};

const eventCategoryToUrl = {
  "schema:BusinessEvent": {
    eng: "https://schema.org/BusinessEvent",
  },
  "schema:SportsEvent": {
    eng: "https://schema.org/SportsEvent",
  },
  "schema:FoodEvent": {
    eng: "https://schema.org/FoodEvent",
  },
  "schema:TheaterEvent": {
    eng: "https://schema.org/TheaterEvent",
  },
  "schema:EducationEvent": {
    eng: "https://schema.org/EducationEvent",
  },
  "schema:MusicEvent": {
    eng: "https://schema.org/MusicEvent",
  },
  "schema:Festival": {
    eng: "https://schema.org/Festival",
  },
  "schema:VisualArts": {
    eng: "https://schema.org/VisualArts",
  },
  "schema:ChildrensEvent": {
    eng: "https://schema.org/ChildrensEvent",
  },
  "odh:tagungen-vortrage": null,
  "odh:sport": null,
  "odh:gastronomie-typische-produkte": null,
  "odh:handwerk-brauchtum": null,
  "odh:messen-markte": null,
  "odh:theater-vorführungen": null,
  "odh:kurse-bildung": null,
  "odh:musik-tanz": null,
  "odh:volksfeste-festivals": null,
  "odh:wanderungen-ausflüge": null,
  "odh:führungen-besichtigungen": null,
  "odh:ausstellungen-kunst": null,
  "odh:familie": null,
};

module.exports = {
  eventTopicIdToAlpineBitsCategories,
  eventTopicIdToODHCategories,
  eventCategoryToTopicId,
  eventCategoryToTopicBitmask,
  eventCategoryInOdhToSchemaOrg,
  eventCategoryInSchemaOrgToOdh,
  eventCategoryToNamespace,
  eventCategoryToUrl,
  iso6391to6393,
};
