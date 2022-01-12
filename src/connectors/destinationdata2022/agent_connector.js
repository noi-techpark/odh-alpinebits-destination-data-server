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

  retrieve() {
    return this.runTransaction(() => this.retrieveAgent());
  }

  save(agent) {
    return this.runTransaction(() => this.insertAgent(agent));
  }

  retrieveAgent() {
    const agent = new Agent();
    const agentId = this.request?.params?.id;

    return this.selectResourceFromId(agentId, agent)
      .then(() => this.selectAgentRelatedDataFromId(agentId, agent))
      .then(() => agent);
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

  selectAgentRelatedDataFromId(agentId, agent) {
    return Promise.all([this.selectContactPointsFromId(agentId, agent)]);
  }

  selectContactPointsFromId(agentId, agent) {
    return dbFn
      .selectContactPointsFromId(this.connection, agentId)
      .then((rows) =>
        rows?.map((row) => {
          const contact = this.mapRowToContactPoint(row, agent);
          const addressId = row[schemas.contactPoints.addressId];
          return [addressId, contact.address];
        })
      )
      .then((ret) => ret?.map(([addressId, address]) => this.selectAddressTextsFromId(addressId, address)))
      .then(() => agent);
  }

  mapRowToContactPoint(row, agent) {
    const contact = new ContactPoint();

    contact.availableHours = row[schemas.contactPoints.availableHours] ?? null;
    contact.email = row[schemas.contactPoints.email] ?? null;
    contact.telephone = row[schemas.contactPoints.telephone] ?? null;
    contact.address = new Address();

    agent.addContactPoint(contact);

    return contact;
  }
}

module.exports = { AgentConnector };
