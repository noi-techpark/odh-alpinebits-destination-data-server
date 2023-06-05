// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const _ = require("lodash");

const errors = require("./../errors");
const schemas = require("./../schemas");

const { DestinationDataError } = require("./../errors");
const { Request } = require("./../model/request/request");
const {
  serializeResourceCollection,
  serializeSingleResource,
} = require("../model/destinationdata2022");
const { AgentConnector } = require("../connectors/agent_connector");
const { CategoryConnector } = require("../connectors/category_connector");
const { EventConnector } = require("../connectors/event_connector");
const {
  EventSeriesConnector,
} = require("../connectors/event_series_connector");
const { FeatureConnector } = require("../connectors/feature_connector");
const { LiftConnector } = require("../connectors/lift_connector");
const {
  MediaObjectConnector,
} = require("../connectors/media_object_connector");
const {
  MountainAreaConnector,
} = require("../connectors/mountain_area_connector");
const { SkiSlopeConnector } = require("../connectors/ski_slope_connector");
const { SnowparkConnector } = require("../connectors/snowparks_connector");
const { VenueConnector } = require("../connectors/venue_connector");

const version_prefix = `/${process.env.API_VERSION}`;

function getResourceConnectorClass(type) {
  switch (type) {
    case "agents":
      return AgentConnector;
    case "categories":
      return CategoryConnector;
    case "event":
      return EventConnector;
    case "eventSeries":
      return EventSeriesConnector;
    case "features":
      return FeatureConnector;
    case "lifts":
      return LiftConnector;
    case "mediaObjects":
      return MediaObjectConnector;
    case "mountainAreas":
      return MountainAreaConnector;
    case "skiSlopes":
      return SkiSlopeConnector;
    case "snowparks":
      return SnowparkConnector;
    case "venues":
      return VenueConnector;
  }

  return null;
}

class Router {
  constructor() {
    this.getRoutes = {};
    this.postRoutes = {};
    this.patchRoutes = {};
    this.deleteRoutes = {};
  }

