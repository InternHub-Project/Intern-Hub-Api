module.exports = {
    v1routes: function (app) {
        app.use('/api/v1/auth', require('./auth/router/auth.route'));

    }
};
