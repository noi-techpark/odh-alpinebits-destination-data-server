// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const commaSeparatedStrings = {
    type: "string",
    pattern: "^[a-zA-Z0-9](?:[-\\w]*[a-zA-Z0-9])?(,([a-zA-Z0-9](?:[-\\w]*[a-zA-Z0-9])?))*$"
    // pattern borrowed from JSON:API's schema
}

const include = commaSeparatedStrings

const random = {
    type: "string",
    pattern: "(^[1-9]$)|(^[1-4][0-9]$)|(^50$)"
}

const sort = {
    type: "string",
    pattern: "^(-?[a-zA-Z0-9](?:[-\\w]*[a-zA-Z0-9])?)(,(-?[a-zA-Z0-9](?:[-\\w]*[a-zA-Z0-9])?))*$"
    // pattern borrowed from JSON:API's schema
}

const page = {
    type: "object",
    properties: {
        number: {
            type: "string",
            pattern: "^[1-9]"
        },
        size: {
            type: "string",
            pattern: "^[1-9]"
        },
    },
    additionalProperties: false,
    minProperties: 1
}

const search = {
    type: "object",
    additionalProperties: {
        type: "string",
        minLength: 1,
        pattern: "^[^,]*$"
    }
}

const langSchema = {
    type: "string",
    pattern: "^\\w{3}(,\\w{3})*$"
}

const lastUpdateSchema = {
    type: "object",
    properties: {
        gt: {
            type: "string",
            format: "date"
        }
    },
    additionalProperties: false,
    minProperties: 1
}

const categoriesSchema = {
    type: "object",
    properties: {
        any: {
            type: "string",
            pattern: "^((\\w|-)+\\/(\\w|-)+)(,((\\w|-)+\\/(\\w|-)+))*$"
        }
    },
    additionalProperties: false,
    minProperties: 1
}

const locationSchema = {
    type: "object",
    properties: {
        near: {
            type: "string",
            pattern: "^(-?\\d+(\\.\\d+)?),(-?\\d+(\\.\\d+)?),(\\d+)$"
        }
    },
    additionalProperties: false,
    minProperties: 1
}


const startDateSchema = {
    type: "object",
    properties: {
        lte: {
            type: "string",
            format: "date"
        }
    },
    additionalProperties: false,
    minProperties: 1
}

const endDateSchema = {
    type: "object",
    properties: {
        gte: {
            type: "string",
            format: "date"
        }
    },
    additionalProperties: false,
    minProperties: 1
}

const organizersSchema = {
    type: "object",
    properties: {
        eq: {
            type: "string",
            pattern: "^[^,]+$"
        }
    },
    additionalProperties: false,
    minProperties: 1
}

const filter = {
    events: {
        type: "object",
        properties: {
            lang: langSchema,
            lastUpdate: lastUpdateSchema,
            categories: categoriesSchema,
            venues: locationSchema,
            startDate: startDateSchema,
            endDate: endDateSchema,
            organizers: organizersSchema,
        },
        additionalProperties: false,
        minProperties: 1
    },
    lifts: {
        type: "object",
        properties: {
            lang: langSchema,
            lastUpdate: lastUpdateSchema,
            categories: categoriesSchema,
            geometries: locationSchema,
        },
        additionalProperties: false,
        minProperties: 1
    },
    snowparks: {
        type: "object",
        properties: {
            lang: langSchema,
            lastUpdate: lastUpdateSchema,
            geometries: locationSchema,
        },
        additionalProperties: false,
        minProperties: 1
    },
    trails: {
        type: "object",
        properties: {
            lang: langSchema,
            lastUpdate: lastUpdateSchema,
            geometries: locationSchema,
        },
        additionalProperties: false,
        minProperties: 1
    },
}

const fields = {
    type: "object",
    properties: {
        agents: commaSeparatedStrings,
        events: commaSeparatedStrings,
        eventSeries: commaSeparatedStrings,
        lifts: commaSeparatedStrings,
        mediaObjects: commaSeparatedStrings,
        mountainAreas: commaSeparatedStrings,
        snowparks: commaSeparatedStrings,
        trails: commaSeparatedStrings,
        venues: commaSeparatedStrings,
    },
    additionalProperties: false,
    minProperties: 1
}

module.exports = {
    include,
    random,
    sort,
    page,
    fields,
    search,
    filter,
}