const axios = require("axios");
const { config } = require("custom-env");

let insertid = '';
let connection;
//Setup database connection
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    port: "5433",
    user: "root",
    password: "root",
    database: "test_db"
  },
  pool: { min: 1, max: 1 } 
});


async function getEventsData() {
    const response = await axios.get("http://localhost:8080/2021-04/events");
    return response.data.data;
}

/*async function insertEventData(trx, eventData) {
  //console.log(eventData.meta.lastUpdate);
  try {
    const insert_content = [
      { //id: '71422793-9b87-4b28-8bea-ff50f5d221c6', 
        type: 'events', 
        odh_id: eventData.id,//'9D9A19457E38402A8589D42546D44747', 
        data_provider: eventData.meta.dataProvider,//'http://tourism.opendatahub.bz.it/', 
        created_at: knex.fn.now(),//'2018-05-17T14:24:28.9250366+01:00', 
        last_update: eventData.meta.lastUpdate,//'2018-05-17T14:24:28.9250366+01:00',
        simple_url: eventData.links.self }];//'http://www.forum-brixen.com'}];
    await knex("resources").insert(insert_content).transacting(trx);
    //await trx.commit();
  } 
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}  
*/

async function insertResourceData(trx, resData) {
  try {
    const insert_content = [
      { type: resData.type, 
        odh_id: resData.id,
        data_provider: resData.meta.dataProvider,
        created_at: knex.fn.now(),
        last_update: resData.meta.lastUpdate,
        simple_url: resData.links.self }];
    return knex("resources").insert(insert_content).transacting(trx).returning('id');
    //trx.commit();
  } 
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}  

async function insertAbstractData(trx, abstractData, resid) {
  let temparray = [];
  try {
    //Check abstract not null
    //console.log(abstractData);
    if ( abstractData != null ) {
        for (const key of Object.keys(abstractData)) {
          temparray.push({
            lang: key,
            resource_id: resid,
            content: abstractData[key]  
          })
        }
        console.log(temparray);
        return knex("abstracts").insert(temparray).transacting(trx);
      }
    }
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}

async function insertDescriptionData(trx, descriptionData, resid) {
  let temparray = [];
  try {
    //Check abstract not null
    //console.log(descriptionData);
    if ( descriptionData != null ) {
        for (const key of Object.keys(descriptionData)) {
          temparray.push({
            lang: key,
            resource_id: resid,
            content: descriptionData[key]  
          })
        }
        //console.log(temparray[0]);
        return knex("descriptions").insert(temparray).transacting(trx);
      }
    }
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}

async function insertNameData(trx, nameData, resid) {
  let temparray = [];
  try {
    //Check abstract not null
    //console.log(nameData);
    if ( nameData != null ) {
        for (const key of Object.keys(nameData)) {
          temparray.push({
            lang: key,
            resource_id: resid,
            content: nameData[key]  
          })
        }
        //console.log(temparray[0]);
        return knex("names").insert(temparray).transacting(trx);
      }
    }
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}

async function insertShortNameData(trx, shortNameData, resid) {
  let temparray = [];
  try {
    //Check abstract not null
    //console.log(shortNameData);
    if ( shortNameData != null ) {
        for (const key of Object.keys(Data)) {
          temparray.push({
            lang: key,
            resource_id: resid,
            content: shortNameData[key]  
          })
        }
        //console.log(temparray[0]);
        return knex("shortnames").insert(temparray).transacting(trx);
      }
    }
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}

async function insertUrlData(trx, urlData, resid) {
  let temparray = [];
  try {
    //Check url not null
    //console.log(urlData);
    if ( urlData != null ) {
        for (const key of Object.keys(urlData)) {
          temparray.push({
            lang: key,
            resource_id: resid,
            content: urlData[key]  
          })
        }
        //console.log(temparray[0]);
        return knex("urls").insert(temparray).transacting(trx);
      }
    }
  catch (error) {
    console.log(error);
    await trx.rollback();
  }
}

async function main() {
//Initialize database and transaction
const trx = await knex.transaction();
let ret = 0;
//const trx2 = await knex.transaction();
//Extract the API Json
odhData = await getEventsData();
for (const ev of odhData) {
  //console.log(ev.id);
  const resId = await insertResourceData(trx, ev);
  //console.log(resId[0]);
  //trx.commit();
  //await insertAttributeData(trx, ev.attributes, resId[0]);
  await insertAbstractData(trx, ev.attributes.abstract, resId[0]);
  await insertDescriptionData(trx, ev.attributes.description, resId[0]);
  //console.log(ret);
  await insertNameData(trx, ev.attributes.name, resId[0]);
  await insertShortNameData(trx, ev.attributes.shortname, resId[0]);
  await insertUrlData(trx, ev.attributes.url, resId[0]);
  //trx.commit();
  //console.log(Object.keys(ev.attributes.name));
  }
trx.commit();
knex.client.pool.destroy()
}   

try {
  main()
}
catch (error) {
  console.log(error);
}
