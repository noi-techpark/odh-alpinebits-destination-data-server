class Text {
  constructor() {}

  addContent(lang, content) {
    this[lang] = content;
  }
}

class Address {
  constructor() {
    this.city = undefined;
    this.country = undefined;
    this.complement = undefined;
    this.region = undefined;
    this.street = undefined;
    this.type = undefined;
    this.zipcode = undefined;
  }
}

class ContactPoint {
  constructor() {
    this.address = undefined;
    this.availableHours = undefined;
    this.email = undefined;
    this.telephone = undefined;
  }
}

module.exports = {
  Address,
  ContactPoint,
  Text,
};
