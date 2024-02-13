const express = require('express');
const router = express.Router();
const userCon=require("./user.controller.js")
const passport = require('passport');
const { myMullter, HME } = require('../utils/multer.js');
require('../utils/passport')(passport);
const authGuard = passport.authenticate("cookie", { session: false });



router.post("/addskill",authGuard,userCon.addSkills)
router.post("/updateUserprofile",authGuard,myMullter().fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),HME,userCon.updateUser);
router.post('/delete', authGuard, userCon.deleteUser);




module.exports = router;