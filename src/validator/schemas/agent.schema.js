module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://www.alpinebits.org/schemas/v1/general/Agent",
  "title": "Agent",
  "type": "object",
  "required": [
    "@type"
  ],
  "properties": {
    "@type": {
      "const": "Agent"
    },
    "id": {
      "type": "string",
      "minLength": 1
    },
    "name": {
      "$ref": "#/definitions/text"
    },
    "shortName": {
      "$ref": "#/definitions/text"
    },
    "abstract": {
      "$ref": "#/definitions/text"
    },
    "description": {
      "$ref": "#/definitions/text"
    },
    "url": {
      "$ref": "#/definitions/url"
    },
    "category": {
      "type": "string",
      "enum": [
        "person",
        "organization"
      ]
    },
    "contacts": {
      "type": "array",
      "minItems": 1,
      "items": {
        "title": "Contact Point",
        "type": "object",
        "required": [
          "@type"
        ],
        "properties": {
          "@type": {
            "const": "ContactPoint"
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "name": {
            "$ref": "#/definitions/text"
          },
          "shortName": {
            "$ref": "#/definitions/text"
          },
          "abstract": {
            "$ref": "#/definitions/text"
          },
          "description": {
            "$ref": "#/definitions/text"
          },
          "url": {
            "$ref": "#/definitions/url"
          },
          "email": {
            "format": "email",
            "type": "string"
          },
          "telephone": {
            "type": "string"
          },
          "address": {
            "$ref": "#/definitions/address"
          },
          "availableHours": {
            "$ref": "#/definitions/hoursSpecification"
          }
        },
        "anyOf": [
          {
            "required": [
              "telephone"
            ]
          },
          {
            "required": [
              "email"
            ]
          },
          {
            "required": [
              "address"
            ]
          }
        ]
      }
    }
  },
  "anyOf": [
    {
      "required": [
        "url"
      ]
    },
    {
      "required": [
        "name"
      ]
    }
  ],
  "definitions": {
    "text": {
      "patternProperties": {
        "": {
          "type": "string"
        }
      },
      "type": "object",
      "propertyNames": {
        "type": "string",
        "enum": [
          "eng",
          "ita",
          "deu",
          "lld"
        ]
      }
    },
    "url": {
      "oneOf": [
        {
          "type": "string",
          "format": "uri"
        },
        {
          "patternProperties": {
            "": {
              "type": "string",
              "format": "uri"
            }
          },
          "type": "object",
          "propertyNames": {
            "type": "string",
            "enum": [
              "eng",
              "ita",
              "deu",
              "lld"
            ]
          }
        }
      ]
    },
    "address": {
      "title": "Address",
      "type": "object",
      "required": [
        "@type",
        "city",
        "country"
      ],
      "properties": {
        "@type": {
          "const": "Address"
        },
        "category": {
          "type": "string"
        },
        "street": {
          "$ref": "#/definitions/text"
        },
        "city": {
          "$ref": "#/definitions/text"
        },
        "region": {
          "$ref": "#/definitions/text"
        },
        "zipcode": {
          "type": "string"
        },
        "complement": {
          "$ref": "#/definitions/text"
        },
        "country": {
          "description": "A two-letter country code as defined in the ISO 3166.",
          "type": "string",
          "enum": [
            "IT",
            "DE",
            "AU"
          ]
        }
      }
    },
    "hoursSpecification": {
      "title": "Hours Specification",
      "type": "object",
      "required": [
        "@type",
        "hours"
      ],
      "properties": {
        "@type": {
          "const": "HoursSpecification"
        },
        "validFrom": {
          "type": "string",
          "format": "date"
        },
        "validTo": {
          "type": "string",
          "format": "date"
        },
        "daysOfWeek": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "enum": [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday"
            ]
          }
        },
        "hours": {
          "type": "array",
          "minItems": 1,
          "items": {
            "required": [
              "opens",
              "closes"
            ],
            "properties": {
              "opens": {
                "type": "string",
                "format": "time"
              },
              "closes": {
                "type": "string",
                "format": "time"
              }
            }
          }
        }
      }
    }
  }
}
