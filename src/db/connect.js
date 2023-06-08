// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

require("custom-env").env();

const host = process.env.DB_HOST;
const database = process.env.DB_NAME;
const port = process.env.DB_PORT;
const user = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const knex = require("knex")({
  client: "pg",
  connection: {
    host,
    port,
    user,
    password,
    database,
  },
  // pool: {
  // min: 2,
  // max: 6,
  // createTimeoutMillis: 300000,
  // acquireTimeoutMillis: 300000,
  // idleTimeoutMillis: 300000,
  // reapIntervalMillis: 10000,
  // createRetryIntervalMillis: 1000,
  // propagateCreateError: false, // <- default is true, set to false
  // },
});

module.exports = knex;
