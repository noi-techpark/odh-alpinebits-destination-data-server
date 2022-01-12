class Text {
  constructor() {}

  addContent(lang, content) {
    this[lang] = content;
  }
}

class Address {
  constructor() {
    this.city = null;
    this.country = null;
    this.complement = null;
    this.region = null;
    this.street = null;
    this.type = null;
    this.zipcode = null;
  }
}

class ContactPoint {
  constructor() {
    this.address = null;
    this.availableHours = null;
    this.email = null;
    this.telephone = null;
  }
}

module.exports = {
  Address,
  ContactPoint,
  Text,
};
