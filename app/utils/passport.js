const { ExtractJwt, Strategy } = require('passport-jwt');
const User = require("../user/user.schema");
const CONFIG        = require('../../config/config');
const {to}          = require('./util.service');
const LOG = require('../../config/logger');

module.exports = function(passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;
    passport.use("appAuth",new Strategy(opts, async function(jwt_payload, done){
        let err, user;
        [err, user] = await to(User.findOne({_id: jwt_payload.user_id}));
        //validTokenSchema.findOne({userId: jwt_payload.user_id, token: fromAuthHeaderAsBearerToken()});
        if(err) return done(err, false);
        if(user) {
            LOG.info("logged user :" + user.loginId);
            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
}