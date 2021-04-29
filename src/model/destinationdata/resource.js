const iso6393to6391 = require("iso-639-3/to-1.json");
const _ = require("lodash");

class Resource {
  constructor(base) {
    if (base) {
      Object.entries(base).forEach(([k, v]) => (this[k] = v));
    }

    this.type = this.type || null;
    this.id = this.id || null;

    this.meta = this.meta || {
      dataProvider: null,
      lastUpdate: null,
    };

    this.links = this.links || {
      self: null,
    };

    this.attributes = this.attributes || {
      abstract: null,
      description: null,
      name: null,
      shortName: null,
      url: null,
    };

    this.relationships = this.relationships || {};
  }

  // TODO: review decision: I'm returning a boolean so the developer may check whether the text was added; I chose not to use an exception to not break the request in case of bad data input
  static addMultilingualTextField(attributes, fieldName, language, content) {
    if (!iso6393to6391[language]) {
      return false;
    } else if (typeof content || content === "") {
      return false;
    }

    attributes[fieldName] = attributes[fieldName] || {};
    attributes[fieldName][language] = content;

    return true;
  }

  static addRelationshipToOne(relationships, fieldName, target, allowedResourceTypes) {
    if (Array.isArray(allowedResourceTypes)) {
      if (!allowedResourceTypes.includes(target.type));
      return false;
    }

    relationships[fieldName] = target;
    return true;
  }

  static addRelationshipToMany(relationships, fieldName, target, allowedResourceTypes) {
    if (Array.isArray(allowedResourceTypes)) {
      if (!allowedResourceTypes.includes(target.type));
      return false;
    }

    relationships[fieldName] = relationships[fieldName] || [];
    relationships[fieldName].push(target);
    return true;
  }

  toJSON() {
    const copy = new this.constructor();

    copy.id = this.id;
    copy.type = this.type;

    copy.meta = this.meta ? JSON.parse(JSON.stringify(this.meta)) : {};
    copy.links = this.links ? JSON.parse(JSON.stringify(this.links)) : {};
    copy.attributes = this.attributes ? JSON.parse(JSON.stringify(this.attributes)) : {};

    const { attributes, relationships } = copy;

    Object.entries(this.relationships).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        relationships[key] = !_.isEmpty(value) ? [...value] : null;
      } else {
        relationships[key] = value;
      }
    });

    Object.entries(relationships).forEach(([name, relationship]) => {
      if (!_.isEmpty(relationship)) {
        const links = { related: `${this.links.self}/${name}` };
        let data = null;

        if (Array.isArray(relationship)) {
          data = relationship.map((target) => target.getReference());
        } else if (relationship instanceof Resource) {
          data = relationship.getReference();
        }

        copy.relationships[name] = { data, links };
      }
    });

    if (Array.isArray(this._fields)) {
      Object.keys(attributes).forEach((att) => {
        if (!this._fields.includes(att)) {
          delete attributes[att];
        }
      });

      Object.keys(relationships).forEach((rel) => {
        if (!this._fields.includes(rel)) {
          delete relationships[rel];
        }
      });
    }

    delete this._fields;

    return copy;
  }

  getReference() {
    return {
      type: this.type,
      id: this.id,
    };
  }

  addAbstract(language, content) {
    return Resource.addMultilingualTextField(this.attributes, "abstract", language, content);
  }

  addDescription(language, content) {
    return Resource.addMultilingualTextField(this.attributes, "description", language, content);
  }

  addName(language, content) {
    return Resource.addMultilingualTextField(this.attributes, "name", language, content);
  }

  addShortText(language, content) {
    return Resource.addMultilingualTextField(this.attributes, "shortText", language, content);
  }

  addUrl(language, content) {
    return Resource.addMultilingualTextField(this.attributes, "url", language, content);
  }

  getAttributesNames() {
    return Object.keys(this.attributes);
  }

  getRelationshipsNames() {
    return Object.keys(this.relationships);
  }

  getFieldsNames() {
    return [...this.getAttributesNames(), ...this.getRelationshipsNames()];
  }
}

module.exports = {
  Resource,
};
