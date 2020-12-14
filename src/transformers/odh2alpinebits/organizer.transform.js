const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');


function transformOrganizersRelationship(sourceEvent, included, request) {
  let organizer = transformOrganizer(sourceEvent, included, request);

  if(!organizer)
    return null;

  return [ organizer ];
}

function transformOrganizer(originalObject, included, request) {
  const sourceEvent = JSON.parse(JSON.stringify(originalObject));

  let sourceOrganizer = sourceEvent.OrganizerInfos;
  let sourceContact = sourceEvent.ContactInfos;
  // TODO: Test organizer ID
  let sourceOrganizerID = sourceEvent.OrgRID;

  if(!sourceOrganizer)
    return null;

  let organizer = templates.createObject('Agent');
  let attributes = organizer.attributes;

  const organizerMapping = [['Url','url']];
  utils.transformMultilingualFields(sourceOrganizer, attributes, organizerMapping, false, true);

  let newContact = templates.createObject('ContactPoint');
  attributes.contactPoints = [ newContact ];

  let organizerAddress = templates.createObject('Address');
  newContact.address = organizerAddress;

  const addressMapping = [['Address','street'], ['City','city'], ['ZipCode','zipcode']];
  utils.transformMultilingualFields(sourceOrganizer, organizerAddress, addressMapping, false);
  organizerAddress.zipcode = utils.safeGetOne([['zipcode','ita'],['zipcode','eng'],['zipcode','deu']], organizerAddress);
  organizerAddress.country = 'IT';
  
  let inferredType = {
    error: 0,
    organization: 0,
    person: 0
  };

  for (languageEntry of utils.languageMapping) {
    let [sourceEventLanguage, targetLanguage] = languageEntry;
    
    const sourceEventOrganizer = sourceOrganizer[sourceEventLanguage];

    if(sourceEventOrganizer) {
      let phonenumber = utils.safeGetString(['Phonenumber'], sourceEventOrganizer);
      newContact.telephone = newContact.telephone || phonenumber;

      const email = utils.safeGetString(['Email'], sourceEventOrganizer);
      newContact.email = newContact.email || email;

      const orgId =  sourceOrganizerID || utils.safeGetString(['Tax'], sourceEventOrganizer) ||  utils.safeGetString(['Vat'], sourceEventOrganizer) || email;
      organizer.id = organizer.id || orgId;

      // const ignoreValues = ['Undefiniert','!','-','.','sonstige'];
      const ignoreValues = [];
      const companyName = utils.safeGetString(['CompanyName'], sourceEventOrganizer);
      const givenName = utils.safeGetString(['Givenname'], sourceEventOrganizer);
      const surname = utils.safeGetString(['Surname'], sourceEventOrganizer); 

      const isValidCompanyName = companyName && !ignoreValues.includes(companyName);
      const isValidGivenName = givenName && !ignoreValues.includes(givenName);
      const isValidSurname = surname && !ignoreValues.includes(surname);

      if(!isValidCompanyName && !isValidGivenName && !isValidSurname) {
        inferredType.error++;
      }
      else if(isValidCompanyName) {
        inferredType.organization++;
        attributes.name = utils.safeAdd(attributes.name, targetLanguage, companyName);
      }
      else if ((isValidGivenName || isValidSurname) && !(isValidGivenName && isValidSurname)){
        if(isValidSurname){
          inferredType.organization++;
          attributes.name = utils.safeAdd(attributes.name, targetLanguage, surname);
        }
        else {
          inferredType.organization++;
          attributes.name = utils.safeAdd(attributes.name, targetLanguage, givenName);
        }
      }
      else {
        inferredType.person++;
        attributes.name = utils.safeAdd(attributes.name, targetLanguage, givenName+' '+surname);
      }
    }
  }

  // TODO: Decide how to handle the case in which we cannot infer whether the sourceOrganizer is a person or an organization. We are currently setting the sourceOrganizer to be an organization
  attributes.categories = !inferredType.organization && inferredType.person ? ['alpinebits/person'] : ['alpinebits/organization']

  //If email and telephone number are not specified in sourceOrganizer, try to get it from the ContactInfos field.
  // TODO: improve this part of the code. Too many duplicates...
  if(!organizer.id)
    organizer.id = sourceEvent.Id+"+sourceOrganizer";
  
  let links = organizer.links;
  Object.assign(links, utils.createSelfLink(organizer, request));

  if(!organizer.attributes.name)
    organizer.attributes.name = {
      "eng": "Unnamed sourceOrganizer"
    };
  
  if(!newContact.email)
    newContact.email = utils.safeGetOne([['de','Email'],['it','Email'],['en','Email']], sourceContact);

  if(!newContact.telephone)
    newContact.telephone = utils.safeGetOne([['de','Phonenumber'],['it','Phonenumber'],['en','Phonenumber']], sourceContact);

  if(!newContact.address.city || !newContact.address.country)
    newContact.address = null;

  if(!newContact.email && !newContact.telephone && !newContact.address)
    attributes.contactPoints = null;

  return organizer;
}

module.exports = {
  transformOrganizer,
  transformOrganizersRelationship
}


