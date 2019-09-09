function createOdhQuery(request) {
  const { page } = request.query;
  let odhQuery = []

  if (page) {
    if (page.size)
      odhQuery.push("pagesize="+page.size);
    if (page.number)
      odhQuery.push("pagenumber="+page.number);
  }

  if(odhQuery.length)
    return "?"+odhQuery.join("&");

  return "";
}

module.exports.createOdhQuery = createOdhQuery;
