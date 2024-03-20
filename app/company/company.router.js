const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../utils/passport")(passport);
const companyCon = require("./company.controller.js");
const authGuard = passport.authenticate("cookie", { session: false });
const verifyToken = require('../middlewares/verifyToken.js');

router.post("/createJob", verifyToken, companyCon.createIntern);
router.put("/updateJob/:jobId", verifyToken, companyCon.updateIntren);
router.put("/closeJob/:jobId", verifyToken, companyCon.closeIntern);
router.get("/companyjobs", verifyToken, companyCon.companyJobs)
router.put("/applicantStatus/:userId/:status", verifyToken, companyCon.applicantStatus);
module.exports = router;
