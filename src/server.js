const express = require('express');
const cors = require('cors');

var app = express();

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

app.use(function(req, res, next) {
    res.setHeader("Content-Type", "application/vnd.api+json");
    next();
});

require('./routes/event.js')(app);

app.listen(8080, function () {
  console.log("App listening at http://localhost:%s", this.address().port);
})
