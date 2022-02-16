const { Router } = require("./router");
const { VenueConnector } = require("../connectors/venue_connector");
const {
  deserializeVenue,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class VenuesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/venues/:id/categories`);
    this.addUnimplementedGetRoute(`/venues/:id/multimediaDescriptions`);

    this.addPostRoute(`/venues`, this.postVenue);
    this.addGetRoute(`/venues`, this.getVenues);
    this.addGetRoute(`/venues/:id`, this.getVenueById);
    this.addDeleteRoute(`/venues/:id`, this.deleteVenue);
    this.addPatchRoute(`/venues/:id`, this.patchVenue);

    if (app) {
      this.installRoutes(app);
    }
  }

  getVenues = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new VenueConnector();

    // Return to the client
    try {
      return connector.retrieve().then((venues) => serializeResourceCollection(venues, "/2022-04-draft", "venues"));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getVenueById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new VenueConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((venue) => serializeSingleResource(venue, "/2022-04-draft", "venues"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postVenue = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const venue = deserializeVenue(body.data);
    const parsedRequest = new Request(request);
    const connector = new VenueConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(venue).then((venue) => serializeSingleResource(venue, "/2022-04-draft", "venues"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchVenue = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const venue = deserializeVenue(body.data);
    const parsedRequest = new Request(request);
    const connector = new VenueConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(venue).then((_venue) => serializeSingleResource(_venue, "/2022-04-draft", "venues"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteVenue = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new VenueConnector(parsedRequest);
    console.log("delete venue");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(venueMessage) {
    console.log("The venue message HAS NOT BEEN validated.");
  }
}

module.exports = {
  VenuesRouter,
};
