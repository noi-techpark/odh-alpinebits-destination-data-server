// require('module-alias/register')
// const { Resource } = require("@destinationdata");
const { Resource } = require("./../../../src/model/destinationdata/resource");

describe(`Test ${Resource.name} class`, () => {

    it(`Test initialization`, () => {
        const resource = new Resource();

        console.log(resource);
        
        expect(resource).toBeDefined();
        expect(resource instanceof Resource).toBe(true);
    })
})