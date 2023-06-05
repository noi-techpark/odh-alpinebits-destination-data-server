// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Resource } = require('./resource');
const { ResourceType } = require('./constants');

class IndividualResource extends Resource {
    constructor(base) {
        super(base);

        this.relationships.categories = this.relationships.categories || null;
        this.relationships.multimediaDescriptions = this.relationships.multimediaDescriptions || null;
    }

    addCategory(category) {
        return Resource.addRelationshipToMany(this.relationships, 'categories', category, [ ResourceType.categories ]);
    }
    
    addMultimediaDescription(multimediaDescription) {
        return Resource.addRelationshipToMany(this.relationships, 'multimediaDescriptions', multimediaDescription, [ ResourceType.mediaObjects ]);
    }
}

module.exports = {
    IndividualResource
}