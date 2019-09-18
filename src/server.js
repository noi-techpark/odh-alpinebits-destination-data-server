const express = require('express');
const cors = require('cors');
const errors = require('./messages/errors');

var app = express();

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

app.use( (req, res, next) => {
  //TODO: Add security layer
  next();
});

app.use( (req, res, next) => {
  //TODO: Add header validation layer
  next();
});

app.use( (req, res, next) => {
  res.setHeader("Content-Type", "application/vnd.api+json");
  res.json = (body) => res.send(JSON.stringify(body, null, 2));
  next();
});

require('./routes/home.route.js')(app);
require('./routes/event.route.js')(app);

app.get('*', (req, res) => {
  error = errors.notFound;
  res.json(error);
  res.status(error.status);
});

app.listen(8080, function () {
  console.log("App listening at http://localhost:%s", this.address().port);
})
