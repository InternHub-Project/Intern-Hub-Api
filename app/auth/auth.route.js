const express = require("express");
const router = express.Router();
const authCon = require("./auth.controller.js")
const passport = require("passport");
require("../utils/passport")(passport);
const rateLimiter = require("../utils/rate.limit.js"); //ADDED A RATE-LIMITER USE ((( npm install express-rate-limit )))

router.post("/signUp/user", authCon.signUp);
router.get("/confirmEmail/:token", authCon.confirmemail);
router.post("/login/user", authCon.login);
router.post("/forgotPasswordEmail/user", authCon.forgotPasswordEmail);
router.put("/setPassword/user/:token", authCon.setPassword);
router.post("/reSendcode", rateLimiter, authCon.reSendcode);
router.get("/google",passport.authenticate("google", { scope: ["email", "profile"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "localhost:3003/api/v1/auth/login",
  }),
  authCon.social_google
);
//----------------companyy--------------//
router.post("/signUp/company", authCon.companySignUp);
router.post("/login/company", authCon.companyLogin);

module.exports = router;
