const getIncludedLink = (resource, request) => {
  return (record, current) => {

    resourceType = resource.opts.typeForAttribute('',current);
    return request.baseUrl + '/'+resourceType+'/'+current.id;
  }
}

const getRelationshipLink = (resource, request, field, isRelatedLink) => {
  return (record) => {

    if(!record[field] || record[field].length===0)
      return null;

    let resourceType = resource.opts.typeForAttribute('',record);
    return request.baseUrl + '/' + resourceType + '/' + record.id + (isRelatedLink ? '/' : '/relationships/') + field;
  }
}

const getRelatedRelationshipLink = (resource, request, field) => getRelationshipLink(resource, request, field, true);

const getSelfRelationshipLink = (resource, request, field) => getRelationshipLink(resource, request, field, false);

module.exports.add = function (resource, request) {
  for(relationship of resource.relationships) {
    let options = resource.opts;
    let include = request.query.include;

    for (field of relationship.split('.')) {
      options = options[field];

      Object.assign(options, {
        ref: 'id',
        included: Boolean(include && include.hasOwnProperty(field)),
        includedLinks: {
          self: getIncludedLink(resource, request)
        },
        relationshipLinks: {
          self: getSelfRelationshipLink(resource, request, field),
          related: getRelatedRelationshipLink(resource, request, field)
        }
      });

      include = (include) ? include[field] : null;
    }
  }
  return resource;
}
