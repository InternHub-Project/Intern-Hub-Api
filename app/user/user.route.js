const express = require('express');
const router = express.Router();
const userCon=require("./user.controller.js")
const { myMullter, HME } = require('../utils/multer.js');
const passport = require('passport');
require('../utils/passport')(passport);
const verifyToken = require('../middlewares/verifyToken.js');


router.post("/addskill", verifyToken, userCon.addSkills)
router.put("/updateuserprofile", verifyToken, myMullter().fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]), HME, userCon.updateUser);
router.post("/apply/:jobId",verifyToken,myMullter().single("file"),HME , userCon.applyJob);
router.get("/appliedjob", verifyToken, userCon.appliedjobs);
router.get("/userdata",verifyToken,userCon.userData);
router.get("/skills",userCon.returnSkills);
router.put("/addtofavourite", verifyToken, userCon.addToFavourite);
router.get("/userfavourite", verifyToken, userCon.userFavourite);




module.exports = router;