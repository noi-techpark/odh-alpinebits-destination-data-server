module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://www.alpinebits.org/schemas/v1/mountaindata/Trail",
  "title": "Trail",
  "type": "object",
  "required": [
    "@type",
    "id",
    "name"
  ],
  "properties": {
    "@type": {
      "const": "Trail"
    },
    "id": {
      "type": "string",
      "minLength": 1
    },
    "name": {
      "$ref": "#/definitions/textField"
    },
    "description": {
      "$ref": "#/definitions/textField"
    },
    "url": {
      "$ref": "#/definitions/url"
    },
    "multimediaDescriptions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/mediaObject"
      }
    },
    "address": {
      "$ref": "#/definitions/address"
    },
    "geometries": {
      "type": "array",
      "items": {
        "title": "Geometry",
        "oneOf": [
          {
            "title": "Point",
            "type": "object",
            "properties": {
              "@type": {
                "const": "Point"
              },
              "coordinates": {
                "type": "array",
                "minItems": 2,
                "items": {
                  "type": "number"
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "LineString",
            "type": "object",
            "properties": {
              "@type": {
                "const": "LineString"
              },
              "coordinates": {
                "type": "array",
                "minItems": 2,
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "number"
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "Polygon",
            "type": "object",
            "properties": {
              "@type": {
                "const": "Polygon"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 4,
                  "items": {
                    "type": "array",
                    "minItems": 2,
                    "items": {
                      "type": "number"
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiPoint",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiPoint"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "number"
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiLineString",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiLineString"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "array",
                    "minItems": 2,
                    "items": {
                      "type": "number"
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiPolygon",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiPolygon"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "items": {
                    "type": "array",
                    "minItems": 4,
                    "items": {
                      "type": "array",
                      "minItems": 2,
                      "items": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          }
        ]
      }
    },
    "howToArrive": {
      "$ref": "#/definitions/text"
    },
    "connections": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "category": {
      "type": "string",
      "enum": [
        "ski-slope",
        "sledge-slope",
        "cross-country",
        "hiking",
        "mountain-bike",
        "climbing"
      ]
    },
    "length": {
      "type": "number"
    },
    "minAltitude": {
      "type": "number"
    },
    "maxAltitude": {
      "type": "number"
    },
    "openingHours": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/hoursSpecification"
      }
    }
  },
  "allOf": [
    {
      "if": {
        "required": [
          "category"
        ],
        "properties": {
          "category": {
            "const": "ski-slope"
          }
        }
      },
      "then": {
        "required": [
          "difficulty"
        ],
        "properties": {
          "difficulty": {
            "anyOf": [
              {
                "required": [
                  "eu"
                ]
              },
              {
                "required": [
                  "us"
                ]
              }
            ],
            "properties": {
              "eu": {
                "type": "string",
                "enum": [
                  "novice",
                  "beginner",
                  "intermediate",
                  "expert"
                ]
              },
              "us": {
                "type": "string",
                "enum": [
                  "beginner",
                  "beginner-intermediate",
                  "intermediate",
                  "intermediate-advanced",
                  "expert"
                ]
              }
            }
          }
        }
      }
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
          "en",
          "it",
          "de"
        ]
      }
    },
    "shortText": {
      "patternProperties": {
        "": {
          "type": "string",
          "maxLength": 48
        }
      },
      "type": "object",
      "propertyNames": {
        "type": "string",
        "enum": [
          "en",
          "it",
          "de"
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
              "en",
              "it",
              "de"
            ]
          }
        }
      ]
    },
    "textField": {
      "oneOf": [
        {
          "$ref": "#/definitions/text"
        },
        {
          "type": "object",
          "required": [
            "default"
          ],
          "properties": {
            "default": {
              "$ref": "#/definitions/text"
            },
            "short": {
              "$ref": "#/definitions/shortText"
            }
          }
        }
      ]
    },
    "agent": {
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
          "$ref": "#/definitions/textField"
        },
        "description": {
          "$ref": "#/definitions/textField"
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
                "$ref": "#/definitions/textField"
              },
              "description": {
                "$ref": "#/definitions/textField"
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
      ]
    },
    "mediaObject": {
      "title": "Media Object",
      "type": "object",
      "required": [
        "@type",
        "url",
        "contentType"
      ],
      "properties": {
        "@type": {
          "const": "MediaObject"
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "name": {
          "$ref": "#/definitions/textField"
        },
        "description": {
          "$ref": "#/definitions/textField"
        },
        "url": {
          "$ref": "#/definitions/url"
        },
        "contentType": {
          "type": "string",
          "pattern": "^(application|audio|font|example|image|message|model|multipart|text|video)/[a-zA-Z0-9-.+]+$"
        },
        "fileExtension": {
          "type": "string",
          "minLength": 1
        },
        "height": {
          "type": "integer",
          "minimum": 1
        },
        "width": {
          "type": "integer",
          "minimum": 1
        },
        "duration": {
          "type": "number",
          "minimum": 1
        },
        "license": {
          "type": "string",
          "enum": [
            "cc0",
            "cc1",
            "cc2"
          ]
        },
        "copyrightOwner": {
          "$ref": "#/definitions/agent"
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "contentType": {
                "type": "string",
                "pattern": "^(application|font|example|image|message|model|multipart|text)"
              }
            }
          },
          "then": {
            "not": {
              "required": [
                "duration"
              ]
            }
          }
        },
        {
          "if": {
            "properties": {
              "contentType": {
                "type": "string",
                "pattern": "^(application|audio|font|example|message|model|multipart|text)"
              }
            }
          },
          "then": {
            "not": {
              "required": [
                "width",
                "height"
              ]
            }
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
          "type": "string",
          "enum": [
            "billing",
            "main",
            "shipping"
          ]
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
          "required": [
            "name",
            "code"
          ],
          "properties": {
            "name": {
              "$ref": "#/definitions/text"
            },
            "code": {
              "type": "string",
              "enum": [
                "IT",
                "DE",
                "AU"
              ]
            }
          }
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
