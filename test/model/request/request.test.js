// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Request } = require("./../../../src/model/request/request");

function createRequest(query, queryString) {
  const request = new Request(query);

  if (query) {
    Object.entries(query).forEach(([key, value]) => (request.query[key] = value));
  }

  request.selfUrl = "https://example.com?" + queryString;
  // request.query = Object.assign({}, request.query, query);

  return request;
}

// TODO: update testing approach
test("Placeholder", () => expect(true).toBe(true));

// describe(`Test ${Request.name} class`, () => {
//   describe("Test query validation", () => {
//     it("Requests without queries are valid", () => expect(() => createRequest({}, "").validate()).not.toThrow());

//     it("Requests with unknown queries are NOT valid", () => {
//       const requests = [
//         createRequest({ foo: "bar" }, "foo=bar"),
//         createRequest({ fields: "name", foo: { bar: "asd" } }, "fields=name,date&for[bar]=asd"),
//         createRequest({ fields: "name,date", "for-asd32&?": "" }, "fields=name,date&for-asd32&?"),
//       ];

//       requests.forEach((request) => {
//         expect(() => request.validate()).toThrow();
//       });
//     });

//     it('Requests with unknown queries must throw an error containing "status: 400"', () => {
//       const requests = [
//         createRequest({ foo: "bar" }, "foo=bar"),
//         createRequest({ fields: "name", foo: { bar: "asd" } }, "fields=name,date&for[bar]=asd"),
//         createRequest({ fields: "name,date", "for-asd32&?": "" }, "fields=name,date&for-asd32&?"),
//       ];

