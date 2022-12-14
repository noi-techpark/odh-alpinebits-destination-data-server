const { Router } = require("./router");
const { VenueConnector } = require("../connectors/venue_connector");
const { deserializeVenue } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class VenuesRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/venues`, this.postVenue);
    this.addGetRoute(`/venues`, this.getVenues);
    this.addGetRoute(`/venues/:id`, this.getVenueById);
    this.addDeleteRoute(`/venues/:id`, this.deleteVenue);
    this.addPatchRoute(`/venues/:id`, this.patchVenue);

    this.addGetRoute(`/venues/:id/categories`, this.getVenueCategories);
    this.addGetRoute(
      `/venues/:id/multimediaDescriptions`,
      this.getVenueMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postVenue = (request) =>
    this.postResource(
      request,
      VenueConnector,
      deserializeVenue,
      schemas["/snowparks/post"]
    );

  getVenues = (request) => this.getResources(request, VenueConnector);

  getVenueById = (request) => this.getResourceById(request, VenueConnector);

  deleteVenue = (request) => this.deleteResource(request, VenueConnector);

  patchVenue = (request) =>
    this.patchResource(
      request,
      VenueConnector,
      deserializeVenue,
      schemas["/snowparks/:id/patch"]
    );

  getVenueCategories = async (request) =>
    this.getResourceCategories(request, VenueConnector);

  getVenueMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, VenueConnector);
}

module.exports = {
  VenuesRouter,
};
