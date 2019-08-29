const fs = require('fs');

let data = JSON.parse(fs.readFileSync('events-all.json'));
const outputContent = JSON.stringify(data.Items, null, 2);

fs.writeFile('events-mongo.json', outputContent, function (err) {
  if (err) throw err;
});

// db.getCollection('events').distinct("Topics.TopicInfo")
// mongoimport --db opendatahub --collection events --file events-large.json --jsonArray
