const OdhEvent2DestinationData = require("../../../src/model/odh2destinationdata/event_transform");
const OdhActivity2DestinationData = require("../../../src/model/odh2destinationdata/activity_transform");
const _ = require("lodash");

function expectOptional(field) {
    expect(field).toBeDefined();

    if(field) {
        if(!['boolean', 'number'].includes(typeof field)) {
            expect(_.isEmpty(field)).toBe(false);
        }
    } else {
        expect(field).toBeNull();
    }
}

function expectMandatory(field) {
    expect(field).toBeDefined();
    expect(field).not.toBeNull();

    if(!['boolean', 'number'].includes(typeof field)) {
        expect(_.isEmpty(field)).toBe(false);
    }
}

function itShouldBeMandatory(fieldName, field) {
    it(`The field "${fieldName}" is mandatory and cannot be empty`, () => expectMandatory(field))
}

function itShouldBeOptional(fieldName, field) {
    it(`The field "${fieldName}" is optional and cannot be empty`, () => expectOptional(field))
}

function itShouldMatch(actualOutput, expectedOutput) {
    it('The serialized output should match the expected output', () => {
        const serializedOutput = actualOutput.toJSON();
        expect(serializedOutput).toMatchObject(expectedOutput);
    })
}

describe('Test transformation ODH "items" into DestinationData resources', () => {
  describe("Test transformation of single ODH activity into a DestinationData resource", () => {
    const sampleLiftActivity = require("./sample_lift_activity_input.json");
    const request = {
        baseUrl: "http://example.com/2021-04",
        selfUrl: "http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62",
    };
    const resource = OdhActivity2DestinationData.transformToLift(sampleLiftActivity, request);
    const { attributes } = resource;

    it("The fields id and type must hold valid values", () => {
        expectMandatory(resource.id);
        expectMandatory(resource.type);
      });
  
    it("The object meta must have a set data provider and last update timestamp greater than zero 0 (January 1, 1970, 00:00:00)", () => {
        const { meta } = resource;
        expect(meta.dataProvider).toBe("http://tourism.opendatahub.bz.it/");
        expect(new Date(meta.lastUpdate) > new Date(0)).toBe(true);
    });

    it("The links object must contain a self reference/link", () => {
        expectMandatory(resource.links.self);
    });

    itShouldBeOptional("abstract", attributes.abstract)
    itShouldBeOptional("description", attributes.description)
    itShouldBeOptional("name", attributes.name)
    itShouldBeOptional("shortName", attributes.shortName)
    itShouldBeOptional("url", attributes.url)
  });

  describe("Test transformation of single ODH event into DestinationData event", () => {
    const sampleOdhEvent = require("./sample_event_input.json");
    const sampleDestinationDataEvent = require("./sample_event_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/events/CDB3CC1EE2614488A451C467BE971571",
    };
    const event = OdhEvent2DestinationData.transformToEvent(sampleOdhEvent, request);
    const { attributes, relationships } = event;

    itShouldBeMandatory('name', attributes.name);

    itShouldBeMandatory('organizers', relationships.organizers);
    itShouldBeMandatory('publisher', relationships.publisher);
    itShouldBeMandatory('venues', relationships.venues);
    
    itShouldBeOptional('capacity', attributes.capacity);
    itShouldBeOptional('endDate', attributes.endDate ? attributes.endDate.toISOString(): attributes.endDate);
    itShouldBeOptional('startDate', attributes.startDate ? attributes.startDate.toISOString(): attributes.startDate);
    itShouldBeOptional('status', attributes.status);
    itShouldBeOptional('url', attributes.url);
    
    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('contributors', relationships.contributors);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);
    itShouldBeOptional('series', relationships.series);
    itShouldBeOptional('sponsors', relationships.sponsors);
    itShouldBeOptional('subEvents', relationships.subEvents);

    itShouldMatch(event, sampleDestinationDataEvent);
  });

  describe("Test transformation of single ODH activity into DestinationData lift", () => {
    const sampleLiftActivity = require("./sample_lift_activity_input.json");
    const sampleDestinationDataLift = require("./sample_lift_activity_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62",
    };
    const lift = OdhActivity2DestinationData.transformToLift(sampleLiftActivity, request);
    const { attributes, relationships } = lift;

    itShouldBeMandatory('name', attributes.name);
    
    itShouldBeOptional('address', attributes.address);
    itShouldBeOptional('geometries', attributes.geometries);
    itShouldBeOptional('howToArrive', attributes.howToArrive);
    itShouldBeOptional('length', attributes.length);
    itShouldBeOptional('openingHours', attributes.openingHours);
    itShouldBeOptional('personsPerChair', attributes.openingHours);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('connections', relationships.connections);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(lift, sampleDestinationDataLift);
  });

  describe("Test transformation of single ODH activity into DestinationData ski slope", () => {
    const sampleSkiSlopeActivity = require("./sample_ski_slope_activity_input.json");
    const sampleDestinationDataSkiSlope = require("./sample_ski_slope_activity_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/skiSlopes/4DA19B2B1328127FC062FB79F6F435A5",
    };
    const skiSlope = OdhActivity2DestinationData.transformToSkiSlope(sampleSkiSlopeActivity, request);
    const { attributes, relationships } = skiSlope;

    itShouldBeMandatory('name', attributes.name);
    
    itShouldBeOptional('address', attributes.address);
    itShouldBeOptional('difficulty', attributes.difficulty);
    itShouldBeOptional('geometries', attributes.geometries);
    itShouldBeOptional('howToArrive', attributes.howToArrive);
    itShouldBeOptional('length', attributes.length);
    itShouldBeOptional('maxAltitude', attributes.maxAltitude);
    itShouldBeOptional('minAltitude', attributes.minAltitude);
    itShouldBeOptional('openingHours', attributes.openingHours);
    itShouldBeOptional('snowCondition', attributes.snowCondition);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('connections', relationships.connections);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(skiSlope, sampleDestinationDataSkiSlope);
  });

  describe("Test transformation of single ODH activity into DestinationData snowpark", () => {
    const sampleSnowparkActivity = require("./sample_snowpark_activity_input.json");
    const sampleDestinationDataSnowpark = require("./sample_snowpark_activity_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/snowparks/8781EFB8EDC5216BBF7A80DEB565569C",
    };
    const snowpark = OdhActivity2DestinationData.transformToSnowpark(sampleSnowparkActivity, request);
    const { attributes, relationships } = snowpark;

    itShouldBeMandatory('name', attributes.name);
    
    itShouldBeOptional('address', attributes.address);
    itShouldBeOptional('difficulty', attributes.difficulty);
    itShouldBeOptional('geometries', attributes.geometries);
    itShouldBeOptional('howToArrive', attributes.howToArrive);
    itShouldBeOptional('length', attributes.length);
    itShouldBeOptional('maxAltitude', attributes.maxAltitude);
    itShouldBeOptional('minAltitude', attributes.minAltitude);
    itShouldBeOptional('openingHours', attributes.openingHours);
    itShouldBeOptional('snowCondition', attributes.snowCondition);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('connections', relationships.connections);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(snowpark, sampleDestinationDataSnowpark);
  });

  describe("Test transformation of image gallery items from ODH activity into DestinationData media objects (multimediaDescription)", () => {
    const sampleLiftActivity = require("./sample_lift_activity_input.json");
    const sampleMultimediaDescription = require("./sample_multimedia_description_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62",
    };
    const lift = OdhActivity2DestinationData.transformToLift(sampleLiftActivity, request);
    const multimediaDescription = lift.relationships.multimediaDescriptions[0];
    const { attributes, relationships } = multimediaDescription;

    itShouldBeMandatory('contentType', attributes.contentType);
    itShouldBeMandatory('url', attributes.url);

    itShouldBeOptional("abstract", attributes.abstract)
    itShouldBeOptional("description", attributes.description)
    itShouldBeOptional('duration', attributes.duration);
    itShouldBeOptional('height', attributes.height);
    itShouldBeOptional('license', attributes.license);
    itShouldBeOptional("name", attributes.name)
    itShouldBeOptional("shortName", attributes.shortName)
    itShouldBeOptional('width', attributes.width);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('copyrightOwner', relationships.copyrightOwner);

    itShouldMatch(multimediaDescription, sampleMultimediaDescription);
  });

  describe("Test transformation of image gallery items from ODH activity into DestinationData agents (copyrightOwner)", () => {
    const sampleLiftActivity = require("./sample_lift_activity_input.json");
    const sampleCopyrightOwner = require("./sample_copyright_owner_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62",
    };
    const lift = OdhActivity2DestinationData.transformToLift(sampleLiftActivity, request);
    const multimediaDescription = lift.relationships.multimediaDescriptions[0];
    const copyrightOwner = multimediaDescription.relationships.copyrightOwner;
    const { attributes, relationships } = copyrightOwner;

    itShouldBeMandatory('name', attributes.name);

    itShouldBeOptional("abstract", attributes.abstract);
    itShouldBeOptional('contactPoints', attributes.contactPoints);
    itShouldBeOptional("description", attributes.description);
    itShouldBeOptional("shortName", attributes.shortName);
    itShouldBeOptional("url", attributes.url);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(copyrightOwner, sampleCopyrightOwner);
  });

  describe("Test transformation from ODH activity into DestinationData agents (organizers)", () => {
    const sampleOdhEvent = require("./sample_event_input.json");
    const sampleOrganizer = require("./sample_organizer_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/events/CDB3CC1EE2614488A451C467BE971571",
    };
    const event = OdhEvent2DestinationData.transformToEvent(sampleOdhEvent, request);
    const organizer = event.relationships.organizers[0];
    const { attributes, relationships } = organizer;

    itShouldBeMandatory('name', attributes.name);

    itShouldBeOptional("abstract", attributes.abstract);
    itShouldBeOptional('contactPoints', attributes.contactPoints);
    itShouldBeOptional("description", attributes.description);
    itShouldBeOptional("shortName", attributes.shortName);
    itShouldBeOptional("url", attributes.url);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(organizer, sampleOrganizer);
  });

  describe("Test transformation from ODH activity into DestinationData agents (publisher)", () => {
    const sampleOdhEvent = require("./sample_event_input.json");
    const samplePublisher = require("./sample_publisher_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/events/CDB3CC1EE2614488A451C467BE971571",
    };
    const event = OdhEvent2DestinationData.transformToEvent(sampleOdhEvent, request);
    const publisher = event.relationships.publisher;
    const { attributes, relationships } = publisher;

    itShouldBeMandatory('name', attributes.name);

    itShouldBeOptional("abstract", attributes.abstract);
    itShouldBeOptional('contactPoints', attributes.contactPoints);
    itShouldBeOptional("description", attributes.description);
    itShouldBeOptional("shortName", attributes.shortName);
    itShouldBeOptional("url", attributes.url);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(publisher, samplePublisher);
  });

  describe("Test transformation from ODH activity into DestinationData venues (venues)", () => {
    const sampleOdhEvent = require("./sample_event_input.json");
    const sampleVenue = require("./sample_venue_output.json");
    const request = {
      baseUrl: "http://example.com/2021-04",
      selfUrl: "http://example.com/2021-04/events/CDB3CC1EE2614488A451C467BE971571",
    };
    const event = OdhEvent2DestinationData.transformToEvent(sampleOdhEvent, request);
    const venue = event.relationships.venues[0];
    const { attributes, relationships } = venue;

    itShouldBeMandatory('name', attributes.name);

    itShouldBeOptional("abstract", attributes.abstract);
    itShouldBeOptional('address', attributes.address);
    itShouldBeOptional("description", attributes.description);
    itShouldBeOptional("geometries", attributes.geometries);
    itShouldBeOptional("howToArrive", attributes.howToArrive);
    itShouldBeOptional("shortName", attributes.shortName);
    itShouldBeOptional("url", attributes.url);

    itShouldBeOptional('categories', relationships.categories);
    itShouldBeOptional('multimediaDescriptions', relationships.multimediaDescriptions);

    itShouldMatch(venue, sampleVenue);
  });

  
});
