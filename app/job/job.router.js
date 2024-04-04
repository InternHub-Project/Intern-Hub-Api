const express = require("express");
const router = express.Router();
const jonCon = require("./job.controller.js");

const verifyToken = require("../middlewares/verifyToken.js");
const { myMullter, HME } = require("../utils/multer.js");

router.get("/jobs",jonCon.getAllJobs)



module.exports = router;
