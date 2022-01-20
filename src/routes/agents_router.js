const { Router } = require("./router");
const { AgentConnector } = require("../connectors/destinationdata2022/agent_connector");
const {
  deserializeAgent,
  serializeAgent,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/agents`);
    this.addUnimplementedGetRoute(`/agents/:id/categories`);
    this.addUnimplementedGetRoute(`/agents/:id/multimediaDescriptions`);

    this.addPostRoute(`/agents`, this.postAgent);
    this.addGetRoute(`/agents`, this.getAgents);
    this.addGetRoute(`/agents/:id`, this.getAgentById);
    this.addDeleteRoute(`/agents/:id`, this.deleteAgent);
    this.addPatchRoute(`/agents/:id`, this.patchAgent);

    if (app) {
      this.installRoutes(app);
    }
  }

  getAgents = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new AgentConnector();

    // Return to the client
    try {
      return connector.retrieve().then((agents) => serializeResourceCollection(agents, "/2022-04-draft", "agents"));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getAgentById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new AgentConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((agent) => serializeSingleResource(agent, "/2022-04-draft", "agents"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postAgent = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const agent = deserializeAgent(body.data);
    const parsedRequest = new Request(request);
    const connector = new AgentConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(agent).then((agent) => serializeSingleResource(agent, "/2022-04-draft", "agents"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchAgent = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const agent = deserializeAgent(body.data);
    const parsedRequest = new Request(request);
    const connector = new AgentConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(agent).then((agent) => serializeSingleResource(agent, "/2022-04-draft", "agents"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteAgent = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new AgentConnector(parsedRequest);
    console.log("delete agent");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(agentMessage) {
    console.log("The agent message HAS NOT BEEN validated.");
  }
}

module.exports = {
  AgentsRouter,
};
