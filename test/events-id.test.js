const axios = require('axios');
const utils = require('./utils');

let headers, status, data, links;

const eventId = '4FB0A44C21D64DACB35A6B9D0F72A473';
const baseUrl = '/api/v1/events/'+eventId;

beforeAll( () => {
  return utils.axiosInstance.get(baseUrl)
    .then( (response) => {
      ({headers, status} = response);
      ({data, links} = response.data);
    })
})

test('\'/events/:id\': route exists', () => {
  expect(data).toBeDefined();
});

test('\'/events/:id\': content-type "application/vnd.api+json"', () => {
  expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
});

test('\'/events/:id\': status 200 OK', () => {
  expect(status).toEqual(200);
});

test('\'/events/:id\': returns correct object id', () => {
  expect(data.id).toEqual(eventId);
});

test('\'/events/:id\': returns correct object type', () => {
  expect(data.type).toEqual('events');
});

test('\'/events/:id\': single attribute selection', () => {
  const url = baseUrl+'?fields[events]=name';

  return utils.axiosInstance.get(url)
    .then( res => expect(Object.keys(res.data.data.attributes)).toEqual(['name']) )
})

test('\'/events/:id\': multi-attribute selection', () => {
  const fields = ['name','startDate','endDate','categories'];
  const url = baseUrl+'?fields[events]='+fields.join(',');

  return utils.axiosInstance.get(url)
    .then( res => expect(Object.keys(res.data.data.attributes)).toEqual(fields) )
})

test('\'/events/:id\': multi-attribute and multi-relationship selection', () => {
  const attributes = ['name','startDate','endDate'];
  const relationships = ['organizers','venues','multimediaDescriptions'];
  const fields = [...attributes, ...relationships];
  const url = baseUrl+'?fields[events]='+fields.join(',');

  return utils.axiosInstance.get(url)
    .then( res => {
      expect(Object.keys(res.data.data.attributes)).toEqual(attributes);
      expect(Object.keys(res.data.data.relationships)).toEqual(relationships);
    })
})

test('\'/events/:id\': single include', () => {
  const url = baseUrl+'?include=organizers';

  return utils.axiosInstance.get(url)
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => expect(object.type).toEqual('agents') )
    })
})

test('\'/events/:id\': multiple includes', () => {
  const url = baseUrl+'?include=organizers,venues,multimediaDescriptions';

  return utils.axiosInstance.get(url)
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => expect(['agents','places','mediaObjects']).toContain(object.type) )
    })
})

test('\'/events/:id\': field selection on included resource', () => {
  const attributes = ['name'];
  const url = baseUrl+'?include=organizers&fields[agents]='+attributes.join(',');

  return utils.axiosInstance.get(url)
    .then( (res) => {
      expect(res.data.included).toBeDefined();
      res.data.included.forEach( object => {
        expect(object.type).toEqual('agents');
        expect(Object.keys(object.attributes)).toEqual(attributes);
      })
    })
})

test('\'/events/:id\': multi-field selection on multi-included resources', () => {
  const agentAttr = ['name','category'];
  const placeAttr = ['name','address'];
  const url = baseUrl+'?include=organizers,venues&fields[agents]='+agentAttr.join(',')+'&fields[places]='+placeAttr.join(',');

  return utils.axiosInstance.get(url)
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

test('\'/events/:id\': self link returns the same object', () => {
  return axios.get(links.self).then( res => {
    expect(res.data.data).toEqual(data);
    expect(res.data.links).toEqual(links);
  })
})

test('\'/events\': relationships have working links', () => {
  let promises = [];

  Object.keys(data.relationships).forEach( key => {
    let rel = data.relationships[key];
    if(!rel.data || (Array.isArray(rel.data) && rel.data.length===0)){
      expect(rel.links).not.toBeDefined();
    }
    else {
      expect(rel.links).toBeDefined();
      expect(rel.links.self).toBeDefined();
      expect(rel.links.related).toBeDefined();
      promises.push(axios.get(rel.links.related));
    }
  });

  return Promise.all(promises).then( resArray => {
     resArray.forEach( res => expect(res.data.data).toBeDefined() )
   });
});
