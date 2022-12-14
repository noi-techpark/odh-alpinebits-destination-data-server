const fs = require("fs");
require("dotenv").config();
const filepath = "./pgadmin-servers.json";
let servers = {
  Servers: {
    test: {
      Name: process.env.DB_NAME,
      Group: "Servers",
      Port: process.env.DB_PORT,
      Username: process.env.DB_USERNAME,
      Host: process.env.DB_HOST,
      SSLMode: "prefer",
      MaintenanceDB: "postgres",
    },
  },
};
let servers_data = JSON.stringify(servers, null, 2);
fs.writeFileSync(filepath, servers_data);
