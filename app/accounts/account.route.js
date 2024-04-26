const express = require("express");
const router = express.Router();
const passport = require("passport");
const accCon=require("./account.controller.js");
const verifyToken = require("../middlewares/verifyToken.js");
require("../utils/passport")(passport);



router.delete('/delete', verifyToken, accCon.deleteAccount);
router.put("/changePassword",verifyToken, accCon.changePassword);
router.get("/user_or_company_list",verifyToken, accCon.userOrCompanyList);










module.exports = router;
