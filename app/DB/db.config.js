const CONFIG = require("../../config/config");
const username = CONFIG.db_user;
const password = CONFIG.db_password;
const cluster = CONFIG.db_cluster;
const db_name = CONFIG.db_name;

module.exports = {
  url: `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${db_name}?retryWrites=true&w=majority`,
};
