const express 			= require('express');
const router 			= express.Router();
const authCon = require('./auth.controller.js');
const passport = require('passport');
require("../utils/passport")(passport);



router.post('/signUp', authCon.signUp);
router.get("/confirmEmail/:token", authCon.confirmemail);
router.post("/login",authCon.login)
router.post("/forgotPasswordEmail", authCon.forgotPasswordEmail);
router.put("/setPassword/:token", authCon.setPassword);
router.get("/google",passport.authenticate("google",{scope:["email","profile"]}))
router.get("/google/callback",passport.authenticate("google",{failureRedirect:"localhost:3003/api/v1/auth/login"}),authCon.social_google)

module.exports = router;