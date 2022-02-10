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

  //Creating Publisher
  const publisher = {}
  publisher.id = "publisher",
  publisher.odh_id = null,
  publisher.type = "agent",
  publisher.data_provider = "http://tourism.opendatahub.bz.it/",
  publisher.last_update = new Date().toISOString(),
  publisher.created_at = new Date().toISOString(),
  publisher.simple_url = "https://lts.it",
  publisher.name = [
    {
      lang: 'de',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    },
    {
      lang: 'en',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    },
    {
      lang: 'it',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    }];

  let publishers = [];
  publishers.push(publisher);
  console.log('OpenDatahub migration');
  console.log('Creating default Db Entries...')
  //Creating publisher entry on resource and name tables
  //let insertPublisher = getInsertResources(publishers);
  let insertPublisherAgent = getInsertAgents(publishers);
  let insertPublisherName = getInsertMultilingualTable(publisher.name, 'names');
  //console.log(insertPublisher);
  console.log(insertPublisherAgent);
  console.log(insertPublisherName);

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
    const lang = name.lang ? `'${mappings.iso6391to6393[name.lang]}'` : null;
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

function mapEvents(odhResource) {
  const event = {};

/*  event.id = odhResource.Id;
  event.capacity = null
  event.endDate = 
  event.startDate = 
  event.parent_id = 
  event.publisher_id = 
  event.status = 
*/

  return resource;
}

function getInsertEvents(events) {
  
  let insert = "INSERT INTO events (id, capacity, end_date, start_date, parent_id, publisher_id, status)\nVALUES\n";
  const length = events?.length;

  events?.forEach((event, index) => {
    const id = event.id ? `'${event.id}'` : null;
    const capacity = event.capacity ? `'${event.capacity}'` : null;
    const end_date = event.end_date ? `'${event.end_date}'` : null;
    const start_date = event.start_date ? `'${event.start_date}'` : null;
    const parent_id = event.parent_id ? `'${event.parent_id}'` : null;
    const publisher_id = event.publisher_id ? `'${event.publisher_id}'` : null;
    const status = event.status ? `'${event.status}'` : null;
    
    insert += `(${id}, ${capacity}, ${end_date}, ${start_date}, ${parent_id}, 
                ${publisher_id}, ${status})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}

function mapAgents(odhAgent) {
  const agent = {};

  agent.id = odhAgent.id;
  const odh_id = resource.odh_id ? `'${resource.odh_id}'` : null;
  const type = resource.type ? `'${resource.type}'` : null;
  const data_provider = resource.data_provider ? `'${resource.data_provider}'` : null;
  const last_update = resource.last_update ? `'${resource.last_update}'` : null;
  const created_at = resource.created_at ? `'${resource.created_at}'` : null;
  const simple_url = resource.simple_url ? `'${resource.simple_url}'` : null;
  return agent;
}

function getInsertAgents(agents) {
  let insertAgents = 
  "INSERT INTO agents (id)\nVALUES\n";
  const length = agents?.length;

  agents?.forEach((agent, index) => {
    const id = agent.id ? `'${agent.id}'` : null;
    
    insertAgents += `(${id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  let insertResources = 
  "INSERT INTO resources (id,odh_id,type,data_provider,last_update,created_at,simple_url)\nVALUES\n";

  agents?.forEach((agent, index) => {
    const id = agent.id ? `'${agent.id}'` : null;
    const odh_id = agent.odh_id ? `'${agent.odh_id}'` : null;
    const type = agent.type ? `'${agent.type}'` : null;
    const data_provider = agent.data_provider ? `'${agent.data_provider}'` : null;
    const last_update = agent.last_update ? `'${agent.last_update}'` : null;
    const created_at = agent.created_at ? `'${agent.created_at}'` : null;
    const simple_url = agent.simple_url ? `'${agent.simple_url}'` : null;    
    
    insertResources += `(${id},${odh_id},${type},${data_provider},${last_update},${created_at},${simple_url})${
      length - 1 > index ? "," : ";"
    }\n`;
  });  
  
  let insert = insertResources + "\n" + insertAgents;
  
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
