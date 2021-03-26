// const { Activity } = require('./../../../src/model/odh/activity');
const { ResourceType } = require('../../../src/model/destinationdata/constants');
const { Lift } = require('./../../../src/model/destinationdata/lift');
const Odh2DestinationData = require('./../../../src/model/odh2destinationdata/odh2destinationdata');
const liftActivity = require('./response_activity_lift.json');

describe('Test transformation ODH activities into DestinationData resources', () => {

    it('Test transformation of single ODH activity to DestinationData lift', () => {
        const request = {
            baseUrl: 'http://example.com/2021-04',
            selfUrl: 'http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62'
        }
        const lift = Odh2DestinationData.transformLift(liftActivity, request);

        console.log(lift.attributes.length);

        expect(lift).toBeInstanceOf(Lift);

        expect(lift.id).toBe("7FC702D2210CFAA29E153BA9AB5ABB62");
        expect(lift.type).toBe(ResourceType.lifts);

        expect(lift.meta.dataProvider).toBe("http://tourism.opendatahub.bz.it/");
        expect(lift.meta.lastUpdate).toBe("2021-03-10T13:09:12.1985011+01:00");
        
        expect(lift.links.self).toBe(request.selfUrl);

        expect(lift.attributes.abstract).toBeNull();
        expect(lift.attributes.description).toBeDefined();
        expect(lift.attributes.name).toBeDefined();
        expect(lift.attributes.shortName).toBeNull();
        expect(lift.attributes.url).toBeDefined();

        expect(lift.attributes.geometries).toHaveLength(1);
        expect(lift.attributes.howToArrive).toBeDefined();
        expect(lift.attributes.length).toBe(290);

        // TODO: transform lift attributes
        // TODO: transform categories
        // TODO: transform multimediaDescriptions
        // TODO: transform connections
    });
});