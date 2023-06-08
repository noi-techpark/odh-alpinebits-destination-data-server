// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Router } = require("./router");
const { FeatureConnector } = require("../connectors/feature_connector");
const { deserializeFeature } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class FeaturesRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/features`, this.postFeature);
    this.addGetRoute(`/features`, this.getFeatures);
    this.addGetRoute(`/features/:id`, this.getFeatureById);
    this.addDeleteRoute(`/features/:id`, this.deleteFeature);
    this.addPatchRoute(`/features/:id`, this.patchFeature);

    this.addGetRoute(`/features/:id/children`, this.getFeatureChildren);
    this.addGetRoute(
      `/features/:id/multimediaDescriptions`,
      this.getFeatureMultimediaDescriptions
    );
    this.addGetRoute(`/features/:id/parents`, this.getFeatureParents);

    if (app) {
      this.installRoutes(app);
    }
  }

  getFeatures = (request) => this.getResources(request, FeatureConnector);

  getFeatureById = (request) => this.getResourceById(request, FeatureConnector);

  postFeature = (request) =>
    this.postResource(
      request,
      FeatureConnector,
      deserializeFeature,
      schemas["/features/post"]
    );

  patchFeature = (request) =>
    this.patchResource(
      request,
      FeatureConnector,
      deserializeFeature,
      schemas["/features/:id/patch"]
    );

  deleteFeature = (request) => this.deleteResource(request, FeatureConnector);

  getFeatureChildren = async (request) => {
    const fnRetrieveFeatures = (feature, parsedRequest) =>
      new FeatureConnector(parsedRequest).retrieveFeatureChildren(feature);
    return this.getResourceRelationshipToMany(
      request,
      FeatureConnector,
      fnRetrieveFeatures
    );
  };

  getFeatureMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, FeatureConnector);

  getFeatureParents = async (request) => {
    const fnRetrieveFeatures = (feature, parsedRequest) =>
      new FeatureConnector(parsedRequest).retrieveFeatureParents(feature);
    return this.getResourceRelationshipToMany(
      request,
      FeatureConnector,
      fnRetrieveFeatures
    );
  };
}

module.exports = {
  FeaturesRouter,
};
