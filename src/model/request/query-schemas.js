const commaSeparatedStrings = {
  type: "string",
  pattern: "^\\w(\\w|-)*((,|.)\\w(\\w|-)*)*$",
};

const include = commaSeparatedStrings;

const random = {
  type: "string",
  pattern: "(^[1-9]$)|(^[1-4][0-9]$)|(^50$)",
};

const sort = {
  type: "string",
  pattern: "^-?\\w(\\w|-)*(((,-?)|.)\\w(\\w|-)*)*$",
};

const page = {
  type: "object",
  properties: {
    number: {
      type: "string",
      pattern: "^[1-9]([0-9])*$",
    },
    size: {
      type: "string",
      pattern: "^[1-9]([0-9])*$",
    },
  },
  additionalProperties: false,
  minProperties: 1,
};

const search = {
  oneOf: [
    {
      type: "string",
      minLength: 1,
    },
    {
      type: "object",
      additionalProperties: {
        type: "string",
        minLength: 1,
      },
    },
  ],
};

const filter = {
  type: "object",
  propertyNames: {
    pattern: "^\\w(\\w|-)*(.\\w(\\w|-)*)*$",
  },
  additionalProperties: {
    oneOf: [
      {
        type: "string",
      },
      {
        type: "object",
        propertyNames: {
          pattern: "^exists|eq|neq|in|nin|any|all|gt|gte|lt|lte|near|intersects|within|starts|ends|regex$",
        },
        additionalProperties: { type: "string" },
        minProperties: 1,
      },
    ],
  },
  minProperties: 1,
};

const fields = {
  type: "object",
  patternProperties: {
    "^agents|categories|events|eventSeries|features|lifts|mediaObjects|mountainAreas|snowparks|skiSlopes|venues$": commaSeparatedStrings,
  },
  additionalProperties: false,
  minProperties: 1,
};

const query = {
  type: "object",
  propertyNames: {
    pattern: "^include|fields|page|random|sort|filter|search$",
  },
};

module.exports = {
  query,
  include,
  random,
  sort,
  page,
  fields,
  search,
  filter,
};
