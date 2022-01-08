# How to retrieve resources

## General

Style adopted from:

- PostgreSQL Documentation's examples
- [https://www.sqlstyle.guide/#naming-conventions](https://www.sqlstyle.guide/#naming-conventions)

Attributes containing complex datatypes:

- All resource types: `abstract`, `description`, `name`, `shortName`, and `url`
- Agents: `contactPoints`
- Categories: `resourceTypes` (array or JSON)
- Events: `endDate` and `startDate` (date or date-time), and `status` (enumeration)
- Event series: `frequency` (enumeration)
- Features: `resourceTypes` (array or JSON)
- Lifts: `address`, `geometries` (array of geometries or JSON), `howToArrive`, `openingHours`
- Media objects: none
- Mountain areas: `geometries` (array of geometries or JSON), `howToArrive`, `openingHours`
- Ski slopes: `address`, `difficulty` (two columns or JSON), `geometries` (array of geometries or JSON), `howToArrive`, `openingHours`, `snowCondition`
- Snowparks: `address`, `geometries` (array of geometries or JSON), `howToArrive`, `openingHours`, `snowCondition`
- Venues: `address`, `geometries` (array of geometries or JSON), `howToArrive`

Considerations on the representation of each attribute:

- Textual information should be directly store to JSON, including `url` which can be either a multilingual text or a simple string
- `agents.contactPoints` should be represented a JSON directly, rather than as an array of JSON objects.

## Agents

Join `resources` and `agents` tables.

Observations:

- We could use JSON for datatypes in order to avoid large number complex of joins
- Since the standard allows both strings and multi-lingual text to store `url` attributes, we could JSON to allow both in the same column
