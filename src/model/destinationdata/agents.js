// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { ResourceType } = require('./constants');
const { IndividualResource } = require('./individual_resource');

class Agent extends IndividualResource {
    constructor(base) {
        super(base);

        this.type = ResourceType.agents;

        this.attributes.contactPoints = this.attributes.contactPoints || null;
    }
}

module.exports = {
    Agent
}