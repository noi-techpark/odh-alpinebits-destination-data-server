const _ = require("lodash");

class Collection {
    constructor(base) {
        base = base || {};

        this.jsonapi = base.jsonapi || { version: '1.0' };

        this.meta = base.meta || {
            count: null,
            pages: null
        };

        this.links = base.links || {
            self: null
        };

        this.data = base.data || [];

        this.included = base.included || null;

        /** A string of comma-separated relationships to include to the collection */
        this._include = null;
        /** An key-value map of selected fields where the keys are resource types and the values are each an string of comma-separated field names to present in the collection */
        this._fields = {};
    }

    static getIncluded(collection) {
        if(typeof collection._include !== 'string') {
            return null;
        }
        
        const relationshipNames = collection._include.split(",");
        const included = {};
        const include = [];
        let targets = [];

        // extract [ 'relationship name', 'relationship' ] arrays that should be included
        for(const resource of collection.data) {
            const relationships = resource.relationships || {};

            targets.push(...Object.entries(relationships)
                .flatMap(([name, relationship]) => {
                    if(relationshipNames.includes(name)) {
                        return Array.isArray(relationship) ? relationship : [relationship];
                    } else {
                        return [null];
                    }
                }));
        }
        
        // removes null arrays and duplicates
        targets.forEach(target => {
            if(target) {

                included[target.type] = included[target.type] || {};
                
                if(!included[target.type][target.id]) {
                    included[target.type][target.id] = target;
                    include.push(target);
                }
            }
        });

        return include;
    }

    static exclusiveSelectAttributes(resource, attributes) {
        Object.keys(resource.attributes).forEach(attribute => {
            if(!attributes.includes(attribute)) {
                delete resource.attributes[attribute];
            }
        })
    }

    static exclusiveSelectRelationships(resource, relationships) {
        Object.keys(resource.relationships).forEach(relationship => {
            if(!relationships.includes(relationship)) {
                delete resource.relationships[relationship];
            }
        })
    }

    static exclusiveSelectFields(resource, fields) {
        Collection.exclusiveSelectAttributes(resource, fields);
        Collection.exclusiveSelectRelationships(resource, fields);
    }

    static performFieldSelection(collection) {
        if(_.isEmpty(collection._fields)) {
            return ;
        }

        const { _fields } = collection;
        const resources = [ ...collection.data ];

        if(Array.isArray(collection.included)) {
            resources.push(...collection.included)
        }

        resources.forEach(resource => {
            const { type } = resource;

            if(_fields[type]) {
                const fields = typeof _fields[type] === 'string' ? _fields[type].split(",") : _fields[type];
                Collection.exclusiveSelectFields(resource,fields);
            }
        });
    }

    toJSON() {
        const copy = Object.assign({},this);

        copy.included = Collection.getIncluded(copy);

        copy.data = [ ...copy.data.map(resource => resource) ];
        if(!_.isEmpty(copy.included)) {
            copy.included = [ ...copy.included.map(resource => resource) ];
        }

        // field selection must be performed after serializing data and included resources to avoid altering resources elsewhere (e.g., categories)
        Collection.performFieldSelection(copy);

        if(_.isEmpty(copy.included)) delete copy.included;
        delete copy._include;
        delete copy._fields;

        return copy;
    }
}

module.exports = {
    Collection
}