const express 			= require('express');
const router 			= express.Router();
const authCon = require('./auth.controller.js')


router.post('/signUp', authCon.signUp);
router.get("/confirmEmail/:token", authCon.confirmemail);
router.post("/login",authCon.login)
router.post("/forgotPasswordEmail", authCon.forgotPasswordEmail);
router.post("/setPassword/:token", authCon.setPassword);

module.exports = router;