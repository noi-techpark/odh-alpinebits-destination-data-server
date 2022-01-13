const { Router } = require("./router");
const { AgentConnector } = require("../connectors/destinationdata2022/agent_connector");
const { deserializeAgent } = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/agents`);
    this.addUnimplementedGetRoute(`/agents/:id/categories`);
    this.addUnimplementedGetRoute(`/agents/:id/multimediaDescriptions`);

    this.addPostRoute(`/agents`, this.postAgent);
    this.addGetRoute(`/agents/:id`, this.getAgent);
    this.addDeleteRoute(`/agents/:id`, this.deleteAgent);

    if (app) {
      this.installRoutes(app);
    }
  }

  getAgent = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new AgentConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieveOne();
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
    const connector = new AgentConnector();

    // Return to the client
    try {
      return connector.save(agent);
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
      return connector.deleteOne();
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
