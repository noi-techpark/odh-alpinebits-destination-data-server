const axios = require('axios');
const utils = require('./utils');

let headers, status, meta, data, links;

beforeAll( () => {
  return utils.axiosInstance.get('/api/v1/events')
    .then( (response) => {
      ({headers, status} = response);
      ({meta, data, links} = response.data);
    })
})

test('\'/events\': route exists', () => {
  expect(data).toBeDefined();
});

test('\'/events\': content-type "application/vnd.api+json"', () => {
  expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
});

test('\'/events\': status 200 OK', () => {
  expect(status).toEqual(200);
});

test('\'/events\': correct object type', () => {
  data.forEach( object => {
    expect(object.type).toEqual('events');
  })
});

test('\'/events\': meta object returned', () => {
  expect(meta).toBeDefined();
  expect(meta.count).toBeDefined();
  expect(meta.pages).toBeDefined();
});

test('\'/events\': correct default pagination parameters', () => {
  let {pages, count} = meta;
  if(count >= 10)
    expect(data.length).toBe(10);
  else
    expect(data.length).toBe(count);

  let regex = /page\[number\]=([0-9])/
  expect(links.prev.match(regex)[1]).toBe("1");
  expect(links.next.match(regex)[1]).toBe("2");
});

test('\'/events\': page size works', () => {
  const pageSize = 7;
  return utils.axiosInstance.get('/api/v1/events?page[size]='+pageSize)
    .then( (res) => {
      let {pages, count} = res.data.meta;

      if(count >= pageSize)
        expect(res.data.data.length).toEqual(pageSize)
      else
        expect(res.data.data.length).toEqual(count)

      expect(pages).toEqual(Math.ceil(count/pageSize));
    })
})

test('\'/events\': page number works', () => {
  return utils.axiosInstance.get('/api/v1/events?page[size]=1&page[number]=2')
    .then( (res) => {
      expect(data[1].id).toEqual(res.data.data[0].id);
    })
})

test('\'/events\': single attribute selection on event object', () => {
  return utils.axiosInstance.get('/api/v1/events?fields[events]=name')
    .then( (res) => {
      res.data.data.forEach( object => {
        expect(Object.keys(object.attributes)).toEqual(['name'])
      })
    })
})

test('\'/events\': multi-attribute selection on event object', () => {
  const fields = ['name','startDate','endDate','categories']
  return utils.axiosInstance.get('/api/v1/events?fields[events]='+fields.join(','))
    .then( (res) => {
      res.data.data.forEach( object => {
        expect(Object.keys(object.attributes)).toEqual(fields)
      })
    })
})

test('\'/events\': attribute and relationship selection on event object', () => {
  const attributes = ['name','startDate','endDate'];
  const relationships = ['organizers','venues','multimediaDescriptions'];
  const fields = [...attributes, ...relationships];

  return utils.axiosInstance.get('/api/v1/events?fields[events]='+fields.join(','))
    .then( (res) => {
      res.data.data.forEach( object => {
        expect(Object.keys(object.attributes)).toEqual(attributes);
        expect(Object.keys(object.relationships)).toEqual(relationships);
      })
    })
})

test('\'/events\': single include', () => {
  return utils.axiosInstance.get('/api/v1/events?include=organizers')
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => expect(object.type).toEqual('agents') )
    })
})

test('\'/events\': multiple includes', () => {
  return utils.axiosInstance.get('/api/v1/events?include=organizers,venues,multimediaDescriptions')
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object =>  expect(['agents','places','mediaObjects']).toContain(object.type) )
    })
})

test('\'/events\': field selection on included resource', () => {
  const attributes = ['name']
  return utils.axiosInstance.get('/api/v1/events?include=organizers&fields[agents]='+attributes.join(','))
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => {
        expect(object.type).toEqual('agents');
        expect(Object.keys(object.attributes)).toEqual(attributes);
      })
    })
})

test('\'/events\': multi-field selection on multi-included resources', () => {
  const agentAttr = ['name','category'];
  const placeAttr = ['name','address'];

  return utils.axiosInstance.get('/api/v1/events?include=organizers,venues&fields[agents]='+agentAttr.join(',')+'&fields[places]='+placeAttr.join(','))
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => {
        expect(['agents','places']).toContain(object.type)

        if(object.type==='agents')
          expect(Object.keys(object.attributes)).toEqual(agentAttr);
        if(object.type==='places')
          expect(Object.keys(object.attributes)).toEqual(placeAttr);
      })
    })
})

test('\'/events\': pagination links work', () => {
  let promises = [];
  promises.push(axios.get(links.next));
  promises.push(axios.get(links.prev));
  promises.push(axios.get(links.first));
  promises.push(axios.get(links.last));
  promises.push(axios.get(links.self));
  return Promise.all(promises)
    .then( (resArray) => {
      resArray.forEach( (res) => expect(res.data.data).toBeDefined() )
    });
});

test('\'/events\': data links work', () => {
  let promises = data.map( object => axios.get(object.links.self) );
  return Promise.all(promises)
    .then( (resArray) => {
      resArray.forEach( (res) => expect(res.data.data).toBeDefined() )
    });
});
