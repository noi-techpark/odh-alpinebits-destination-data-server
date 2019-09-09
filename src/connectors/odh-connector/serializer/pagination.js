function getPagination(request, meta, resourceType){
  const { baseUrl } = request;
  const { page } = request.query;
  const { next, prev, first, last, count, pages } = meta.page;

  let baseLink = baseUrl + '/' + resourceType + '?' + 'page[size]=' + page.size + '&' +'page[number]=';

  return ({
    links: {
      next: baseLink + next,
      prev: baseLink + prev,
      first: baseLink + first,
      last: baseLink + last,
    },
    meta: {
      pages,
      count
    }
  });
}

module.exports.getPagination = getPagination;
