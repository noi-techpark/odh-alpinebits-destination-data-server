module.exports.basicRouteTests = (opts) => {
  const axios = require('axios');
  const utils = require('./utils');

  let headers, status, meta, data, links;

  beforeAll( () => {
    return utils.axiosInstance.get(`/api/v1/${opts.route}`)
      .then( (response) => {
        ({headers, status} = response);
        ({meta, data, links} = response.data);
      })
  })

  describe(`Basic API tests for /${opts.route}`, () => {
    test(`/${opts.route}: route exists`, () => {
      expect(data).toBeDefined();
    });

    test(`/${opts.route}: content-type "application/vnd.api+json"`, () => {
      expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
    });

    test(`/${opts.route}: status 200 OK`, () => {
      expect(status).toEqual(200);
    });

    test(`/${opts.route}: correct resource type`, () => {
      data.forEach( object => {
        expect(object.type).toEqual(opts.resourceType);
      })
    });

    test(`/${opts.route}: meta object returned`, () => {
      expect(meta).toBeDefined();
      expect(meta.count).toBeDefined();
      expect(meta.pages).toBeDefined();
    });

    test(`/${opts.route}: correct default pagination parameters`, () => {
      let {pages, count} = meta;
      if(count >= 10)
        expect(data.length).toBe(10);
      else
        expect(data.length).toBe(count);

      let regex = /page\[number\]=([0-9])/
      expect(links.prev.match(regex)[1]).toBe("1");
      expect(links.next.match(regex)[1]).toBe("2");
    });

    test(`/${opts.route}: page size works`, () => {
      const pageSize = 7;
      return utils.axiosInstance.get(`/api/v1/${opts.route}?page[size]=${pageSize}`)
        .then( (res) => {
          let {pages, count} = res.data.meta;

          if(count >= pageSize)
            expect(res.data.data.length).toEqual(pageSize)
          else
            expect(res.data.data.length).toEqual(count)

          expect(pages).toEqual(Math.ceil(count/pageSize));
        })
    })

    test(`/${opts.route}: page number works`, () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}?page[size]=1&page[number]=2`)
        .then( (res) => {
          expect(data[1].id).toEqual(res.data.data[0].id);
        })
    })

    test(`/${opts.route}: single attribute selection`, () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}?fields[${opts.resourceType}]=${opts.sampleAttributes[0]}`)
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual([opts.sampleAttributes[0]])
          })
        })
    })

    test(`/${opts.route}: multi-attribute selection`, () => {
      const fields = opts.sampleAttributes;
      return utils.axiosInstance.get(`/api/v1/${opts.route}?fields[${opts.resourceType}]=${fields.join(',')}`)
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual(fields)
          })
        })
    })

    test(`/${opts.route}: attribute and relationship selection`, () => {
      const fields = [...opts.sampleAttributes, ...opts.sampleRelationships];
      return utils.axiosInstance.get(`/api/v1/${opts.route}?fields[${opts.resourceType}]=`+fields.join(','))
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual(opts.sampleAttributes);
            expect(Object.keys(object.relationships)).toEqual(opts.sampleRelationships);
          })
        })
    })

    test(`/${opts.route}: pagination links work`, () => {
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

    test(`/${opts.route}: data links work`, () => {
      let promises = data.map( object => axios.get(object.links.self) );
      return Promise.all(promises)
        .then( (resArray) => {
          resArray.forEach( (res) => expect(res.data.data).toBeDefined() )
        });
    });

    test(`/${opts.route}: single include`, () => {
      if(!opts.include)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?include=${opts.include.relationship}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => expect(object.type).toEqual(opts.include.resourceType) )
        })
    })

    test(`/${opts.route}: multiple includes`, () => {
      if(!opts.multiInclude)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?include=${opts.multiInclude.relationships.join(',')}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object =>  expect(opts.multiInclude.resourceTypes).toContain(object.type) )
        })
    })

    test(`/${opts.route}: field selection on included resource`, () => {
      if(!opts.selectInclude)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?include=${opts.selectInclude.relationship}&fields[${opts.selectInclude.resourceType}]=${opts.selectInclude.attribute}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => {
            expect(object.type).toEqual(opts.selectInclude.resourceType);
            expect(Object.keys(object.attributes)).toEqual([opts.selectInclude.attribute]);
          })
        })
    })

    test(`/${opts.route}: multi-field selection on multi-included resources`, () => {
      if(!opts.multiSelectInclude)
        return;

      let include = 'include='+opts.multiSelectInclude.map(entry => entry.relationship).join(',');
      let fields = opts.multiSelectInclude.map(entry => `fields[${entry.resourceType}]=${entry.attributes.join(',')}`)
      let params = [include, ...fields].join('&');

      let expectedAttributesPerType = {};
      opts.multiSelectInclude.forEach( entry => expectedAttributesPerType[entry.resourceType]=entry.attributes)

      let resourceTypes = Object.keys(expectedAttributesPerType);

      return utils.axiosInstance.get(`/api/v1/${opts.route}?${params}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => {
            expect(resourceTypes).toContain(object.type)
            expect(Object.keys(object.attributes)).toEqual(expectedAttributesPerType[object.type]);
          })
        })
    })
  })
}

// just to avoid warning, that no tests in test file
describe('Basic tests for API endpoints', () => {
  test('should be used per implementation', () => {});
});
