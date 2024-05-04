const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../utils/passport")(passport);
const authGuard = passport.authenticate("cookie", { session: false });
const companyCon = require("./company.controller.js");

const verifyToken = require("../middlewares/verifyToken.js");
const { myMullter, HME } = require("../utils/multer.js");

router.post("/createJob", verifyToken, companyCon.createIntern);
router.put("/updateJob/:jobId", verifyToken, companyCon.updateIntren);
router.put("/closeJob/:jobId", verifyToken, companyCon.closeIntern);
router.get("/companyjobs",verifyToken,companyCon.companyJobs)
router.put("/applicantStatus/:userId/:status",verifyToken,companyCon.applicantStatus);
router.get("/companydata",verifyToken,companyCon.companyData)
router.put("/updatecompanyprofile",verifyToken,myMullter().fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),HME,companyCon.companyProfile)
router.patch("/change_intern_status",verifyToken,companyCon.acceptedOrRejectedIntern)
router.post("/startchat",verifyToken,companyCon.startCaht)
router.patch("/closechat",verifyToken,companyCon.closeCaht)



module.exports = router;
