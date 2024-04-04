const { sendResponse ,paginationWrapper  } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jobModel = require("../DB/models/job.schema.js");
const companyModel = require("../DB/models/company.Schema.js");
const applicantModel = require('../DB/models/applicant.schema.js');

const createIntern = async (req, res, next) => {
  try {
    const {
      title,
      startDate,
      duration,
      Salary,
      salaryType,
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
      salaryType,
      internType,
      internLocation,
      numberOfOpenings,
      skills,
      description,
    });
    const jobData = await job.save();
    sendResponse(res, constans.RESPONSE_CREATED, "Done", jobData, []);
  } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", error.message);
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
    sendResponse(res, constans.RESPONSE_SUCCESS, "intern updated success",  job , []);
  } catch (err) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", err.message);
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
      return sendResponse(res, constans.RESPONSE_NOT_FOUND, "Job not found or intern status is already closed", {}, []);
    }
    sendResponse(res, constans.RESPONSE_SUCCESS, "Intern status closed successfully",  updatedStatus , []);
  } catch (err) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", err.message);
  }
};

///...................i will modify this endpoint  later..............//
const companyJobs=async(req,res,next)=>{
  try {
    const {companyId}=req.user
    const{limit,offset}=paginationWrapper(
      page=req.query.page,
      size=req.query.size
    )
    const jobs=await jobModel.find({companyId}).populate([
      {
        path:"applicants",
        populate:{
          path:"user",
          select:"email firstName lastName"
        }
      }
    ]).skip(offset).limit(limit)
    if(!jobs){
      sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Job Found!",{},[])
    }else{
      sendResponse(res,constans.RESPONSE_SUCCESS,"Done",jobs,[])
    }
  } catch (error) {
    sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,constans.UNHANDLED_ERROR,"",error.message);
  }
}


//****** change applicant status *******/

const applicantStatus = async (req, res, next) => {
  try {
    const { userId,status } = req.params;
    const checkUser = await applicantModel.findOne({ userId });

    if (checkUser) {
      const jobId = checkUser.jobId;
      const job = await jobModel.findOne({ jobId });
     if (job) {
        const companyId = req.user?.companyId;
        if (companyId === job.companyId) {
          const newStatus = status.toLowerCase() === 'accepted' ? 'accepted' : 'rejected';
          await applicantModel.findOneAndUpdate({ userId }, { status: newStatus });
          sendResponse(res, constans.RESPONSE_SUCCESS, "Done", `Applicant ${newStatus}`, []); 
        } else {
          sendResponse(res, constans.RESPONSE_BAD_REQUEST,"Company not matched", {}, []);
        }
      } else {
        sendResponse(res, constans.RESPONSE_NOT_FOUND,"Job not found", {}, []);
      }
    } else {
      sendResponse(res, constans.RESPONSE_NOT_FOUND,"User not found" , {}, []);
    }
  } catch (err) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, "", err.message);
  }
};


const companyData=async(req,res,next)=>{
  try {
      const {companyId}=req.user
      const companyData=await companyModel.findOne({companyId}).select("-encryptedPassword -activateEmail")
      sendResponse(res,constans.RESPONSE_SUCCESS,"Done",companyData,[])
  } catch (error) {
      sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
  }
}


const companyProfile=async(req,res,next)=>{
  const {companyId}=req.user; 
  if(req.body.email){
      return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Not Allow to change Email","",[])
  }
  if(req.files && req.files["image"] && req.files["image"][0]){
      const image=await imageKit.upload(
          {
              file: req.files["image"][0].buffer.toString('base64'), //required
              fileName: req.files["image"][0].originalname, //required,
              folder:`internHub/companies/${companyId}`,
              useUniqueFileName:true
          },
      );
      req.body.profileImage=image.url
  }
  if(req.files && req.files["file"] && req.files["file"][0]){
      const cv =await imageKit.upload(
          {
              file:req.files["file"][0].buffer.toString('base64'), //required
              fileName: req.files["file"][0].originalname, //required,
              folder:`internHub/companies/${companyId}`,
              useUniqueFileName:true
          },
      );
      req.body.cv=cv.url
  }
  
  const company=await companyModel.findOneAndUpdate({companyId:companyId},{$set:req.body},{runValidators: true})
  sendResponse(res,constans.RESPONSE_SUCCESS,"profile updated success",company.companyId,[])
}


module.exports = {
  createIntern,
  updateIntren,
  closeIntern,
  companyJobs,
  applicantStatus,
  companyData,
  companyProfile
};
