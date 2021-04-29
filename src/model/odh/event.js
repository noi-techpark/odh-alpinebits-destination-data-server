const { Item } = require("./item");

class Event extends Item {
  constructor(odhEvent) {
    super(odhEvent);
  }

  getOrganizerCompanyName() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "CompanyName");
  }

  getOrganizerGivenname() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Givenname");
  }

  getOrganizerSurname() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Surname");
  }

  /** Returns the item's organizer info "Address" in each available language, e.g, { "de": "My Item" } */
  getOrganizerAddress() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Address");
  }

  /** Returns the item's organizer info "City" in each available language, e.g, { "de": "My Item" } */
  getOrganizerCity() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "City");
  }

  /** Returns the item's organizer info "CountryCode" in each available language, e.g, { "de": "My Item" } */
  getOrganizerCountryCode() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "CountryCode");
  }

  /** Returns the item's organizer info "Email" in each available language, e.g, { "de": "My Item" } */
  getOrganizerEmail() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Email");
  }

  /** Returns the item's organizer info "Phonenumber" in each available language, e.g, { "de": "My Item" } */
  getOrganizerPhonenumber() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Phonenumber");
  }

  /** Returns the item's organizer info "Url" in each available language, e.g, { "de": "My Item" } */
  getOrganizerUrl() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "Url");
  }

  /** Returns the item's organizer info "ZipCode" in each available language, e.g, { "de": "My Item" } */
  getOrganizerZipCode() {
    return Item.extractFieldFromMultilingualObject(this.OrganizerInfos, "ZipCode");
  }

  /** Returns the item's EventAdditionalInfos "Location" (i.e. name) in each available language, e.g, { "de": "My Item" } */
  getEventAdditionalInfosLocation() {
    return Item.extractFieldFromMultilingualObject(this.EventAdditionalInfos, "Location");
  }

  /** Returns the item's ContactInfos "Address" in each available language, e.g, { "de": "My Item" } */
  getContactInfosAddress() {
    return Item.extractFieldFromMultilingualObject(this.ContactInfos, "Address");
  }

  /** Returns the item's ContactInfos "City" in each available language, e.g, { "de": "My Item" } */
  getContactInfosCity() {
    return Item.extractFieldFromMultilingualObject(this.ContactInfos, "City");
  }

  /** Returns the item's ContactInfos "CountryCode" in each available language, e.g, { "de": "My Item" } */
  getContactInfosCountryCode() {
    return Item.extractFieldFromMultilingualObject(this.ContactInfos, "CountryCode");
  }

  /** Returns the item's ContactInfos "ZipCode" in each available language, e.g, { "de": "My Item" } */
  getContactInfosZipCode() {
    return Item.extractFieldFromMultilingualObject(this.ContactInfos, "ZipCode");
  }
}

module.exports = {
  Event,
};