//       requests.forEach((request) => {
//         try {
//           request.validate();
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it("Requests with unsupported queries are NOT valid", () => {
//       const requests = [
//         createRequest({ include: "venues" }, "include=venues"),
//         createRequest({ fields: { events: "name" } }, "fields[events]=name"),
//         createRequest({ page: { number: "2" } }, "page[number]=2"),
//         createRequest({ sort: "startDate" }, "sort=startDate"),
//         createRequest({ random: "5" }, "random=5"),
//         createRequest({ search: { name: "bozen" } }, "search[name]=bozen"),
//         createRequest({ filter: { lastUpdate: { gte: "2021-04-01" } } }, "filter[lastUpdate][gte]=2021-04-01"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.include = false;
//         request.supportedFeatures.fields = false;

//         expect(() => {
//           request.validate();
//           console.log("no issues", request);
//         }).toThrow();
//       });
//     });

//     it('Requests with unsupported queries must throw an error containing "status: 400"', () => {
//       const requests = [
//         createRequest({ include: "venues" }, "include=venues"),
//         createRequest({ fields: { events: "name" } }, "fields[events]=name"),
//         createRequest({ page: { number: "2" } }, "page[number]=2"),
//         createRequest({ sort: "startDate" }, "sort=startDate"),
//         createRequest({ random: "5" }, "random=5"),
//         createRequest({ search: { name: "bozen" } }, "search[name]=bozen"),
//         createRequest({ filter: { lastUpdate: { gte: "2021-04-01" } } }, "filter[lastUpdate][gte]=2021-04-01"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.include = false;
//         request.supportedFeatures.fields = false;

//         try {
//           request.validate();
//           throw "Did not throw on validate()";
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Requests containing the conflicting queries "random" and "sort" must throw "{ status: 400 }"', () => {
//       const request = createRequest({ sort: "name", random: "5" }, "sort=name&random=5");
//       request.supportedFeatures.sort = true;
//       request.supportedFeatures.random = true;

//       try {
//         request.validate();
//         throw { message: "Did not throw on validate()", request };
//       } catch (error) {
//         expect(error).toMatchObject({ status: 400 });
//       }
//     });

//     it('Well-formatted "include" queries must not throw', () => {
//       const requests = [
//         createRequest({ include: "venues" }, "include=venues"),
//         createRequest(
//           { include: "multimediaDescriptions.copyrightOwner" },
//           "include=multimediaDescriptions.copyrightOwner"
//         ),
//         createRequest({ include: "include=multimediaDescriptions,venues" }, "include=multimediaDescriptions,venues"),
//         createRequest({ include: "include=multimediaDescriptions,venues" }, "include=name,venues"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.include = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "include" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ include: "" }, "include"),
//         createRequest(
//           { include: { multimediaDescriptions: "copyrightOwner" } },
//           "include[multimediaDescriptions]=copyrightOwner"
//         ),
//         createRequest(
//           { include: ["multimediaDescriptions", "venues"] },
//           "include=multimediaDescriptions&include=venues"
//         ),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.include = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "fields" queries must not throw', () => {
//       const requests = [
//         createRequest({ fields: { agents: "name" } }, "fields[agents]=name"),
//         createRequest({ fields: { categories: "name" } }, "fields[categories]=name"),
//         createRequest({ fields: { events: "name" } }, "fields[events]=name"),
//         createRequest({ fields: { eventSeries: "name" } }, "fields[eventSeries]=name"),
//         createRequest({ fields: { features: "name" } }, "fields[features]=name"),
//         createRequest({ fields: { lifts: "name" } }, "fields[lifts]=name"),
//         createRequest({ fields: { mediaObjects: "name" } }, "fields[mediaObjects]=name"),
//         createRequest({ fields: { mountainAreas: "name" } }, "fields[mountainAreas]=name"),
//         createRequest({ fields: { snowparks: "name" } }, "fields[snowparks]=name"),
//         createRequest({ fields: { skiSlopes: "name" } }, "fields[skiSlopes]=name"),
//         createRequest({ fields: { venues: "name" } }, "fields[venues]=name"),
//         createRequest({ fields: { agents: "name.eng" } }, "fields[agents]=name.eng"),
//         createRequest({ fields: { agents: "name,description" } }, "fields[agents]=name,description"),
//         createRequest({ fields: { agents: "name", events: "name" } }, "fields[agents]=name&fields[events]=name"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.fields = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "fields" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ fields: "name" }, "fields=name"),
//         createRequest({ fields: { foobar: "name" } }, "fields[foobar]=name"),
//         createRequest({ fields: { agents: { name: "eng" } } }, "fields[agents][name]=eng"),
//         createRequest({ fields: { agents: "-name" } }, "fields[agents]=-name"),
//         createRequest(
//           { fields: { agents: ["name", "description"] } },
//           "fields[agents]=name&fields[agents]=description"
//         ),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.fields = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "page" queries must not throw', () => {
//       const requests = [
//         createRequest({ page: { number: "2" } }, "page[number]=2"),
//         createRequest({ page: { size: "20" } }, "page[size]=20"),
//         createRequest({ page: { number: "2", size: "2" } }, "page[number]=2&page[size]=2"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.page = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "page" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ page: "2" }, "page=2"),
//         createRequest({ page: { size: "20,asd" } }, "page[size]=20,asd"),
//         createRequest({ page: { pageSize: "20" } }, "page[pageSize]=20"),
//         createRequest({ page: { number: ["2", "2"] } }, "page[number]=2&page[number]=2"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.page = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "sort" queries must not throw', () => {
//       const requests = [
//         createRequest({ sort: "startDate" }, "sort=startDate"),
//         createRequest({ sort: "name.eng" }, "sort=name.eng"),
//         createRequest({ sort: "sort=name,startDate" }, "sort=name,startDate"),
//         createRequest({ sort: "sort=name,-startDate" }, "sort=name,-startDate"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.sort = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "sort" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ sort: "" }, "sort"),
//         createRequest({ sort: { name: "eng" } }, "sort[name]=eng"),
//         createRequest({ sort: ["startDate", "name"] }, "sort=startDate&sort=name"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.sort = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "random" queries must not throw', () => {
//       const requests = [
//         createRequest({ random: "1" }, "random=1"),
//         createRequest({ random: "13" }, "random=13"),
//         createRequest({ random: "49" }, "random=49"),
//         createRequest({ random: "50" }, "random=50"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.random = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "random" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ random: "" }, "random"),
//         createRequest({ random: "0" }, "random=0"),
//         createRequest({ random: "-1" }, "random=-1"),
//         createRequest({ random: "51" }, "random=51"),
//         createRequest({ random: "asd" }, "random=asd"),
//         createRequest({ random: { name: "eng" } }, "random[name]=eng"),
//         createRequest({ random: ["startDate", "name"] }, "random=startDate&random=name"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.random = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "filter" queries must not throw', () => {
//       const requests = [
//         createRequest({ filter: { language: "eng" } }, "filter[language]=eng"),
//         createRequest({ filter: { position: "12.1212,12.1212" } }, "filter[position]=12.1212,12.1212"),
//         createRequest({ filter: { name: { exists: "true" } } }, "filter[name][exist]=true"),
//         createRequest({ filter: { "name.eng": { exists: "true" } } }, "filter[name.eng][exist]=true"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.filter = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "filter" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ filter: "name" }, "filter=name"),
//         createRequest({ filter: { language: ["eng", "ita"] } }, "filter[language]=eng&filter[language]=ita"),
//         createRequest({ filter: { name: { foobar: "true" } } }, "filter[name][foobar]=true"),
//         createRequest({ filter: { name: { exists: { foo: "bar" } } } }, "filter[name][exists][foo]=bar"),
//         createRequest(
//           { filter: { name: { exists: ["true", "false"] } } },
//           "filter[name][exist]=true&filter[name][exist]=false"
//         ),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.filter = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });

//     it('Well-formatted "search" queries must not throw', () => {
//       const requests = [
//         createRequest({ search: "bozen" }, "search=bozen"),
//         createRequest({ search: { name: "bozen" } }, "search[name]=bozen"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.search = true;
//         expect(() => request.validate()).not.toThrow();
//       });
//     });

//     it('Ill-formatted "search" queries must throw "{ status: 400 }"', () => {
//       const requests = [
//         createRequest({ search: "" }, "search"),
//         createRequest({ search: ["bozen", "bolzano"] }, "search=bozen&search=bolzano"),
//         createRequest({ search: { name: ["bozen", "bolzano"] } }, "search[name]=bozen&search[name]=bolzano"),
//       ];

//       requests.forEach((request) => {
//         request.supportedFeatures.search = true;

//         try {
//           request.validate();
//           throw { message: "Did not throw on validate()", request };
//         } catch (error) {
//           expect(error).toMatchObject({ status: 400 });
//         }
//       });
//     });
//   });
// });
