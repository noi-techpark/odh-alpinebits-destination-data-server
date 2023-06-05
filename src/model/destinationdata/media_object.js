// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Resource } = require('./resource');
const { ResourceType } = require('./constants');

class MediaObject extends Resource {
    constructor(base) {
        super(base);

        this.type = ResourceType.mediaObjects;

        this.attributes.contentType = this.attributes.contentType || null;
        this.attributes.duration = this.attributes.duration || null;
        this.attributes.height = this.attributes.height || null;
        this.attributes.license = this.attributes.license || null;
        this.attributes.width = this.attributes.width || null;

        this.relationships.categories = this.relationships.categories || null;
        this.relationships.copyrightOwner = this.relationships.copyrightOwner || null;
    }

    addCopyrightOwner(copyrightOwner) {
        return Resource.addRelationshipToOne(this.relationships, 'copyrightOwner', copyrightOwner, [ ResourceType.agents ])
    }

    addCategory(category) {
        return Resource.addRelationshipToMany(this.relationships, 'categories', category, [ ResourceType.categories ]);
    }

}

module.exports = {
    MediaObject
}