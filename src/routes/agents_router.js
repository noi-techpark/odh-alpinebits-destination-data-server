const { Router } = require("./router");
const { AgentConnector } = require("../connectors/agent_connector");
const { deserializeAgent } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/agents`, this.postAgent);
    this.addGetRoute(`/agents`, this.getAgents);
    this.addGetRoute(`/agents/:id`, this.getAgentById);
    this.addDeleteRoute(`/agents/:id`, this.deleteAgent);
    this.addPatchRoute(`/agents/:id`, this.patchAgent);

    this.addGetRoute(`/agents/:id/categories`, this.getAgentCategories);
    this.addGetRoute(
      `/agents/:id/multimediaDescriptions`,
      this.getAgentMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postAgent = (request) =>
    this.postResource(
      request,
      AgentConnector,
      deserializeAgent,
      schemas["/agents/post"]
    );

  getAgents = (request) => this.getResources(request, AgentConnector);

  getAgentById = (request) => this.getResourceById(request, AgentConnector);

  deleteAgent = (request) => this.deleteResource(request, AgentConnector);

  patchAgent = (request) =>
    this.patchResource(
      request,
      AgentConnector,
      deserializeAgent,
      schemas["/agents/:id/patch"]
    );

  getAgentCategories = async (request) =>
    this.getResourceCategories(request, AgentConnector);

  getAgentMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, AgentConnector);
}

module.exports = {
  AgentsRouter,
};
