
//TODO: VALIDATE QUERY PARAMETERS (only exisitng parameters, parameter values)
function parsePage(request) {
  const { page } = request.query;

  let result = {
    size: 10,
    number: 1
  }

  if(!page)
    return result;

  if(page.size>0)
    result.size = page.size;

  if(page.number>0)
    result.number = page.number;

  return result;
}

// "include=organizers,venues,venues.geometries => ['organizers','venues','venues.geometries']"
function parseInclude(request) {
  const { include } = request.query;

  let result = {}

  if(!include)
    return result;

  let entries = include.split(',');
  for(i=0; i<entries.length; i++) {

    const fields = entries[i].split('.');
    let container = result;

    for(j=0; j<fields.length; j++) {
      const field = fields[j];

      if(!container[field])
        container[field] = {}

      container = container[field];
    }
  }

  return result;
}

module.exports.parsePage = parsePage;
module.exports.parseInclude = parseInclude;
