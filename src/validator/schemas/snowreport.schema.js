module.exports = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'https://www.alpinebits.org/schemas/v1/mountaindata/SnowReport',
  'title': 'Snow Report',
  'type': 'object',
  'required': [
    'lastUpdate',
    'dataProvider',
    '@type',
    'areaId',
    'baseSnow',
    'newSnow'
  ],
  'properties': {
    '@type': {
      'const': 'SnowReport'
    },
    'dataProvider': {
      'oneOf': [
        {
          '$ref': '#/definitions/agent'
        },
        {
          'type': 'string',
          'format': 'uri'
        }
      ]
    },
    'lastUpdate': {
      'type': 'string',
      'format': 'date-time'
    },
    'areaId': {
      'type': 'string',
      'minLength': 1
    },
    'trails': {
      '$ref': '#/definitions/conditionArray'
    },
    'snowparks': {
      '$ref': '#/definitions/conditionArray'
    },
    'subAreas': {
      'type': 'array',
      'items': {
        '$ref': '#'
      }
    }
  },
  'allOf': [
    {
      '$ref': '#/definitions/snow'
    }
  ],
  'definitions': {
    'snow': {
      'properties': {
        'measuredBy': {
          '$ref': '#/definitions/agent'
        },
        'measuredAt': {
          'title': 'Point',
          'type': 'object',
          'properties': {
            '@type': {
              'const': 'Point'
            },
            'coordinates': {
              'type': 'array',
              'minItems': 2,
              'items': {
                'type': 'number'
              }
            }
          },
          'required': [
            '@type',
            'coordinates'
          ]
        },
        'primarySurface': {
          'type': 'string'
        },
        'secondarySurface': {
          'type': 'string'
        },
        'baseSnow': {
          'description': 'Amount of base snow in a mountain area, trail or snow park, in centimeters.',
          'type': 'number'
        },
        'baseRange': {
          'required': [
            'lower',
            'upper'
          ],
          'properties': {
            'lower': {
              'description': 'Lower amount of base snow in a mountain area, trail or snow park, in centimeters.',
              'type': 'number'
            },
            'upper': {
              'description': 'Upper amount of base snow in a mountain area, trail or snow park, in centimeters.',
              'type': 'number'
            }
          }
        },
        'latestStorm': {
          'description': 'Amount of snow from the latest storm cycle in a mountain area, trail or snow park, in centimeters.',
          'type': 'string',
          'format': 'date'
        },
        'newSnow': {
          'type': 'number'
        },
        'groomed': {
          'type': 'boolean'
        },
        'snowMaking': {
          'type': 'boolean'
        }
      }
    },
    'conditionArray': {
      'type': 'array',
      'minItems': 1,
      'items': {
        'allOf': [
          {
            '$ref': '#/definitions/snow'
          }
        ],
        'required': [
          'id'
        ],
        'properties': {
          'id': {
            'type': 'string',
            'minLength': 1
          }
        }
      }
    },
    'text': {
      'patternProperties': {
        '': {
          'type': 'string'
        }
      },
      'type': 'object',
      'propertyNames': {
        'type': 'string',
        'enum': [
          'eng',
          'ita',
          'deu',
          'lld'
        ]
      }
    },
    'url': {
      'oneOf': [
        {
          'type': 'string',
          'format': 'uri'
        },
        {
          'patternProperties': {
            '': {
              'type': 'string',
              'format': 'uri'
            }
          },
          'type': 'object',
          'propertyNames': {
            'type': 'string',
            'enum': [
              'eng',
              'ita',
              'deu',
              'lld'
            ]
          }
        }
      ]
    },
    'agent': {
      'title': 'Agent',
      'type': 'object',
      'required': [
        '@type'
      ],
      'properties': {
        '@type': {
          'const': 'Agent'
        },
        'id': {
          'type': 'string',
          'minLength': 1
        },
        'name': {
          '$ref': '#/definitions/text'
        },
        'shortName': {
          '$ref': '#/definitions/text'
        },
        'abstract': {
          '$ref': '#/definitions/text'
        },
        'description': {
          '$ref': '#/definitions/text'
        },
        'url': {
          '$ref': '#/definitions/url'
        },
        'category': {
          'type': 'string',
          'enum': [
            'person',
            'organization'
          ]
        },
        'contacts': {
          'type': 'array',
          'minItems': 1,
          'items': {
            'title': 'Contact Point',
            'type': 'object',
            'required': [
              '@type'
            ],
            'properties': {
              '@type': {
                'const': 'ContactPoint'
              },
              'id': {
                'type': 'string',
                'minLength': 1
              },
              'name': {
                '$ref': '#/definitions/text'
              },
              'shortName': {
                '$ref': '#/definitions/text'
              },
              'abstract': {
                '$ref': '#/definitions/text'
              },
              'description': {
                '$ref': '#/definitions/text'
              },
              'url': {
                '$ref': '#/definitions/url'
              },
              'email': {
                'format': 'email',
                'type': 'string'
              },
              'telephone': {
                'type': 'string'
              },
              'address': {
                '$ref': '#/definitions/address'
              },
              'availableHours': {
                '$ref': '#/definitions/hoursSpecification'
              }
            },
            'anyOf': [
              {
                'required': [
                  'telephone'
                ]
              },
              {
                'required': [
                  'email'
                ]
              },
              {
                'required': [
                  'address'
                ]
              }
            ]
          }
        }
      },
      'anyOf': [
        {
          'required': [
            'url'
          ]
        },
        {
          'required': [
            'name'
          ]
        }
      ]
    },
    'address': {
      'title': 'Address',
      'type': 'object',
      'required': [
        '@type',
        'city',
        'country'
      ],
      'properties': {
        '@type': {
          'const': 'Address'
        },
        'category': {
          'type': 'string'
        },
        'street': {
          '$ref': '#/definitions/text'
        },
        'city': {
          '$ref': '#/definitions/text'
        },
        'region': {
          '$ref': '#/definitions/text'
        },
        'zipcode': {
          'type': 'string'
        },
        'complement': {
          '$ref': '#/definitions/text'
        },
        'country': {
          'description': 'A two-letter country code as defined in the ISO 3166.',
          'type': 'string',
          'enum': [
            'IT',
            'DE',
            'AU'
          ]
        }
      }
    },
    'hoursSpecification': {
      'title': 'Hours Specification',
      'type': 'object',
      'required': [
        '@type',
        'hours'
      ],
      'properties': {
        '@type': {
          'const': 'HoursSpecification'
        },
        'validFrom': {
          'type': 'string',
          'format': 'date'
        },
        'validTo': {
          'type': 'string',
          'format': 'date'
        },
        'daysOfWeek': {
          'type': 'array',
          'minItems': 1,
          'uniqueItems': true,
          'items': {
            'type': 'string',
            'enum': [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday'
            ]
          }
        },
        'hours': {
          'type': 'array',
          'minItems': 1,
          'items': {
            'required': [
              'opens',
              'closes'
            ],
            'properties': {
              'opens': {
                'type': 'string',
                'format': 'time'
              },
              'closes': {
                'type': 'string',
                'format': 'time'
              }
            }
          }
        }
      }
    }
  }
}
