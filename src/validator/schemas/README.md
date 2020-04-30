# AlpineBits DestinationData: Schemas

This folder contains a list of JSON files containing [JSON Schemas](https://json-schema.org/) for each endpoint on an AlpineBits Destination data server.

The name of each file refer to the endpoints they apply to, for instance:

* the file `mediaobjects.schema.json` the JSON Schema for validating messages of the endpoint `/1.0/mediaObjects`

* the file `agetns.id.schema.json` the JSON Schema for validating messages of the endpoint `/1.0/agetns/:id`

* the file `mountainareas.id.areaowner.schema.json` the JSON Schema for validating messages of the endpoint `/1.0/mountainAreas/:id/areaOwner`

The following table correlates each file to its specific endpoint:

| File name | Endpoint |
| --------- | -------- |
| base.endpoint.schema.json | /1.0 |
| agents.schema.json | /1.0/agents |
| agents.id.schema.json | /1.0/agents/:id |
| agents.id.multimediadescriptions.schema.json | /1.0/agents/:id/multimediaDescriptions |
| events.schema.json | /1.0/events |
| events.id.schema.json | /1.0/events/:id |
| events.id.contributors.schema.json | /1.0/events/:id/contributors |
| events.id.multimediadescriptions.schema.json | /1.0/events/:id/multimediaDescriptions |
| events.id.organizers.schema.json | /1.0/events/:id/organizers |
| events.id.publisher.schema.json | /1.0/events/:id/publisher |
| events.id.series.schema.json | /1.0/events/:id/series |
| events.id.sponsors.schema.json | /1.0/events/:id/sponsors |
| events.id.subevents.schema.json | /1.0/events/:id/subEvents |
| events.id.venues.schema.json | /1.0/events/:id/venues |
| eventseries.schema.json | /1.0/eventSeries |
| eventseries.id.schema.json | /1.0/eventSeries/:id |
| eventseries.id.editions.schema.json | /1.0/eventSeries/:id/editions |
| eventseries.id.multimediadescriptions.schema.json | /1.0/eventSeries/:id/multimediaDescriptions |
| lifts.schema.json | /1.0/lifts |
| lifts.id.schema.json | /1.0/lifts/:id |
| lifts.id.connections.schema.json | /1.0/lifts/:id/connections |
| lifts.id.multimediadescriptions.schema.json | /1.0/lifts/:id/multimediaDescriptions |
| mediaobjects.schema.json | /1.0/mediaObjects |
| mediaobjects.id.schema.json | /1.0/mediaObjects/:id |
| mediaobjects.id.copyrightowner.schema.json | /1.0/mediaObjects/:id/copyrightOwner |
| mountainareas.id.areaowner.schema.json | /1.0/mountainAreas/:id/areaOwner |
| mountainareas.schema.json | /1.0/mountainAreas |
| mountainareas.id.schema.json | /1.0/mountainAreas/:id |
| mountainareas.id.connections.schema.json | /1.0/mountainAreas/:id/connections |
| mountainareas.id.lifts.schema.json | /1.0/mountainAreas/:id/lifts |
| mountainareas.id.multimediadescriptions.schema.json | /1.0/mountainAreas/:id/multimediaDescriptions  |
| mountainareas.id.snowparks.schema.json | /1.0/mountainAreas/:id/snowparks |
| mountainareas.id.subareas.schema.json | /1.0/mountainAreas/:id/subAreas |
| mountainareas.id.trails.schema.json | /1.0/mountainAreas/:id/trails |
| snowparks.schema.json | /1.0/snowparks |
| snowparks.id.schema.json | /1.0/snowparks/:id |
| snowparks.id.connections.schema.json | /1.0/snowparks/:id/connections |
| snowparks.id.multimediadescriptions.schema.json | /1.0/snowparks/:id/multimediaDescriptions |
| trails.schema.json | /1.0/trails |
| trails.id.schema.json | /1.0/trails/:id |
| trails.id.connections.schema.json | /1.0/trails/:id/connections |
| trails.id.multimediadescriptions.schema.json | /1.0/trails/:id/multimediaDescriptions |
| venues.schema.json | /1.0/venues |
| venues.id.schema.json | /1.0/venues/:id |
| venues.id.multimediadescriptions.schema.json | /1.0/venues/:id/multimediaDescriptions |

