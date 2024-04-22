const express = require("express");
const router = express.Router();
const authCon = require("./auth.controller.js");
const passport = require("passport");
require("../utils/passport")(passport);
const rateLimiter = require("../utils/rate.limit.js"); //ADDED A RATE-LIMITER USE ((( npm install express-rate-limit )))

//----------------User--------------//
router.post("/user/signup", authCon.signUp);
router.post("/user/login", authCon.login);
router.post('/googlelogin',authCon.googleLogin)


//----------------company--------------//
router.post("/company/signup", authCon.companySignUp);
router.post("/company/login", authCon.companyLogin);


//.................user And Company................//
router.get("/confirmemail/:token", authCon.confirmemail);
router.put("/setPassword", authCon.setPassword);
router.post("/forgetPassword", authCon.forgetPassword);
router.post("/istokenvalid",authCon.checkToken)
router.post("/reSendcode", rateLimiter, authCon.reSendcode);
router.post("/logout", authCon.signOut)



module.exports = router;
