// const { Activity } = require('./../../../src/model/odh/activity');
const { ResourceType } = require('../../../src/model/destinationdata/constants');
const { Lift } = require('./../../../src/model/destinationdata/lift');
const Lift2DestinationData = require('./../../../src/model/odh2destinationdata/lift_transform');
const liftActivity = require('./response_activity_lift.json');

describe('Test transformation ODH activities into DestinationData resources', () => {

    it('Test transformation of single ODH activity to DestinationData lift', () => {
        const request = {
            baseUrl: 'http://example.com/2021-04',
            selfUrl: 'http://example.com/2021-04/lifts/7FC702D2210CFAA29E153BA9AB5ABB62'
        }
        const lift = Lift2DestinationData.transformLift(liftActivity, request);

        console.log(lift.relationships.multimediaDescriptions);
        // console.log(JSON.stringify(lift.attributes.openingHours,null,2));

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

        expect(lift.attributes.address).toBeDefined();
        expect(lift.attributes.geometries).toHaveLength(1);
        expect(lift.attributes.howToArrive).toBeDefined();
        expect(lift.attributes.length).toBe(290);
        expect(lift.attributes.openingHours).toHaveProperty('dailySchedules', null);
        expect(lift.attributes.openingHours).not.toHaveProperty('weeklySchedules', null);

        expect(lift.relationships.multimediaDescriptions).toHaveLength(2);
        lift.relationships.multimediaDescriptions.forEach(mediaObject => {
            expect(mediaObject.meta.dataProvider).toBeDefined();
            expect(mediaObject.meta.lastUpdate).toBeDefined();

            expect(mediaObject.attributes.abstract).toBeNull();
            expect(mediaObject.attributes.contentType).toBeDefined();
            expect(mediaObject.attributes.description).toBeDefined();
            expect(mediaObject.attributes.duration).toBeNull();
            expect(mediaObject.attributes.height).toBeDefined();
            expect(mediaObject.attributes.name).toBeDefined();
            expect(mediaObject.attributes.license).toBeDefined();
            expect(mediaObject.attributes.shortName).toBeNull();
            expect(mediaObject.attributes.url).toBeDefined();
            expect(mediaObject.attributes.width).toBeDefined();

            expect(mediaObject.relationships.categories).toBeNull();
            expect(mediaObject.relationships.copyrightOwner).toBeDefined();
        });

        // TODO: transform categories
        // TODO: transform multimediaDescriptions
    });
});