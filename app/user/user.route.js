const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../utils/passport')(passport);
const authGuard = passport.authenticate("appAuth", { session: false });


// routes



module.exports = router;