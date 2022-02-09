const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { Agent } = require("../../model/destinationdata2022/agent");

class AgentConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(agent) {
    return this.runTransaction(() => this.insertAgent(agent).then(() => this.retrieveAgent(agent.id)));
  }

  retrieve(id) {
    const agentId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveAgent(agentId));
  }

  update(agent) {
    if (!agent.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveAgent(agent.id)
        .then((oldAgent) => this.updateAgent(oldAgent, agent))
        .then(_.first)
    );
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
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToAgent(_.first(rows));
        }
        throw new Error("Not found");
      } else {
        return rows?.map(this.mapRowToAgent);
      }
    });
  }

  updateAgent(oldAgent, newInput) {
    const newAgent = _.create(oldAgent);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newAgent[k] = v;
    });

    this.checkLastUpdate(oldAgent, newAgent);

    if (this.shouldUpdate(oldAgent, newAgent)) {
      return Promise.all([this.updateResource(newAgent), this.updateContactPoints(newAgent)]).then((promises) => {
        newAgent.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
        return newAgent;
      });
    }

    this.throwNoUpdate(oldAgent);
  }

  mapRowToAgent(row) {
    const agent = new Agent();
    _.assign(agent, row);
    return agent;
  }

  insertAgent(agent) {
    return this.insertResource(agent)
      .then(() => {
        const columns = this.mapAgentToColumns(agent);
        return dbFn.insertAgent(this.connection, columns);
      })
      .then(() => this.insertContactPoints(agent))
      .then(() => agent.id);
  }

  insertContactPoints(agent) {
    const inserts = agent?.contactPoints?.map((point) => this.insertContactPoint(point, agent));
    return Promise.all(inserts ?? []);
  }

  insertContactPoint(contact, agent) {
    return this.insertAddress(contact.address).then((addressId) => {
      const columns = this.mapContactPointToColumns(contact, addressId, agent.id);
      return dbFn.insertContactPoint(this.connection, columns);
    });
  }

  updateContactPoints(agent) {
    const inserts = agent?.contactPoints?.map((contact) => this.insertContactPoint(contact, agent));
    return dbFn.deleteContactPoints(this.connection, agent.id).then(() => Promise.all(inserts ?? []));
  }

  mapAgentToColumns(agent) {
    return { [schemas.agents.id]: agent?.id };
  }

  mapContactPointToColumns(contact, addressId, agentId) {
    return {
      [schemas.contactPoints.addressId]: addressId || undefined,
      [schemas.contactPoints.agentId]: agentId,
      [schemas.contactPoints.availableHours]: contact?.availableHours,
      [schemas.contactPoints.email]: contact?.email,
      [schemas.contactPoints.telephone]: contact?.telephone,
    };
  }
}

module.exports = { AgentConnector };
