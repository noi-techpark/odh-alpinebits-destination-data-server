module.exports.basicResourceRouteTests = (opts) => {
  const utils = require('./utils');

  describe(`API tests for 404 requests to /${opts.route}/:id`, () => {
    let status, data;

    beforeAll( () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}/i-dont-exist`)
        .catch( res => {
          ({status, data} = res.response);
        })
    })

    test(`/${opts.route}/:id: status should be 404 NOT FOUND`, () => {
      expect(status).toEqual(404)
    });

    test(`/${opts.route}/:id: well-formed response`, () => {
      expect(data.errors.length).toEqual(1);
      let error = data.errors[0];
      expect(error.status).toEqual(404);
      expect(error.title).toBeDefined();
    });
  });

  describe(`Basic API tests for 200 requests to /${opts.route}/:id`, () => {
    let id, baseUrl,headers, status, data, links;

    beforeAll( () => {
      return utils.axiosInstance.get(`/api/v1/${opts.route}?page[size]=1`)
        .then( response => {
          id = response.data.data[0].id;
          baseUrl = `/api/v1/${opts.route}/${id}`;
          return utils.axiosInstance.get(baseUrl);
        })
        .then( response => {
          ({headers, status} = response);
          ({meta, data, links} = response.data);
        })
    })

    test(`/${opts.route}/:id: route exists`, () => {
      expect(data).toBeDefined();
    });

    test(`/${opts.route}/:id: content-type 'application/vnd.api+json'`, () => {
      expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
    });

    test(`/${opts.route}/:id: status should be 200 OK`, () => {
      expect(status).toEqual(200);
    });

    test(`/${opts.route}/:id: returns correct object id`, () => {
      expect(data.id).toEqual(id);
    });

    test(`/${opts.route}/:id: returns correct object type`, () => {
      expect(data.type).toEqual(opts.resourceType);
    });

    test(`/${opts.route}/:id: single attribute selection`, () => {
      const url = `${baseUrl}?fields[${opts.resourceType}]=${opts.sampleAttributes[0]}`;

      return utils.axiosInstance.get(url)
        .then( res => expect(Object.keys(res.data.data.attributes)).toEqual([opts.sampleAttributes[0]]) )
    })

    test(`/${opts.route}/:id: multi-attribute selection`, () => {
      const url = `${baseUrl}?fields[${opts.resourceType}]=${opts.sampleAttributes.join(',')}`;

      return utils.axiosInstance.get(url)
        .then( res => expect(Object.keys(res.data.data.attributes)).toEqual(opts.sampleAttributes) )
    })

    test(`/${opts.route}/:id: multi-attribute and multi-relationship selection`, () => {
      const fields = [...opts.sampleAttributes, ...opts.sampleRelationships];
      const url = `${baseUrl}?fields[${opts.resourceType}]=${fields.join(',')}`;

      return utils.axiosInstance.get(url)
        .then( res => {
          expect(Object.keys(res.data.data.attributes)).toEqual(opts.sampleAttributes);
          expect(Object.keys(res.data.data.relationships)).toEqual(opts.sampleRelationships);
        })
    })

    test(`/${opts.route}/:id: single include`, () => {
      if(!opts.include)
        return;

      const url = `${baseUrl}?include=${opts.include.relationship}`;

      return utils.axiosInstance.get(url)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => expect(object.type).toEqual(opts.include.resourceType) )
        })
    })

    test(`/${opts.route}/:id: multiple includes`, () => {
      if(!opts.multiInclude)
        return;

      const url = `${baseUrl}?include=${opts.multiInclude.relationships.join(',')}`;

      return utils.axiosInstance.get(url)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => expect(opts.multiInclude.resourceTypes).toContain(object.type) )
        })
    })

    test(`/${opts.route}/:id: field selection on included resource`, () => {
      if(!opts.selectInclude)
        return;

      const url = `${baseUrl}?include=${opts.selectInclude.relationship}&fields[${opts.selectInclude.resourceType}]=${opts.selectInclude.attribute}`;

      return utils.axiosInstance.get(url)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => {
            expect(object.type).toEqual(opts.selectInclude.resourceType);
            expect(Object.keys(object.attributes)).toEqual([opts.selectInclude.attribute]);
          })
        })
    })

    test(`/${opts.route}/:id: multiple fields selected on inclusion of multiple resource types`, () => {
      if(!opts.multiSelectInclude)
        return;

      let include = 'include='+opts.multiSelectInclude.map(entry => entry.relationship).join(',');
      let fields = opts.multiSelectInclude.map(entry => `fields[${entry.resourceType}]=${entry.attributes.join(',')}`)
      let url = `${baseUrl}?${[include, ...fields].join('&')}`

      let expectedAttributesPerType = {};
      opts.multiSelectInclude.forEach( entry => expectedAttributesPerType[entry.resourceType]=entry.attributes)

      let resourceTypes = Object.keys(expectedAttributesPerType);

      return utils.axiosInstance.get(url)
        .then( (res) => {
          expect(res.data.included).toBeDefined();
          res.data.included.forEach( object => {
            expect(resourceTypes).toContain(object.type)
            expect(Object.keys(object.attributes)).toEqual(expectedAttributesPerType[object.type]);
          })
        })
    })

    test(`/${opts.route}/:id: self link returns the same object`, () => {
      return utils.get(links.self).then( res => {
        expect(res.data.data).toEqual(data);
        expect(res.data.links).toEqual(links);
      })
    })

    test(`/${opts.route}/:id: relationships have working links`, () => {
      let promises = [];

      Object.keys(data.relationships).forEach( key => {
        let rel = data.relationships[key];
        if(!rel.data || (Array.isArray(rel.data) && rel.data.length===0)){
          expect(rel.links).not.toBeDefined();
        }
        else {
          expect(rel.links).toBeDefined();
          expect(rel.links.related).toBeDefined();
          promises.push(utils.get(rel.links.related));
        }
      });

      return Promise.all(promises).then( resArray => {
         resArray.forEach( res => expect(res.data.data).toBeDefined() )
       });
    });

  })
}

// just to avoid warning, that no tests in test file
describe('Basic tests for API endpoints of single resources', () => {
  test('placeholder', () => {});
});
