const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");

class AgentConnector extends ResourceConnector {
  constructor(request) {
    super(request);

    this.request = request;
  }

  save(agent) {
    return this.runTransaction(() => this.insertAgent(agent));
  }

  insertAgent(agent) {
    return this.insertResource(agent)
      .then((agentId) => (agent.id = agentId))
      .then(() => this.mapAgentToColumns(agent))
      .then((columns) => dbFn.insertAgent(this.connection, columns))
      .then(() => this.insertContactPoints(agent))
      .then(() => this.insertCategories(agent))
      .then(() => agent.id);
  }

  insertContactPoints(agent) {
    const inserts = agent?.contactPoints?.map((point) => this.insertContactPoint(point, agent));
    return Promise.all(inserts);
  }

  insertCategories(agent) {
    const inserts = agent?.categories?.map((category) => this.insertCategory(category, agent));
    return Promise.all(inserts);
  }

  insertContactPoint(point, agent) {
    return this.insertAddress(point.address)
      .then((addressId) => this.mapContactPointToColumns(point, addressId, agent.id))
      .then((columns) => dbFn.insertContactPoint(this.connection, columns));
  }

  insertCategory(category, agent) {
    if (!_.isObject(category) || !_.size(category) === 2) throw new Error("Bad category reference.");

    const columns = this.mapResourceCategoryToColumns(category.id, agent.id);

    return dbFn.insertResourceCategory(this.connection, columns);
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

  mapResourceCategoryToColumns(categoryId, agentId) {
    return {
      [schemas.resourceCategories.categoryId]: categoryId,
      [schemas.resourceCategories.categorizedResourceId]: agentId,
    };
  }
}

module.exports = { AgentConnector };
