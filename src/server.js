const express = require('express');
const cors = require('cors');
const errors = require('./errors');
require('custom-env').env();

var app = express();

const corsOptions = {
  origin: process.env.REF_SERVER_CORS_ORIGIN,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

app.use( (req, res, next) => {
  //TODO: Add security layer
  //TODO: Add header validation layer
  console.log('> Request received: ' + process.env.REF_SERVER_URL + req.originalUrl);
  next();
});

app.use( (req, res, next) => {
  res.setHeader('Content-Type', 'application/vnd.api+json');
  res.json = (body) => res.send(JSON.stringify(body, null, 2));
  next();
});

require('./routes/home.route.js')(app);
require('./routes/events.route.js')(app);
require('./routes/lifts.route.js')(app);
require('./routes/snowparks.route.js')(app);

require('./routes/places.route.js')(app);
require('./routes/agents.route.js')(app);
require('./routes/media-objects.route.js')(app);
require('./routes/event-series.route.js')(app);

app.get('*', (req, res) => {
  errors.handleError(errors.notFound, req, res);
});

app.listen(process.env.REF_SERVER_PORT, function () {
  console.log('DestinationData API listening at %s', process.env.REF_SERVER_URL);
})
