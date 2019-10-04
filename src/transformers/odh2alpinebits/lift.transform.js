const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Lift');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  // GetThereText exists.

  // Lift subtypes
  // { "_id" : "Sessellift", "count" : 174 }
  // { "_id" : "Seilbahn", "count" : 32 }
  // { "_id" : "Skibus", "count" : 4 }
  // { "_id" : "Förderband", "count" : 10 }
  // { "_id" : "Telemix", "count" : 4 }
  // { "_id" : "Standseilbahn/Zahnradbahn", "count" : 4 }
  // { "_id" : "no Subtype", "count" : 1 }
  // { "_id" : "Zug", "count" : 2 }
  // { "_id" : "Kabinenbahn", "count" : 12 }
  // { "_id" : "Schrägaufzug", "count" : 2 }
  // { "_id" : "Umlaufbahn", "count" : 72 }
  // { "_id" : "Unterirdische Bahn", "count" : 1 }
  // { "_id" : "Skilift", "count" : 112 }

  const geometry = transformGeometry(source.GpsInfo);
  target.geometries.push(geometry);

  return target;
}

function transformGeometry(points){
  let geometry = templates.createObject('LineString');
  points.forEach(point => {
    let newPoint = [];
    geometry.coordinates.push(newPoint);
    newPoint.push(point.Latitude);
    newPoint.push(point.Longitude);
    newPoint.push(point.Altitude);
  })
  return geometry;
}
