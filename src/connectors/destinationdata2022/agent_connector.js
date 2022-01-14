const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { ContactPoint, Address, Text } = require("../../model/destinationdata2022/datatypes");
const { Agent } = require("../../model/destinationdata2022/agent");

class AgentConnector extends ResourceConnector {
  constructor(request) {
    super(request);
    this.request = request;
  }

  create(agent) {
    return this.runTransaction(() => this.insertAgent(agent).then((id) => this.retrieveAgent(id)));
  }

  retrieve(id) {
    const agentId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveAgent(agentId));
  }

  delete(id) {
    const agentId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteAgent(agentId));
  }

  deleteAgent(id) {
    return this.deleteResource(id, "agents");
  }

  retrieveAgent(id) {
    return dbFn.selectAgentFromId(this.connection, id).then((rows) => {
      const agent = new Agent();
      console.log("agent's class: ", agent.constructor.name);
      return agent;
    });
  }

  insertAgent(agent) {
    return this.insertResource(agent)
      .then((agentId) => (agent.id = agentId))
      .then(() => this.mapAgentToColumns(agent))
      .then((columns) => dbFn.insertAgent(this.connection, columns))
      .then(() => this.insertContactPoints(agent))
      .then(() => agent.id);
  }

  insertContactPoints(agent) {
    const inserts = agent?.contactPoints?.map((point) => this.insertContactPoint(point, agent));
    return Promise.all(inserts);
  }

  insertContactPoint(point, agent) {
    return this.insertAddress(point.address)
      .then((addressId) => this.mapContactPointToColumns(point, addressId, agent.id))
      .then((columns) => dbFn.insertContactPoint(this.connection, columns));
  }

  mapAgentToColumns(agent) {
    return { [schemas.agents.id]: agent?.id };
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
