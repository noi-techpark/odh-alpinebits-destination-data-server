module.exports.addSelf = function (resource, request) {
  if(!resource.opts.topLevelLinks)
    resource.opts.topLevelLinks = {};

  Object.assign(resource.opts.topLevelLinks, { self: request.selfUrl });

  return resource;
}

module.exports.addPagination = function (resource, request, metadata) {
  const { baseUrl, selfUrl } = request;
  const { page } = request.query;
  const { count, pages, next, prev, first, last } = metadata.page;

  let meta = {
    count,
    pages
  };

  let topLevelLinks;
  let regex = /page\[number\]=[0-9]+/
  let pageQueryStr = 'page[number]='

  if(!selfUrl.match(regex)){

    regexParams = /page|include|fields/
    hasParams = !!selfUrl.match(regexParams);

    topLevelLinks = {
      next: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + next,
      prev: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + prev,
      first: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + first,
      last: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + last,
    }
  }
  else
    topLevelLinks = {
      next: selfUrl.replace(regex, pageQueryStr + next),
      prev: selfUrl.replace(regex, pageQueryStr + prev),
      first: selfUrl.replace(regex, pageQueryStr + first),
      last: selfUrl.replace(regex, pageQueryStr + last),
    }

  if(!resource.opts.topLevelLinks)
    resource.opts.topLevelLinks = {};

  Object.assign(resource.opts.topLevelLinks, topLevelLinks);

  if(!resource.opts.meta)
    resource.opts.meta = {};

  Object.assign(resource.opts.meta,meta);

  return resource;
}

const getDataLink = (resource, request) => {
  return (record) => {
    resourceType = resource.opts.typeForAttribute('',record);
    return request.baseUrl + '/'+resourceType+'/'+record.id;
  }
}

module.exports.addDataLinks = function (resource, request) {
  if(!resource.opts.dataLinks)
    resource.opts.dataLinks = {};

  Object.assign(resource.opts.dataLinks, {
    self: getDataLink(resource, request)
  });

  return resource;
}
