module.exports.createPoint = function (longitude, latitude, altitude) {
  const coordinates = [];

  if (longitude) coordinates.push(longitude);
  if (latitude) coordinates.push(latitude);
  if (altitude) coordinates.push(altitude);

  return {
    type: "Point",
    coordinates,
  };
};

module.exports.createPolygon = function () {
  const coordinates = [];

  return {
    type: "Polygon",
    coordinates,
  };
};

module.exports.createLineString = function (points) {
  return {
    type: "LineString",
    coordinates: points,
  };
};

module.exports.createHoursSpecification = function () {
  return {
    dailySchedules: null,
    weeklySchedules: null,
  };
};

module.exports.createOpeningWindow = function (opens, closes) {
  return {
    opens: opens || null,
    closes: closes || null,
  };
};

module.exports.createWeeklySchedule = function (validFrom, validTo) {
  return {
    validFrom,
    validTo,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };
};

module.exports.addDailySchedule = function (hourSpecification, date, openingWindows) {
  if (!hourSpecification.dailySchedules) {
    hourSpecification.dailySchedules = {};
  }

  hourSpecification.dailySchedules[date] = openingWindows;
};

module.exports.addWeeklySchedule = function (hourSpecification, weeklySchedule) {
  if (!hourSpecification.weeklySchedules) {
    hourSpecification.weeklySchedules = [];
  }

  hourSpecification.weeklySchedules.push(weeklySchedule);
};

// TODO: the default value for "country" was "IT", but that looks like a risky assumption, let's double-check it later
module.exports.createAddress = function () {
  return {
    street: null,
    city: null,
    region: null,
    country: null,
    complement: null,
    categories: null,
    zipcode: null,
  };
};

module.exports.createContactPoints = function (address, availableHours, email, telephone) {
  return {
    address: address ? address : null,
    availableHours: availableHours ? availableHours : null,
    email: email ? email : null,
    telephone: telephone ? telephone : null,
  };
};
