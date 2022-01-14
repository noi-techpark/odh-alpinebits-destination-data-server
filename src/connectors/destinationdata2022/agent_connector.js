const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { ContactPoint, Address, Text } = require("../../model/destinationdata2022/datatypes");
const { Agent } = require("../../model/destinationdata2022/agent");

const colors = {
  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgWhite: "\x1b[37m",
};

function logDiff(_old, _new) {
  _.keys(_old).forEach((key) => {
    const oldValue = _.get(_old, key);
    const newValue = _.get(_new, key);

    if (_.isEqual(oldValue, newValue)) {
      logNoChange(key);
    } else if (_.isEmpty(oldValue)) {
      logAddition(key, newValue);
    } else if (_.isNull(newValue)) {
      logRemoval(key, oldValue, newValue);
    } else {
      logUpdate(key, oldValue, newValue);
    }
  });
}

function logNoChange(key) {
  console.log("NO CHANGE ON", key);
}

function logAddition(key, newValue) {
  console.log(`${colors.FgGreen}ADD ${key}${colors.FgWhite}`, newValue);
}

function logRemoval(key, oldValue, newValue) {
  console.log(`${colors.FgRed}REMOVE ${key}${colors.FgWhite}`, oldValue);
}

function logUpdate(key, oldValue, newValue) {
  console.log(`${colors.FgYellow}UPDATE ${key}${colors.FgWhite}`, oldValue, newValue);
}

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

  update(agent) {
    return this.runTransaction(() =>
      this.retrieveAgent(agent.id).then((oldAgent) => this.updateAgent(oldAgent, agent))
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
    logDiff(oldAgent, newInput);
    const newAgent = _.create(oldAgent, newInput);

    this.checkLastUpdate(oldAgent, newAgent);

    if (!_.isEqual(newAgent, oldAgent)) {
      return newAgent;
    }

    this.throwNoUpdate(oldAgent);
  }

  mapRowToAgent(row) {
    const agent = new Agent();
    Object.assign(agent, row);
    return agent;
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
    return Promise.all(inserts ?? []);
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
