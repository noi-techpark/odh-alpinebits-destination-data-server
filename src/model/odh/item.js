const _ = require('lodash');

class Item {
    constructor(odhItem) {
        if(odhItem) {
            Object.assign(this, odhItem);
        }
    }

    static extractFieldFromMultilingualObject(object, fieldName) {
        if(_.isEmpty(object)) {
            return null;
        }
        
        const content = {};

        for(const lang in object) {
            const field = object[lang][fieldName];

            if(field) {
                content[lang] = field;
            }
        }

        return content
    }

    /** Returns the item's "Title" in each available language, e.g, { "de": "My Item" } */
    getTitle() {
        return Item.extractFieldFromMultilingualObject(this.Detail, 'Title');
    }

    /** Returns the item's "BaseText" in each available language, e.g, { "de": "My Item" } */
    getBaseText() {
        return Item.extractFieldFromMultilingualObject(this.Detail, 'BaseText');
    }

    /** Returns the item's "Header" in each available language, e.g, { "de": "My Item" } */
    getHeader() {
        return Item.extractFieldFromMultilingualObject(this.Detail, 'Header');
    }

    /** Returns the item's "SubHeader" in each available language, e.g, { "de": "My Item" } */
    getSubHeader() {
        return Item.extractFieldFromMultilingualObject(this.Detail, 'SubHeader');
    }

    /** Returns the item's "Url" in each available language, e.g, { "de": "My Item" } */
    getUrl() {
        return Item.extractFieldFromMultilingualObject(this.ContactInfos, 'Url');
    }

    /** Returns the item's "GetThereText" in each available language, e.g, { "de": "My Item" } */
    getGetThereText() {
        return Item.extractFieldFromMultilingualObject(this.Detail, 'GetThereText');
    }

    /** Returns the item's "Address" in each available language, e.g, { "de": "My Item" } */
    getAddress() {
        return Item.extractFieldFromMultilingualObject(this.ContactInfos, 'Address');
    }

    /** Returns the item's "City" in each available language, e.g, { "de": "My Item" } */
    getCity() {
        return Item.extractFieldFromMultilingualObject(this.ContactInfos, 'City');
    }

    /** Returns the item's "CountryCode" in each available language, e.g, { "de": "My Item" } */
    getCountryCode() {
        return Item.extractFieldFromMultilingualObject(this.ContactInfos, 'CountryCode');
    }

    /** Returns the item's "ZipCode" in each available language, e.g, { "de": "My Item" } */
    getZipCode() {
        return Item.extractFieldFromMultilingualObject(this.ContactInfos, 'ZipCode');
    }
}

module.exports = {
    Item
}