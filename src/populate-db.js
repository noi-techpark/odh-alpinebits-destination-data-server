const fs = require("fs");
const _ = require("lodash");
const eventTransform = require("./model/odh2destinationdata/event_transform");
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
  console.log('--OpenDatahub migration');
  console.log('--Creating default Db Entries...')
  //Creating publisher entry on resource and name tables
  //let insertPublisher = getInsertResources(publishers);
  let insertPublisherAgent = getInsertAgents(publishers);
  let insertPublisherName = getInsertMultilingualTable(publisher.name, 'names');
  //console.log(insertPublisher);
  console.log(insertPublisherAgent);
  console.log(insertPublisherName);
  console.log('--Extracting Events...');
  const resources = dataSource.map((odhEvent) => mapResource(odhEvent, "events"));
  console.log('--Events - Insert at table resource');
  insertResources = getInsertResources(resources);
  console.log(insertResources);
  //await executeSQLQuery(insertResources);
  //Inserting resource names
  console.log('--Events - Insert at table names');
  const names = mapMultilingualAttribute(dataSource, 'Title', 'Detail');
  insertNames = getInsertMultilingualTable(names, 'names');
  //await executeSQLQuery(insertNames);
  console.log(insertNames);
  console.log('--Events - Insert at table descriptions');
  const descriptions = mapMultilingualAttribute(dataSource, 'BaseText', 'Detail');
  insertDescriptions = insertNames = getInsertMultilingualTable(descriptions, 'descriptions');
  console.log(insertDescriptions);
  //await executeSQLQuery(insertDescriptions);
  console.log('--Events - Insert at table short_names');
  const shortnames = mapMultilingualAttribute(dataSource, 'Header', 'Detail');
  insertShortNames = getInsertMultilingualTable(shortnames, 'short_names');
  console.log(insertShortNames);
  //await executeSQLQuery(insertDescriptions);
  console.log('--Events - Insert at table abstracts');
  const abstracts = mapMultilingualAttribute(dataSource, 'SubHeader', 'Detail');
  insertAbstracts = getInsertMultilingualTable(abstracts, 'abstracts');
  console.log(insertAbstracts);
  //await executeSQLQuery(insertAbstracts);
  console.log('--Events - Insert at table urls');
  const urls = mapMultilingualAttribute(dataSource, 'Url', 'ContactInfos');
  insertUrls = getInsertMultilingualTable(urls, 'urls');
  console.log(insertUrls);
  //await executeSQLQuery(insertUrls);
  console.log('--Events - Insert Event data at table Events');
  const events = dataSource.map((event) => mapEvent(event));
  //const events = mapEvents(dataSource);
  insertEvents = getInsertEvents(events);
  console.log(insertEvents);
  //await executeSQLQuery(insertEvents);

  
  console.log('--Events - Insert Event Organizers at table Agents');
  const organizers = dataSource.map((organizer) => mapAgent(organizer));
  insertOrganizers = getInsertAgents(organizers);
  console.log(insertOrganizers);
  console.log('--Events - Insert Organizer name at multilingual tables');
  const organizerNames = mapMultilingualAttributeOrganizer(dataSource,'CompanyName');
  const insertOrganizerNames = (getInsertMultilingualTable(organizerNames, 'names'));
  console.log(insertOrganizerNames);
  console.log('--Events - Insert Organizer Url at multilingual tables');
  const organizerUrls = mapMultilingualAttributeOrganizer(dataSource,'Url');
  const insertOrganizerUrls = (getInsertMultilingualTable(organizerUrls, 'urls'));
  console.log(insertOrganizerUrls);
  //await executeSQLQuery(insertOrganizers);
  console.log('--Events - Insert Event Location at table Venues');
  const venues = dataSource.map((venue) => mapVenue(venue));
  insertVenues = getInsertVenues(venues)
  console.log(insertVenues);
  //await executeSQLQuery(insertVenues);
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

function mapMultilingualAttributeOrganizer(odhData, field) {
  const attributes = []

  for (const ev of odhData) {
    const keys = Object.keys(ev.OrganizerInfos);
    //console.log(ev[keys[0]]);

    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev.OrganizerInfos[key][field]); 
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

function mapEvent(odhData) {
  const event = {};
  event.id = odhData.Id;
  event.capacity = null;
  event.endDate = odhData['DateBegin'];
  event.startDate = odhData['DateEnd'];
  event.parentId = null;
  event.publisherId = "publisher";
  //Active boolean field in Opendatahub for events
  event.status = odhData.Active ? `'${"Published"}` : `'${"Disabled"}`;

  return event;
}

function getInsertEvents(events) {
  
  let insert = "INSERT INTO events (id, capacity, end_date, start_date, parent_id, publisher_id, status)\nVALUES\n";
  const length = events?.length;

  events?.forEach((event, index) => {
    const id = event.id;
    const capacity = event.capacity;
    //const end_date = event.endDate;
    const end_date = event.endDate.replace(/Z/g, "") + "+01:00"
    const start_date = event.startDate.replace(/Z/g, "") + "+01:00";
    const parent_id = event.parentId;
    const publisher_id = event.publisherId;
    const status = event.status;
    
    insert += `(${id}, ${capacity}, ${end_date}, ${start_date}, ${parent_id}, 
                ${publisher_id}, ${status})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}

function mapVenue (odhData) {
  const venue = {};

  venue.eventId = odhData.Id;
  venue.id = odhData.Id+"_venue";
  
  return venue;
}

//Create insert string for venues table
function getInsertVenues(venues) {
  let insertVenues = 
  "INSERT INTO venues (id)\nVALUES\n";
  const length = venues?.length;

  venues?.forEach((venue, index) => {
    const id = venue.id ? `'${venue.id}'` : null;
    
    insertVenues += `(${id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  //Create insert string for resources table
  let insertResources = 
  "INSERT INTO resources (id,odh_id,type,data_provider,last_update,created_at,simple_url)\nVALUES\n";

  venues?.forEach((venue, index) => {
    const id = venue.id;
    const odh_id = null;
    const type = 'venues';
    const data_provider = "http://tourism.opendatahub.bz.it/";
    const last_update = new Date().toISOString();
    const created_at = new Date().toISOString();
    const simple_url = venue.simple_url ? `'${venue.simple_url}'` : null;    
    
    insertResources += `(${id},${odh_id},${type},${data_provider},${last_update},${created_at},${simple_url})${
      length - 1 > index ? "," : ";"
    }\n`;
  });  
  
  let insertEventVenues =
  "INSERT INTO event_venues (venue_id, event_id)\nVALUES\n";
  
  venues?.forEach((venue, index) => {
    const venue_id = venue.id;
    const event_id = venue.eventId;
    
    insertEventVenues += `(${venue_id},${event_id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  let insert = insertResources + "\n" + insertVenues + "\n" + insertEventVenues;
  
  return insert;
}

function mapAgent(odhData, agentType) {
  
  const agent = {};

  agent.id = odhData.Id+"_organizer",
  agent.odh_id = null,
  agent.type = "agents",
  agent.data_provider = "http://tourism.opendatahub.bz.it/",
  agent.last_update = new Date().toISOString(),
  agent.created_at = new Date().toISOString(),
  agent.simple_url = null;

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
    const id = agent.id;
    const odh_id = agent.odh_id;
    const type = agent.type;
    const data_provider = agent.data_provider;
    const last_update = agent.last_update;
    const created_at = agent.created_at;
    const simple_url = agent.simple_url;    
    
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
