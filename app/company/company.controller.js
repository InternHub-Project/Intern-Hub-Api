const { sendResponse} = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jobModel = require("../DB/models/job.schema.js");



const createIntern=async(req,res,next)=>{
    try {
        const {title,startDate,duration,Salary,internType,internLocation,numberOfOpenings,skills,description}=req.body
        const job=await jobModel({
            jobId:"Job"+uuidv4(),
            companyId:req.user.companyId,
            title,
            startDate,
            duration,
            Salary,
            internType,
            internLocation,
            numberOfOpenings,
            skills,
            description
        })
    const jobData=await job.save();
    sendResponse(res,constans.RESPONSE_CREATED,"Done",jobData,[]);
    } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
    }
       
}



module.exports = {
createIntern
};