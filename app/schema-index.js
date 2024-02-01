'use strict';
const db = {};
const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

db.mongoose = mongoose;
db.url = dbConfig.url;

module.exports = db;