if (process.argv.includes("--test")) {
  require("custom-env").env("test");
} else {
  require("custom-env").env();
}

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
});

module.exports = knex;
