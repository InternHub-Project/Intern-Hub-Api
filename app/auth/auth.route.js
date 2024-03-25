const express = require("express");
const router = express.Router();
const authCon = require("./auth.controller.js");
const passport = require("passport");
require("../utils/passport")(passport);
const rateLimiter = require("../utils/rate.limit.js"); //ADDED A RATE-LIMITER USE ((( npm install express-rate-limit )))

router.post("/user/signup", authCon.signUp);
router.post("/user/login", authCon.login);
router.post("/reSendcode", rateLimiter, authCon.reSendcode);

//----------------companyy--------------//
router.post("/company/signup", authCon.companySignUp);
router.post("/company/login", authCon.companyLogin);

//.................user And Company................//
router.get("/confirmemail/:token", authCon.confirmemail);
router.put("/setPassword", authCon.setPassword);
router.post("/forgetPassword", authCon.forgetPassword);

router.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "localhost:3003/api/v1/auth/login",
  }),
  authCon.social_google
);

router.get('/facebook', passport.authenticate('facebook', { scope: ["email"] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: 'localhost:3003/api/v1/auth/login' }),
  authCon.social_facebook
);

router.get("/github",passport.authenticate('github',{ scope: [ 'user:email' ] }))
router.get("/github/callback",(req,res,next)=>{
 res.redirect("/api/v1/auth/github/success")
})
router.get("/github/success",(req,res,next)=>{
  console.log(req.session);
  const userinfo={
    id:req.session.id,
  }
  res.render("success",{user:userinfo})
})




module.exports = router;
