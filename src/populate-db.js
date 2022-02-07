const fs = require("fs");
const _ = require("lodash");
const utils = require("./model/odh2destinationdata/utils");
const mappings = require("./model/mappings");
const odhEvents = require("/home/jcg/Event.json");//"./../events-1000.json");
const script = "";

main();

function main() {
  let insert;

  const resources = odhEvents.Items.slice(0, 9).map((odhEvent) => mapResource(odhEvent, "events"));
  insert = getInsertResources(resources);
  //console.log(insert);
  //Inserting resource names
  //insert = getInsertResourceNames(resources);
  let names = mapResourceNames(odhEvents.Items.slice(0, 9));
  insert = getInsertResourceNames(names);
  console.log(insert);

}

function checkQuotesSQL(input) {
  return input.replace("'","''");
}

function mapResourceNames(odhResource) {
  //const names = {};
  const names = []
  for (const ev of odhResource) {
    const keys = Object.keys(ev.Detail);

    for (const key of keys) {
      let name = {};
      name.lang = key;
      name.content = checkQuotesSQL(ev.Detail[key].Title);
      name.resourceId = ev.Id;
      names.push(name);
    }
  }
  
  return names;
}

function getInsertResourceNames(names) {
  let insert = "INSERT INTO names (resource_id, lang, content)\nVALUES\n";
  const length = names?.length;
  names?.forEach((name, index) => {
    const id = name.resourceId ? `'${name.resourceId}'` : null;
    //const lang = name.lang ? `'${utils.sanitizeAndConvertLanguageTags(name.lang)}'` : null;
    const lang = name.lang ? `'${mappings.iso6391to6393[name.lang]}'` : null;
    //const lang = name.lang ? `'${name.lang}'` : null;
    const content = name.content ? `'${name.content}'` : null;
    
    insert += `(${id}, ${lang}, ${content})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}

function mapResource(odhResource, type) {
  const resource = {};

  resource.id = odhResource.Id;
  resource.odh_id = odhResource.Id;
  resource.type = type;
  resource.data_provider = "http://tourism.opendatahub.bz.it/";
  resource.last_update = _.isString(odhResource.LastChange)
    ? odhResource.LastChange.replace(/Z/g, "") + "+01:00"
    : new Date().toISOString();
  resource.created_at = new Date().toISOString();
  resource.simple_url = hasSimpleUrl(odhResource) ? getSimpleUrl(odhResource) : null;

  return resource;
}

function getInsertResources(resources) {
  let insert = "INSERT INTO resources (id,odh_id,type,data_provider,last_update,created_at,simple_url)\nVALUES\n";
  const length = resources?.length;

  resources?.forEach((resource, index) => {
    const id = resource.id ? `'${resource.id}'` : null;
    const odh_id = resource.odh_id ? `'${resource.odh_id}'` : null;
    const type = resource.type ? `'${resource.type}'` : null;
    const data_provider = resource.data_provider ? `'${resource.data_provider}'` : null;
    const last_update = resource.last_update ? `'${resource.last_update}'` : null;
    const created_at = resource.created_at ? `'${resource.created_at}'` : null;
    const simple_url = resource.simple_url ? `'${resource.simple_url}'` : null;

    insert += `(${id},${odh_id},${type},${data_provider},${last_update},${created_at},${simple_url})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}


function hasSimpleUrl(odhResource) {
  // TODO: Implement
  return false;
}
function getSimpleUrl(odhResource) {
  // TODO: Implement
  return null;
}
