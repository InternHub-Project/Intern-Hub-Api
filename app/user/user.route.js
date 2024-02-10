const express = require('express');
const router = express.Router();
const userCon=require("./user.controller.js")
const passport = require('passport');
require('../utils/passport')(passport);
const authGuard = passport.authenticate("cookie", { session: false });

router.post("/test",authGuard,userCon.test)




module.exports = router;