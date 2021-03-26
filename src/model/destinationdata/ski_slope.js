const { Resource } = require('./resource');
const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class SkiSlope extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.skiSlopes;

        this.attributes.address = this.attributes.address || null;
        this.attributes.difficulty = this.attributes.difficulty || null;
        this.attributes.geometries = this.attributes.geometries || null;
        this.attributes.howToArrive = this.attributes.howToArrive || null;
        this.attributes.length = this.attributes.length || null;
        this.attributes.maxAltitude = this.attributes.maxAltitude || null;
        this.attributes.minAltitude = this.attributes.minAltitude || null;
        this.attributes.openingHours = this.attributes.openingHours || null;
        this.attributes.snowCondition = this.attributes.snowCondition || null;
        
        this.relationships.connections = this.relationships.connections || null;
    }

    addConnection(connection) {
        return Resource.addRelationshipToMany(this.relationships, 'connections', connection, [ ResourceType.lifts, ResourceType.mountainAreas, ResourceType.skiSlopes, ResourceType.snowparks ])
    }

}

module.exports = {
    SkiSlope
}