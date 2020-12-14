const {
  parseLanguageFilter,
  parseLastUpdateFilter,
  parseGeometriesFilter,
} = require("./common");

function getLiftFilterQuery(request) {
  const { filter } = request.query;
  let filtersArray = [];

  parseLanguageFilter(filter, filtersArray);
  parseCategoriesFilter(filter, filtersArray);
  parseLastUpdateFilter(filter, filtersArray);
  parseGeometriesFilter(filter, filtersArray);

  return filtersArray;
}

function parseCategoriesFilter(filter, filtersArray) {
  if (filter.categories && filter.categories.any) {
    const categories = filter.categories.any.split(",");
    filtersArray.push("activitytype=512&subtype=" + getCategoriesAsBitmask(categories));
  }
}

function getCategoriesAsBitmask(categories) {
  if (Array.isArray(categories)) {
    let categoriesMasks = categories.map((category) =>
      activitiesCategoriesMap.Aufstiegsanlagen[category]
        ? activitiesCategoriesMap.Aufstiegsanlagen[category]
        : 0
    );
    return categoriesMasks.reduce((totalMask, currentMask) =>
      !totalMask ? currentMask : totalMask | currentMask
    );
  }
}

// This map covers all activities types and subtypes organized by the "Parent" field
// The DestinationDate category values are then mapped to Bitmask values
const activitiesCategoriesMap = {
  // Types (no parent)
  "": {
    "odh/berg": 1, // :Berg
    "odh/radfahren": 2, // :Radfahren
    "odh/stadtrundgang": 4, // :Stadtrundgang
    "odh/pferdesport": 8, // :Pferdesport
    "odh/wandern": 16, // :Wandern
    "odh/laufen-und-fitness": 32, // :Laufen und Fitness
    "odh/loipen": 64, // :Loipen
    "odh/piste": 256, // :Piste
    "odh/aufstiegsanlagen": 512, // :Aufstiegsanlagen
  },
  // Aufstiegsanlagen (lifts)
  Aufstiegsanlagen: {
    "odh/nicht-definiert": 1, // Aufstiegsanlagen:nicht definiert
    "odh/seilbahn": 2, // Aufstiegsanlagen:Seilbahn
    "odh/umlaufbahn": 4, // Aufstiegsanlagen:Umlaufbahn
    "odh/kabinenbahn": 8, // Aufstiegsanlagen:Kabinenbahn
    "odh/unterirdische-bahn": 16, // Aufstiegsanlagen:Unterirdische Bahn
    "odh/sessellift": 32, // Aufstiegsanlagen:Sessellift
    "odh/skilift": 64, // Aufstiegsanlagen:Skilift
    "odh/schragaufzug": 128, // Aufstiegsanlagen:Schrägaufzug
    "odh/standseilbahn-zahnradbahn": 256, // Aufstiegsanlagen:Standseilbahn/Zahnradbahn
    "odh/telemix": 512, // Aufstiegsanlagen:Telemix
    "odh/forderband": 1024, // Aufstiegsanlagen:Förderband
    "odh/2er-sessellift-kuppelbar": 2048, // Aufstiegsanlagen:2er Sessellift kuppelbar
    "odh/3er-sessellift-kuppelbar": 4096, // Aufstiegsanlagen:3er Sessellift kuppelbar
    "odh/4er-sessellift-kuppelbar": 8192, // Aufstiegsanlagen:4er Sessellift kuppelbar
    "odh/6er-sessellift-kuppelbar": 16384, // Aufstiegsanlagen:6er Sessellift kuppelbar
    "odh/8er-sessellift-kuppelbar": 32768, // Aufstiegsanlagen:8er Sessellift kuppelbar
    "odh/klein-skilift": 65536, // Aufstiegsanlagen:Klein-Skilift
    "odh/skibus": 131072, // Aufstiegsanlagen:Skibus
    "odh/1er-sessellift-kuppelbar": 262144, // Aufstiegsanlagen:1er Sessellift kuppelbar
    "odh/zug": 524288, // Aufstiegsanlagen:Zug
    "odh/weitere-aufstiegsanlagen": 1048576, // Aufstiegsanlagen:Weitere Aufstiegsanlagen

    "alpinebits/cablecar": 2, // 'Seilbahn' (2)
    "alpinebits/gondola": 12, // 'Kabinenbahn' (8) or 'Umlaufbahn' (4)
    "alpinebits/skilift": 64, // 'Skilift' (64)
    "alpinebits/funicular": 400, // 'Standseilbahn/Zahnradbahn' (256) or 'Schrägaufzug' (128) or 'Unterirdische Bahn' (16)
    "alpinebits/chairlift": 544, // 'Sessellift' (32) or 'Telemix' (512)
    "alpinebits/magic-carpet": 1024, // 'Förderband' (1024)
    "alpinebits/skibus": 655360, // 'Skibus' (131072) or 'Zug' (524288)
  },
  // Berg
  Berg: {
    "odh/alpinklettern": 1, // Berg:Alpinklettern
    "odh/bergtouren": 2, // Berg:Bergtouren
    "odh/hochtouren": 4, // Berg:Hochtouren
    "odh/klettersteige": 8, // Berg:Klettersteige
    "odh/schneeschuhtouren": 16, // Berg:Schneeschuhtouren
    "odh/skitouren": 32, // Berg:Skitouren
    "odh/weitere-berge": 64, // Berg:Weitere Berge
    "odh/eisklettern": 128, // Berg:Eisklettern
    "odh/eistour": 256, // Berg:Eistour
  },
  // LaufenundFitness
  LaufenundFitness: {
    "odh/berglaufe": 1, // LaufenundFitness:Bergläufe
    "odh/fitnessparcours": 2, // LaufenundFitness:Fitnessparcours
    "odh/innline-skating": 4, // LaufenundFitness:Innline Skating
    "odh/laufstrecken": 8, // LaufenundFitness:Laufstrecken
    "odh/nordic-walkings": 16, // LaufenundFitness:Nordic Walkings
    "odh/trail-running": 32, // LaufenundFitness:Trail running
    "odh/weitere-laufen-und-fitness": 64, // LaufenundFitness:Weitere Laufen und Fitness
  },
  // Loipen
  Loipen: {
    "odh/klassisch": 1, // Loipen:Klassisch
    "odh/skating": 2, // Loipen:Skating
    "odh/klassisch-und-skating": 4, // Loipen:Klassisch und Skating
  },
  // Pferdesport
  Pferdesport: {
    "odh/trail-für-kutschenfahrten": 1, // Pferdesport:Trail für Kutschenfahrten
    "odh/trail-für-reitpferde": 2, // Pferdesport:Trail für Reitpferde
    "odh/weitere-pferde": 4, // Pferdesport:Weitere Pferde
  },
  // Piste
  Piste: {
    "odh/ski-alpin": 2, // Piste:Ski alpin
    "odh/snowpark": 4, // Piste:Snowpark
    "odh/rundkurs": 8, // Piste:Rundkurs
    "odh/weitere-pisten": 16, // Piste:Weitere Pisten
  },
  // Radfahren
  Radfahren: {
    "odh/downhills": 1, // Radfahren:Downhills
    "odh/e-bikes": 2, // Radfahren:E-Bikes
    "odh/fernradwege": 4, // Radfahren:Fernradwege
    "odh/mountainbikes": 8, // Radfahren:Mountainbikes
    "odh/mountainbike-transalps": 16, // Radfahren:Mountainbike Transalps
    "odh/radtouren": 32, // Radfahren:Radtouren
    "odh/rennrader": 64, // Radfahren:Rennräder
    "odh/weitere-radfahren": 128, // Radfahren:Weitere Radfahren
    "odh/pumptrack": 256, // Radfahren:Pumptrack
    "odh/singletrail---freeride": 512, // Radfahren:Singletrail / Freeride
  },
  // Rodelbahnen
  Rodelbahnen: {
    "odh/schienenrodelbahn": 1, // Rodelbahnen:Schienenrodelbahn
    "odh/eisbahnen": 2, // Rodelbahnen:Eisbahnen
    "odh/rodelbahnen": 4, // Rodelbahnen:Rodelbahnen
    "odh/schneebahnen": 8, // Rodelbahnen:Schneebahnen
    "odh/weitere-rodeln": 16, // Rodelbahnen:Weitere Rodeln
  },
  // Stadtrundgang
  Stadtrundgang: {
    "odh/ortstouren": 1, // Stadtrundgang:Ortstouren
    "odh/weitere-ortstouren": 2, // Stadtrundgang:Weitere Ortstouren
  },
  // Wandern
  Wandern: {
    "odh/barrierefrei": 1, // Wandern:Barrierefrei
    "odh/familienwanderungen": 2, // Wandern:Familienwanderungen
    "odh/fernwanderwege": 4, // Wandern:Fernwanderwege
    "odh/pilgerwege": 8, // Wandern:Pilgerwege
    "odh/schneeschuhwanderungen": 16, // Wandern:Schneeschuhwanderungen
    "odh/themenwanderungen": 32, // Wandern:Themenwanderungen
    "odh/winterwanderungen": 64, // Wandern:Winterwanderungen
    "odh/kinderwagen-tauglich": 128, // Wandern:Kinderwagen tauglich
    "odh/waalweg": 256, // Wandern:Waalweg
    "odh/weitere-wandern": 512, // Wandern:Weitere Wandern
  },
};

module.exports = {
  getLiftFilterQuery,
};
