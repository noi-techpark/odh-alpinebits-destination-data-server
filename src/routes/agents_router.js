const { Router } = require("./router");
const { AgentConnector } = require("../connectors/destinationdata2022/agent_connector");
const { deserializeAgent } = require("../model/destinationdata2022");

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/agents`);
    this.addUnimplementedGetRoute(`/agents/:id`);
    this.addUnimplementedGetRoute(`/agents/:id/categories`);
    this.addUnimplementedGetRoute(`/agents/:id/multimediaDescriptions`);

    this.addPostRoute(`/agents`, this.postAgent);

    if (app) {
      this.installRoutes(app);
    }
  }

  postAgent = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const agent = deserializeAgent(body.data);
    const connector = new AgentConnector();
    console.log("post agent", agent);

    // Return to the client
    return connector.save(agent);
  };

  validate(agentMessage) {
    console.log("The agent message HAS NOT BEEN validated.");
  }
}

module.exports = {
  AgentsRouter,
};
