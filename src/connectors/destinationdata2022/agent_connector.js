const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");

class AgentConnector extends ResourceConnector {
  constructor(request) {
    super(request);

    this.request = request;
  }

  async save(agent) {
    this.runTransaction(() => this.insertAgent(agent));
  }

  async insertAgent(agent) {
    agent.id = await this.insertResource(agent);

    const columns = this.mapAgentToColumns(agent);
    await dbFn.insertAgent(this.connection, columns);

    this.insertContactPoints(agent);

    return agent.id;
  }

  async insertContactPoints(agent) {
    const inserts = agent?.contactPoints?.map((point) => this.insertContactPoint(point, agent));
    return Promise.all(inserts);
  }

  async insertContactPoint(point, agent) {
    let addressId;
    console.log("beep");
    if (_.has(point, "address")) {
      addressId = await this.insertAddress(point.address);
    }

    const columns = this.mapContactPointToColumns(point, addressId, agent.id);
    return dbFn.insertContactPoint(this.connection, columns);
  }

  mapAgentToColumns(agent) {
    return { [schemas.agents.agentId]: agent?.id };
  }

  mapContactPointToColumns(point, addressId, agentId) {
    return {
      [schemas.contactPoints.addressId]: addressId || undefined,
      [schemas.contactPoints.agentId]: agentId,
      [schemas.contactPoints.availableHours]: point?.availableHours,
      [schemas.contactPoints.email]: point?.email,
      [schemas.contactPoints.telephone]: point?.telephone,
    };
  }
}

module.exports = { AgentConnector };
