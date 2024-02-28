const { sendResponse } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jobModel = require("../DB/models/job.schema.js");
const paginate = require("../utils/pagination.js");

const createIntern = async (req, res, next) => {
  try {
    const {
      title,
      startDate,
      duration,
      Salary,
      internType,
      internLocation,
      numberOfOpenings,
      skills,
      description,
    } = req.body;
    const job = await jobModel({
      jobId: "Job" + uuidv4(),
      companyId: req.user.companyId,
      title,
      startDate,
      duration,
      Salary,
      internType,
      internLocation,
      numberOfOpenings,
      skills,
      description,
    });
    const jobData = await job.save();
    sendResponse(res, constans.RESPONSE_CREATED, "Done", jobData, []);
  } catch (error) {
    sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      "",
      error.message
    );
  }
};

const updateIntren = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await jobModel.findOneAndUpdate(
      { jobId },
      { $set: req.body },
      { runValidators: true }
    );
    sendResponse(
      res,
      constans.RESPONSE_SUCCESS,
      "intern updated success",
      { job },
      []
    );
  } catch (err) {
    sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      "",
      err.message
    );
  }
};

const closeIntern = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const updatedStatus = await jobModel.findOneAndUpdate(
      { jobId, statusOfIntern: { $ne: "closed" } },
      { $set: { statusOfIntern: "closed" } },
      { new: true, runValidators: true }
    );
    if (!updatedStatus) {
      return sendResponse(
        res,
        constans.RESPONSE_NOT_FOUND,
        "Job not found or intern status is already closed",
        {},
        []
      );
    }
    sendResponse(
      res,
      constans.RESPONSE_SUCCESS,
      "Intern status closed successfully",
      { job: updatedStatus },
      []
    );
  } catch (err) {
    sendResponse(
      res,
      constans.RESPONSE_INT_SERVER_ERROR,
      constans.UNHANDLED_ERROR,
      "",
      err.message
    );
  }
};


const companyJobs=async(req,res,next)=>{
  try {
    const {companyId}=req.user
    const{skip,limit}=paginate({
      page:req.query.page,
      size:req.query.size
    })
    const jobs=await jobModel.find({companyId}).populate([
      {
        path:"company",
        select:"name address image"
      }
    ],
    ).limit(limit).skip(skip)
    if(!jobs){
      sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Job Found!",{},[])
    }else{
    sendResponse(res,constans.RESPONSE_SUCCESS,"Done",{jobs},[])
    }
  } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
  }
}

module.exports = {
  createIntern,
  updateIntren,
  closeIntern,
  companyJobs
};
