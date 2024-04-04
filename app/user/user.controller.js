const userModel = require("../DB/models/user.Schema.js");
const { sendResponse ,paginationWrapper  } = require("../utils/util.service.js");
const { skillsModel } = require("../utils/utils.schema.js");
const { v4: uuidv4 } = require("uuid");
const constans=require("../utils/constants.js");
const bcrypt = require("bcryptjs");
const tokenSchema = require("../auth/token.schema.js");
const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config.js');
const { imageKit } = require("../utils/imagekit.js");
const applicantModel = require('../DB/models/applicant.schema.js');
const jobModel = require("../DB/models/job.schema.js");
const companyModel = require("../DB/models/company.Schema.js");
const userSkills = require("../DB/skills.js");





//.........add new skills if it does not exist in skillSchema.......//
const addSkills=async(req,res,next)=>{
    try {
        const {skillName}=req.body;
        const checkSkill=await skillsModel.findOne({skillName:skillName.toLowerCase()})
        if(checkSkill){
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Skill already exist",'',[])
        }
        else{
            const {userId}=req.user;
            const skill=await skillsModel.create({
                skillName,
                skillId:"Skill"+uuidv4()
            })
            const user=await userModel.findOneAndUpdate({userId:userId},{$addToSet:{skillIDs:skill._id}},{runValidators:true})
            sendResponse(res,constans.RESPONSE_CREATED,"Done",{},[])
        }
    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
       
    }
}


//.............Update user profile.................//
const updateUser=async(req,res,next)=>{
    try {
        const {userId}=req.user; 
        if(req.body.email){
            return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Not Allow to change Email","",[])
        } 
        let address={}
        if(req.body.address){
            address.address=req.body.address
        }
        if(req.body.city){
            address.city=req.body.city
        }
        if(req.body.country){
            address.country=req.body.country
        }
        if(req.body.state){
            address.state=req.body.state
        }
        if(Object.keys(address).length>0){
            req.body.address=address
        }
        if(req.files && req.files["image"] && req.files["image"][0]){
            const image=await imageKit.upload(
                {
                    file: req.files["image"][0].buffer.toString('base64'), //required
                    fileName: req.files["image"][0].originalname, //required,
                    folder:`internHub/users/${userId}`,
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
                    folder:`internHub/users/${userId}`,
                    useUniqueFileName:true
                },
            );
            req.body.cv=cv.url
        }
        
        const user=await userModel.findOneAndUpdate({userId:userId},{$set:req.body},{runValidators: true})
        sendResponse(res,constans.RESPONSE_SUCCESS,"user updated success",user.userId,[])
    } catch (error) {
        if (error.name === 'ValidationError') {
            let errors = [];
            for (field in error.errors) {
                errors.push({ message: error.errors[field].message, key: field });
            }
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,error.message,{},[])
        } else {
            sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
        }
    }
}




const appliedjobs = async (req, res, next)=>{
    try{
        const { userId } = req.user;
      const{limit,offset}=paginationWrapper(
            page=req.query.page,
            size=req.query.size
          )
        const jobs = await applicantModel.find({userId}).limit(limit).skip(offset);
        if(!jobs){
            sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Job Found!",{},[])
        }else{
            sendResponse(res,constans.RESPONSE_SUCCESS,"Done",jobs,[])
        }
    }catch(error){

        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);

    }
}

//...........Apply to job................//
const applyJob=async(req,res,next)=>{
    try{
        const {userId}=req.user;
    const {jobId}=req.params
    const {coverLetter}=req.body;
    const checkJob=await applicantModel.findOne({userId, jobId})
    if(checkJob){
        sendResponse(res,constans.RESPONSE_BAD_REQUEST,"already apply to this job",{},[])
    }
    else{
        const checkResume=await userModel.findOne({userId}).select("cv")
        if(!checkResume.cv && !req.file){
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"please upload your Cv",{},[])
        }
        else{
            if(req.file){
                const cv=await imageKit.upload({    
                    file:req.file.buffer.toString("base64"),
                    fileName:req.file.originalname,
                    folder:`internHub/${userId}`,
                    useUniqueFileName:true
                })
                req.body.resume=cv.url;
            }
            else{
                req.body.resume=checkResume.cv
            }
            const applyToJob=await applicantModel({
                userId,
                jobId,
                coverLetter,
                status:"pending",
                resume:req.body.resume
            })
            await applyToJob.save()
            sendResponse(res,constans.RESPONSE_SUCCESS,"Successful to applying",{},[])
        }
    }
    }catch(error){
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
    }
  
}


const getAllJobs=async (req,res,next)=>{
    try {
        const{limit,offset}=paginationWrapper(
            page=req.query.page,
            size=req.query.size
          )
            const query={
                statusOfIntern:"active"
            }
        const {title,salary,type,location,duration} =req.query;
        if(title){
            query.title = title;
        }
        if(type){
            query.internType=type
        }
        if(location){
            query.internLocation=location
        }
        if(duration) {
            query.duration=duration
        }
        if(salary){
            query.Salary=salary.toString()
        }
        const filteredData  = await jobModel.find(query).populate([
            {
                path:"company",
                select:"name image"
            }
        ]).skip(offset).limit(limit)
       filteredData.length?sendResponse(res,constans.RESPONSE_SUCCESS,"Done",filteredData ,[]):sendResponse(res,constans.RESPONSE_SUCCESS,"No Job found",{} ,[])
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
   
}


const userData=async(req,res,next)=>{
    try {
        const {userId}=req.user
        const userData=await userModel.findOne({userId}).select("-encryptedPassword -activateEmail -isDeleted -recoveryCodeDate -recoveryCode -__v  -createdAt  -updatedAt -accountType")
        sendResponse(res,constans.RESPONSE_SUCCESS,"Done",userData,[])
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
}


const test=async(req,res,next)=>{
    const sk=userSkills;
    console.log(sk);
}







module.exports={
    addSkills,
    updateUser,
    applyJob,
    appliedjobs,
    getAllJobs,
    userData,
}
