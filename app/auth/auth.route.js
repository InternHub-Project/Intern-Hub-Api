const express 			= require('express');
const router 			= express.Router();
const authCon = require('./auth.controller.js')


router.post('/signUp', authCon.signUp);
router.get("/confirmEmail/:token", authCon.confirmemail);
router.post("/login",authCon.login)

module.exports = router;