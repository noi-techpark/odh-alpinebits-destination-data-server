module.exports.add = function (resource, request) {
  let { fields } = request.query;

  if(!fields)
    return resource;

  let resourceName = resource.name;
  let selectedAttr = fields[resourceName];
  if(selectedAttr)
    resource.opts.attributes = [ ...selectedAttr ];

  for(relationship of resource.relationships) {
    let options = resource.opts;

    for (field of relationship.split('.')) {
      options = options[field];
      resourceName = resource.getTypeFromRelationship(field);
      selectedAttr = fields[resourceName];

      if(selectedAttr)
        options.attributes = [ ...selectedAttr ];
    }
  }

  return resource;
}
