const express 			= require('express');
const router 			= express.Router();
const authCon = require('../controller/auth.controller')


router.post('/signUp', authCon.signUp);

module.exports = router;