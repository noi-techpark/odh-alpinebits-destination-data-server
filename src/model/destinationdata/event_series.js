// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Resource } = require('./resource');
const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class EventSeries extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.eventSeries;

        this.attributes.frequency = this.attributes.frequency || null;

        this.relationships.editions = this.relationships.editions || null;
    }

    addEdition(edition) {
        return Resource.addRelationshipToMany(this.relationships, 'editions', edition, [ ResourceType.events ])
    }

}

module.exports = {
    EventSeries
}