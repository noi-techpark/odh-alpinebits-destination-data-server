const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class Venue extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.venues;

        this.attributes.address = this.attributes.address || null;
        this.attributes.howToArrive = this.attributes.howToArrive || null;
    }
}

module.exports = {
    Venue
}