  addGetRoute(path, handleRequestFn) {
    this.getRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addPostRoute(path, handleRequestFn) {
    this.postRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addPatchRoute(path, handleRequestFn) {
    this.patchRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addDeleteRoute(path, handleRequestFn) {
    this.deleteRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => {
            if (data > 0) {
              return response.status(200).end();
            } else {
              throw errors.notFound;
            }
          })
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addUnimplementedGetRoute(path) {
    this.getRoutes[version_prefix + path] = (request, response) =>
      errors.handleNotImplemented(request, response);
  }

  installRoutes(app) {
    Object.entries(this.getRoutes).forEach(([path, routeFn]) =>
      app.get(path, routeFn)
    );
    Object.entries(this.postRoutes).forEach(([path, routeFn]) =>
      app.post(path, routeFn)
    );
    Object.entries(this.patchRoutes).forEach(([path, routeFn]) =>
      app.patch(path, routeFn)
    );
    Object.entries(this.deleteRoutes).forEach(([path, routeFn]) =>
      app.delete(path, routeFn)
    );
  }

  validate(data, schemaObj) {
    const [isValid, ajv] = schemaObj.validate(data);

    if (!isValid) {
      DestinationDataError.throwBadMessage(null, ajv.errors, schemaObj.schema);
    }
  }

  getResources = async (request, resourceConnectorClass) => {
    const parsedRequest = new Request(request);
    const connector = new resourceConnectorClass(parsedRequest);
    let resources = [];

    try {
      return Promise.resolve(parsedRequest.validate())
        .then(() => connector.retrieve())
        .then((ret) => (resources = ret))
        .then(() => this.getResourcesToInclude(parsedRequest, resources))
        .then((includes) =>
          serializeResourceCollection(
            resources,
            parsedRequest,
            includes?.flat()
          )
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getResourceById = async (request, resourceConnectorClass) => {
    const parsedRequest = new Request(request);
    const connector = new resourceConnectorClass(parsedRequest);
    let resource = null;

    try {
      return connector
        .retrieve()
        .then((ret) => (resource = ret))
        .then(() => this.getResourcesToInclude(request, resource))
        .then((includes) =>
          serializeSingleResource(resource, parsedRequest, includes?.flat())
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postResource = async (
    request,
    resourceConnectorClass,
    fnDeserialize,
    schemaObj
  ) => {
    const parsedRequest = new Request(request);
    const { body } = request;

    if (schemaObj) this.validate(body, schemaObj);

    const inputResource = fnDeserialize(body.data);
    const connector = new resourceConnectorClass(parsedRequest);

    try {
      return connector
        .create(inputResource)
        .then((outputResource) =>
          serializeSingleResource(outputResource, parsedRequest)
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchResource = async (
    request,
    resourceConnectorClass,
    fnDeserialize,
    schemaObj
  ) => {
    const parsedRequest = new Request(request);
    const { body } = request;

    console.log("beep");
    if (schemaObj) {
      this.validate(body, schemaObj);
      console.log("bop");
    }
    console.log("boop");

    const inputResource = fnDeserialize(body.data);
    const connector = new resourceConnectorClass(parsedRequest);

    try {
      return connector
        .update(inputResource)
        .then((outputResource) =>
          serializeSingleResource(outputResource, parsedRequest)
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteResource = async (request, resourceConnectorClass) => {
    const parsedRequest = new Request(request);
    const connector = new resourceConnectorClass(parsedRequest);

    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  parseRequest = (request, typesInData, typesInIncluded, supportedFeatures) => {
    const parsedRequest = new Request(request);

    parsedRequest.typesInData = typesInData || [];
    parsedRequest.typesInIncluded = typesInIncluded || [];
    parsedRequest.expectedTypes = [
      ...parsedRequest.typesInData,
      ...parsedRequest.typesInIncluded,
    ];

    if (Array.isArray(supportedFeatures)) {
      Object.keys(parsedRequest.supportedFeatures).forEach((feature) => {
        parsedRequest.supportedFeatures[feature] =
          supportedFeatures.includes(feature);
      });
    }

    parsedRequest.validate();

    return parsedRequest;
  };

  getResourcesToInclude(request, resources) {
    if (_.isEmpty(resources)) resources = [];
    else if (!_.isArray(resources)) resources = [resources];

    const refs = [];
    const fields =
      request?.query?.include?.replace(/ +/g, "")?.split(",") ?? [];

    for (const field of fields) {
      for (const resource of resources) {
        refs.push(_.get(resource, field));
      }
    }

    let refsToInclude = refs
      .flat()
      .filter((ref) => !_.isEmpty(ref))
      .reduce((obj, ref) => {
        if (_.isEmpty(obj?.[ref?.type])) obj[ref?.type] = [ref?.id];
        else if (!obj?.[ref?.type]?.includes(ref?.id))
          obj?.[ref?.type].push(ref?.id);
        return obj;
      }, {});

    return Promise.all(
      Object.entries(refsToInclude).map(([type, ids]) => {
        const connectorClass = getResourceConnectorClass(type);
        return new connectorClass().retrieve(ids);
      })
    );
  }

  getResourceRelationshipToMany = async (
    request,
    resourceConnectClass,
    fnRetrieveRelatedResources
  ) => {
    const parsedRequest = new Request(request);
    const connector = new resourceConnectClass(parsedRequest);
    let relatedResource = [];

    try {
      return connector
        .retrieve()
        .then((resource) => fnRetrieveRelatedResources(resource, parsedRequest))
        .then((ret) => (relatedResource = ret))
        .then(() => this.getResourcesToInclude(request, relatedResource))
        .then((includes) =>
          serializeResourceCollection(
            relatedResource,
            parsedRequest,
            includes?.flat()
          )
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getResourceRelationshipToOne = async (
    request,
    resourceConnectClass,
    fnRetrieveRelatedResources
  ) => {
    const parsedRequest = new Request(request);
    const connector = new resourceConnectClass(parsedRequest);
    let relatedResource = null;

    try {
      return connector
        .retrieve()
        .then((resource) => fnRetrieveRelatedResources(resource, parsedRequest))
        .then((ret) => (relatedResource = ret))
        .then(() => this.getResourcesToInclude(request, relatedResource))
        .then((includes) =>
          serializeSingleResource(
            relatedResource,
            parsedRequest,
            includes?.flat()
          )
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getResourceCategories = async (request, resourceConnectClass) => {
    const fnRetrieveCategories = (resource, parsedRequest) =>
      new CategoryConnector(parsedRequest).retrieveResourceCategories(resource);
    return this.getResourceRelationshipToMany(
      request,
      resourceConnectClass,
      fnRetrieveCategories
    );
  };

  getResourceMultimediaDescriptions = async (request, resourceConnectClass) => {
    const fnRetrieveMediaObjects = (resource, parsedRequest) =>
      new MediaObjectConnector(
        parsedRequest
      ).retrieveResourceMultimediaDescriptions(resource);
    return this.getResourceRelationshipToMany(
      request,
      resourceConnectClass,
      fnRetrieveMediaObjects
    );
  };

  getPlaceConnections = async (request, placeConnectorClass) => {
    const fnRetrieveConnections = (place, parsedRequest) =>
      Promise.all([
        new LiftConnector(parsedRequest).retrieveResourceLiftConnections(place),
        new MountainAreaConnector(
          parsedRequest
        ).retrieveResourceMountainAreaConnections(place),
        new SkiSlopeConnector(
          parsedRequest
        ).retrieveResourceSkiSlopeConnections(place),
        new SnowparkConnector(
          parsedRequest
        ).retrieveResourceSnowparkConnections(place),
      ]).then((arrays) => arrays?.flat());

    return this.getResourceRelationshipToMany(
      request,
      placeConnectorClass,
      fnRetrieveConnections
    );
  };
}

module.exports = {
  Router,
};
