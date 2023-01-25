const knex = require("./../../src/db/connect");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

knex
  .transaction(function (trx) {
    return fs.promises
      .readFile(path.resolve(__dirname, "test_data.sql"), { encoding: "utf8" })
      .then((query) => trx.raw(query))
      .then((result) => {
        console.log(`Insert test data performed: ${result?.length}`);
        return trx.commit();
      })
      .catch((err) => {
        console.error("Failed to (re)insert tables.", err);
        trx.rollback();
        process.exit(1);
      });
  })
  .finally(() => {
    process.exit(0);
  });
