const { Resource } = require('./resource');
const { ResourceType } = require('./constants');

class Category extends Resource {
    constructor(base) {
        super(base);

        this.type = ResourceType.categories;

        this.attributes.namespace = this.attributes.namespace || null;
        this.attributes.resourceTypes = this.attributes.resourceTypes || null;

        this.relationships.children = this.relationships.children || null;
        this.relationships.multimediaDescriptions = this.relationships.multimediaDescriptions || null;
        this.relationships.parents = this.relationships.parents || null;
    }

    addChild(child) {
        return Resource.addRelationshipToMany(this.relationships, 'children', child, [ ResourceType.categories ]);
    }

    addParent(parent) {
        return Resource.addRelationshipToMany(this.relationships, 'parents', parent, [ ResourceType.categories ]);
    }

    addMultimediaDescription(multimediaDescription) {
        return Resource.addRelationshipToMany(this.relationships, 'multimediaDescriptions', multimediaDescription, [ ResourceType.mediaObjects ]);
    }
}

module.exports = {
    Category
}