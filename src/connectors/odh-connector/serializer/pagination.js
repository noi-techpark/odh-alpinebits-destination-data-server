function getPagination(request, meta, resourceType) {
  const { baseUrl, selfUrl } = request;
  const { page } = request.query;
  const { next, prev, first, last, count, pages } = meta.page;

  let regex = /page\[number\]=./
  let nextLink, prevLink, firstLink, lastLink;

  if(!selfUrl.match(regex)){
    let pageQueryString = '&page[number]='
    nextLink = selfUrl + pageQueryString + next;
    prevLink = selfUrl + pageQueryString + prev;
    firstLink = selfUrl + pageQueryString + first;
    lastLink = selfUrl + pageQueryString + last;
  }
  else {
    nextLink = selfUrl.replace(regex,'page[number]='+next);
    prevLink = selfUrl.replace(regex,'page[number]='+prev);
    firstLink = selfUrl.replace(regex,'page[number]='+first);
    lastLink = selfUrl.replace(regex,'page[number]='+last);
  }

  return ({
    links: {
      next: nextLink,
      prev: prevLink,
      first: firstLink,
      last: lastLink
    },
    meta: {
      pages,
      count
    }
  });
}

module.exports.getPagination = getPagination;
