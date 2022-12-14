const { Resource } = require('./resource');
const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class MountainArea extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.mountainAreas;

        this.attributes.area = this.attributes.area || null;
        this.attributes.geometries = this.attributes.geometries || null;
        this.attributes.howToArrive = this.attributes.howToArrive || null;
        this.attributes.maxAltitude = this.attributes.maxAltitude || null;
        this.attributes.minAltitude = this.attributes.minAltitude || null;
        this.attributes.openingHours = this.attributes.openingHours || null;
        this.attributes.snowCondition = this.attributes.snowCondition || null;
        this.attributes.totalParkArea = this.attributes.totalParkArea || null;
        this.attributes.totalTrailLength = this.attributes.totalTrailLength || null;

        this.relationships.areaOwner = this.relationships.areaOwner || null;
        this.relationships.connections = this.relationships.connections || null;
        this.relationships.lifts = this.relationships.lifts || null;
        this.relationships.snowparks = this.relationships.snowparks || null;
        this.relationships.subAreas = this.relationships.subAreas || null;
        this.relationships.skiSlopes = this.relationships.skiSlopes || null;
    }

    addAreaOwner(areaOwner) {
        return Resource.addRelationshipToOne(this.relationships, 'areaOwner', areaOwner, [ ResourceType.agents ])
    }

    addConnection(connection) {
        return Resource.addRelationshipToMany(this.relationships, 'connections', connection, [ ResourceType.lifts, ResourceType.mountainAreas, ResourceType.skiSlopes, ResourceType.snowparks ])
    }

    addLift(lift) {
        return Resource.addRelationshipToMany(this.relationships, 'lifts', lift, [ ResourceType.lifts ])
    }

    addSnowpark(snowpark) {
        return Resource.addRelationshipToMany(this.relationships, 'snowparks', snowpark, [ ResourceType.snowparks ])
    }

    addSubArea(subArea) {
        return Resource.addRelationshipToMany(this.relationships, 'subAreas', subArea, [ ResourceType.mountainAreas ])
    }

    addSkiSlopes(skiSlope) {
        return Resource.addRelationshipToMany(this.relationships, 'skiSlopes', skiSlope, [ ResourceType.skiSlopes ])
    }

}

module.exports = {
    MountainArea
}