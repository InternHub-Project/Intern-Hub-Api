const CONFIG = require('../config/config.js');

module.exports = {
    v1routes: function (app) {
        app.use(`${CONFIG.BASEURL}/auth`, require('./auth/auth.route'));
        app.use(`${CONFIG.BASEURL}/user`,require("./user/user.route"));
    }
};
