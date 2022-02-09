const fs = require("fs");
const _ = require("lodash");
const utils = require("./model/odh2destinationdata/utils");
const mappings = require("./model/mappings");
const odhEvents = require("/home/jcg/Event.json");//"./../events-1000.json");
const script = "";


const {Pool, Client} = require('pg');

const pool = new Pool({
host: "localhost",
database: "test_db",
user: "root",
password: "root",
port: "5433"
})

main();

async function main() {
  let insert;

  const dataSource = odhEvents.Items.slice(0, 9);

  console.log('OpenDatahub migration');
  console.log('Extracting Events...');
  const resources = dataSource.map((odhEvent) => mapResource(odhEvent, "events"));
  console.log('Events - Insert at table resource');
  insertResources = getInsertResources(resources);
  console.log(insertResources);
  //await executeSQLQuery(insertResources);
  //Inserting resource names
  console.log('Events - Insert at table names');
  const names = mapMultilingualAttribute(dataSource, 'Title', 'Detail');
  insertNames = getInsertMultilingualTable(names, 'names');
  //await executeSQLQuery(insertNames);
  console.log(insertNames);
  console.log('Events - Insert at table descriptions');
  const descriptions = mapMultilingualAttribute(dataSource, 'BaseText', 'Detail');
  insertDescriptions = insertNames = getInsertMultilingualTable(descriptions, 'descriptions');
  console.log(insertDescriptions);
  //await executeSQLQuery(insertDescriptions);
  console.log('Events - Insert at table short_names');
  const shortnames = mapMultilingualAttribute(dataSource, 'Header', 'Detail');
  insertShortNames = getInsertMultilingualTable(shortnames, 'short_names');
  console.log(insertShortNames);
  //await executeSQLQuery(insertDescriptions);
  console.log('Events - Insert at table abstracts');
  const abstracts = mapMultilingualAttribute(dataSource, 'SubHeader', 'Detail');
  insertAbstracts = getInsertMultilingualTable(abstracts, 'abstracts');
  console.log(insertAbstracts);
  //await executeSQLQuery(insertAbstracts);
  console.log('Events - Insert at table urls');
  const urls = mapMultilingualAttribute(dataSource, 'Url', 'ContactInfos');
  insertUrls = getInsertMultilingualTable(urls, 'urls');
  console.log(insertUrls);
  //await executeSQLQuery(insertUrls);
  

}

async function executeSQLQuery(query) {
  try {
    return await pool.query(query);
  }
  catch (error) {
    console.log(error.message);
  }
}

function checkQuotesSQL(input) {
  if (input != null) {
    input = input.replace( /[\r\n]+/gm, "" );;
    //input =  input.replace("'","''");
    input = input.replace( /'/g, "''");
    input = input.replace( /’/g, "’’");
    return input;
  }
  else
    return null;
}

function mapMultilingualAttribute(odhResource, field, extra) {
  const attributes = []

  for (const ev of odhResource) {
    const keys = Object.keys(ev.Detail);

    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev[extra][key][field]); 
      attribute.resourceId = ev.Id;
      //Filter inexistent fields
      if ((attribute.content != null) && (attribute.lang != null) && (attribute.resourceId != null)) {
        attributes.push(attribute);
      }
    }
  }
  
  return attributes;
}

function getInsertMultilingualTable(names, table) {
  let insert = "INSERT INTO "+table+" (resource_id, lang, content)\nVALUES\n";
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
