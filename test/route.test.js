module.exports.basicRouteTests = (opts) => {
  const utils = require('./utils');

  let headers, status, meta, data, links;

  const pageParam = opts.pageSize ? 'page[size]='+opts.pageSize : '';
  const pageSize = opts.pageSize || 10;

  beforeAll( () => {

    return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}`)
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
      if(count >= pageSize)
        expect(data.length).toBe(pageSize);
      else
        expect(data.length).toBe(count);

      let regex = /page\[number\]=([0-9])/
      expect(links.prev.match(regex)[1]).toBe("1");
      expect(links.next.match(regex)[1]).toBe("2");
    });

    test(`/${opts.route}: page size works`, () => {
      const customPageSize = 3;
      return utils.axiosInstance.get(`/api/v1/${opts.route}?page[size]=${customPageSize}`)
        .then( (res) => {
          let {pages, count} = res.data.meta;

          if(count >= customPageSize)
            expect(res.data.data.length).toEqual(customPageSize)
          else
            expect(res.data.data.length).toEqual(count)

          expect(pages).toEqual(Math.ceil(count/customPageSize));
        })
    })

    test(`/${opts.route}: page number works`, () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}?page[size]=1&page[number]=2`)
        .then( (res) => {
          expect(data[1].id).toEqual(res.data.data[0].id);
        })
    })

    test(`/${opts.route}: single attribute selection`, () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&fields[${opts.resourceType}]=${opts.sampleAttributes[0]}`)
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual([opts.sampleAttributes[0]])
          })
        })
    })

    test(`/${opts.route}: multi-attribute selection`, () => {
      const fields = opts.sampleAttributes;
      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&fields[${opts.resourceType}]=${fields.join(',')}`)
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual(fields)
          })
        })
    })

    test(`/${opts.route}: attribute and relationship selection`, () => {
      const fields = [...opts.sampleAttributes, ...opts.sampleRelationships];
      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&fields[${opts.resourceType}]=`+fields.join(','))
        .then( (res) => {
          res.data.data.forEach( object => {
            expect(Object.keys(object.attributes)).toEqual(opts.sampleAttributes);
            expect(Object.keys(object.relationships)).toEqual(opts.sampleRelationships);
          })
        })
    })

    test(`/${opts.route}: pagination 'next' link works`, () => {
      return utils.get(links.next).then( res => expect(res.data.data).toBeDefined())
    });

    test(`/${opts.route}: pagination 'prev' link works`, () => {
      return utils.get(links.prev).then( res => expect(res.data.data).toBeDefined())
    });

    test(`/${opts.route}: pagination 'first' link works`, () => {
      return utils.get(links.first).then( res => expect(res.data.data).toBeDefined())
    });

    test(`/${opts.route}: pagination 'last' link works`, () => {
      return utils.get(links.last).then( res => expect(res.data.data).toBeDefined())
    });

    test(`/${opts.route}: 'self' link works`, () => {
      return utils.get(links.self).then( res => {
        expect(res.data.data).toBeDefined()
        expect(res.data.data).toEqual(data);
        expect(res.data.links).toEqual(links);
      })
    });

    test(`/${opts.route}: data links work`, () => {
      let promises = [];
      let i = 0;

      while(i<=3 && i<data.length-1){
        promises.push(utils.get(data[i].links.self));
        i++;
      }

      return Promise.all(promises)
        .then( (resArray) => {
          resArray.forEach( (res) => expect(res.data.data).toBeDefined() )
        });
    });

    test(`/${opts.route}: single include`, () => {
      if(!opts.include)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&include=${opts.include.relationship}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => expect(object.type).toEqual(opts.include.resourceType) )
        })
    })

    test(`/${opts.route}: multiple includes`, () => {
      if(!opts.multiInclude)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&include=${opts.multiInclude.relationships.join(',')}`)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object =>  expect(opts.multiInclude.resourceTypes).toContain(object.type) )
        })
    })

    test(`/${opts.route}: field selection on included resource`, () => {
      if(!opts.selectInclude)
        return;

      return utils.axiosInstance.get(`/api/v1/${opts.route}?${pageParam}&include=${opts.selectInclude.relationship}&fields[${opts.selectInclude.resourceType}]=${opts.selectInclude.attribute}`)
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
      let params = [pageParam, include, ...fields].join('&');

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

  describe(`Resource serialization at /${opts.route}`, () => {

    test(`/${opts.route}: no @type fields`, () => {
      data.forEach( object => {
        let attrs = object.attributes;
        Object.keys(attrs).forEach( key => {
          expect(key).not.toBe('@type');
          if(attrs[key] && typeof attrs[key]==='object')
            expect('@type' in attrs[key]).toBe(false)
        })
      })
    })

  })
}

// just to avoid warning, that no tests in test file
describe('Basic tests for API endpoints', () => {
  test('should be used per implementation', () => {});
});
