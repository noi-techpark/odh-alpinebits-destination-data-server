const iso6393to6391 = require("iso-639-3/to-1.json");
const _ = require( "lodash");

class Resource {
    constructor(base) {
        if(base) {
            Object.entries(base).forEach(([k,v]) => this[k] = v);
        }

        this.type = this.type || null;
        this.id = this.id || null;
        
        this.meta = this.meta || {
            dataProvider: null,
            lastUpdate: null
        }

        this.links = this.links || {
            self: null
        }

        this.attributes = this.attributes || {
            abstract: null,
            description: null,
            name: null,
            shortName: null,
            url: null,
        }

        this.relationships = this.relationships || {}
    }

    // TODO: review decision: I'm returning a boolean so the developer may check whether the text was added; I chose not to use an exception to not break the request in case of bad data input
    static addMultilingualTextField(attributes, fieldName, language, content) {
        if(!iso6393to6391[language]) {
            return false;
        } else if(typeof content || content === '') {
            return false;
        }
    
        attributes[fieldName] = attributes[fieldName] || {};
        attributes[fieldName][language] = content;
    
        return true;
    }

    static addRelationshipToOne(relationships, fieldName, target, allowedResourceTypes) {
        if(Array.isArray(allowedResourceTypes)) {
            if(!allowedResourceTypes.includes(target.type));
                return false;
        }

        relationships[fieldName] = target;
        return true;
    }

    static addRelationshipToMany(relationships, fieldName, target, allowedResourceTypes) {
        if(Array.isArray(allowedResourceTypes)) {
            if(!allowedResourceTypes.includes(target.type));
                return false;
        }

        relationships[fieldName] = relationships[fieldName] || [];
        relationships[fieldName].push(target);
        return true;
    }

    // TODO: test the links object when returning a relationship
    toJSON() {
        // const copy = Object.assign({}, this);
        // const { relationships } = this;

        // Object.entries(relationships).forEach(([name, relationship]) => {
        //     if(_.isEmpty(relationship)) {
        //         copy.relationships[name] = null;
        //     } else {
        //         const links = { self: `${this.links.self}/${name}` };
        //         let data = null;
    
        //         if(Array.isArray(relationship)) {
        //             data = relationship.map(target => target.getReference());
        //         } else if(relationship instanceof Resource) {
        //             data = relationship.getReference();
        //         }
                
        //         copy.relationships[name] = { data, links };
        //     }
        // });

        const copy = new this.constructor();

        const { meta, links, attributes, relationships } = copy;

        copy.id = this.id;
        copy.type = this.type;

        Object.entries(this.meta).forEach(([key,value]) => {
            meta[key] = value;
        });

        Object.entries(this.links).forEach(([key,value]) => {
            links[key] = value;
        });

        Object.entries(this.attributes).forEach(([key,value]) => {
            attributes[key] = value;
        });

        Object.entries(this.relationships).forEach(([key,value]) => {
            relationships[key] = value;
        });

        Object.entries(relationships).forEach(([name, relationship]) => {
            if(_.isEmpty(relationship)) {
                copy.relationships[name] = null;
            } else {
                const links = { self: `${this.links.self}/${name}` };
                let data = null;
    
                if(Array.isArray(relationship)) {
                    data = relationship.map(target => target.getReference());
                } else if(relationship instanceof Resource) {
                    data = relationship.getReference();
                }
                
                copy.relationships[name] = { data, links };
            }
        });

        return copy;
    }

    getReference() {
        return {
            type: this.type,
            id: this.id
        }
    }

    addAbstract(language, content) {
        return Resource.addMultilingualTextField(this.attributes, 'abstract', language, content);
    }
    
    addDescription(language, content) {
        return Resource.addMultilingualTextField(this.attributes, 'description', language, content);
    }

    addName(language, content) {
        return Resource.addMultilingualTextField(this.attributes, 'name', language, content);
    }

    addShortText(language, content) {
        return Resource.addMultilingualTextField(this.attributes, 'shortText', language, content);
    }

    addUrl(language, content) {
        return Resource.addMultilingualTextField(this.attributes, 'url', language, content);
    }
}

module.exports = {
    Resource
}