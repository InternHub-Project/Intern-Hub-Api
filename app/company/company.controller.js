const {sendResponse, paginationWrapper} = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const {v4: uuidv4} = require("uuid");
const jobModel = require("../DB/models/job.schema.js");
const companyModel = require("../DB/models/company.Schema.js");
const applicantModel = require('../DB/models/applicant.schema.js');
const chatModel = require("../DB/models/chat.schema.js");
const userModel = require("../DB/models/user.Schema.js");

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
            questions
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
            questions
        });
        const jobData = await job.save();
        sendResponse(res, constans.RESPONSE_CREATED, "Done", jobData, []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, error.message);
    }
};

const updateIntren = async (req, res, next) => {
    try {
        const {jobId} = req.params;
        const job = await jobModel.findOneAndUpdate(
            {jobId},
            {$set: req.body},
            {runValidators: true}
        );
        sendResponse(res, constans.RESPONSE_SUCCESS, "intern updated success", job, []);
    } catch (err) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, err.message);
    }
};

const closeIntern = async (req, res, next) => {
    try {
        const {jobId} = req.params;
        const {status}=req.body
        const updatedStatus = await jobModel.findOneAndUpdate(
            {jobId, statusOfIntern: {$ne: status}},
            {$set: {statusOfIntern: status}},
            {new: true, runValidators: true}
        );
        if (!updatedStatus) {
            return sendResponse(res, constans.RESPONSE_NOT_FOUND, "Job not found or intern status is already closed", {}, []);
        }
        sendResponse(res, constans.RESPONSE_SUCCESS, "Intern status closed successfully", updatedStatus, []);
    } catch (err) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, [], err.message);
    }
};

///............jobs that company make..............//
const companyJobs = async (req, res, next) => {
    try {
        const {companyId} = req.user
        const {search, skip} = req.query
        const {limit, offset} = paginationWrapper(
            page = req.query.page,
            size = req.query.size
        )
        let jobs
        if (search) {
            jobs = await jobModel.find({
                $and: [
                    {companyId},
                    {
                        $or: [
                            {skills: {$regex: new RegExp(search, 'i')}},
                            {title: {$regex: new RegExp(search, 'i')}},
                            {statusOfIntern:search},
                            {internType: {$regex: new RegExp(search, 'i')}},
                        ]
                    }
                ]
            }).sort({createdAt: -1,statusOfIntern:1}).skip(offset||skip).limit(limit)
        } else {
            jobs = await jobModel.find({companyId}).sort({createdAt: -1,statusOfIntern:1}).skip(offset || skip).limit(limit)
        }
        if (!jobs.length) {
            sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found!", [], [])
        } else {
            sendResponse(res, constans.RESPONSE_SUCCESS, "Done", jobs, [])
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, [], error.message);
    }
}


//****** change applicant status *******/

const applicantStatus = async (req, res, next) => {
    try {
        const {userId, status} = req.params;
        const checkUser = await applicantModel.findOne({userId});

        if (checkUser) {
            const jobId = checkUser.jobId;
            const job = await jobModel.findOne({jobId});
            if (job) {
                const companyId = req.user?.companyId;
                if (companyId === job.companyId) {
                    const newStatus = status.toLowerCase() === 'accepted' ? 'accepted' : 'rejected';
                    await applicantModel.findOneAndUpdate({userId}, {status: newStatus});
                    sendResponse(res, constans.RESPONSE_SUCCESS, "Done", `Applicant ${newStatus}`, []);
                } else {
                    sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Company not matched", {}, []);
                }
            } else {
                sendResponse(res, constans.RESPONSE_NOT_FOUND, "Job not found", {}, []);
            }
        } else {
            sendResponse(res, constans.RESPONSE_NOT_FOUND, "User not found", {}, []);
        }
    } catch (err) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, err.message);
    }
};


const companyData = async (req, res, next) => {
    try {
        const {companyId} = req.user
        const companyData = await companyModel.findOne({companyId}).select("-encryptedPassword -activateEmail")
        sendResponse(res, constans.RESPONSE_SUCCESS, "Done", companyData, [])
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}


const companyProfile = async (req, res, next) => {
    const {companyId} = req.user;
    if (req.body.email) {
        return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Not Allow to change Email", "", [])
    }
    let address = {}
    if (req.body.address) {
        address.address = req.body.address
    }
    if (req.body.city) {
        address.city = req.body.city
    }
    if (req.body.country) {
        address.country = req.body.country
    }
    if (req.body.state) {
        address.state = req.body.state
    }
    if (Object.keys(address).length > 0) {
        req.body.address = address
    }
    if (req.files && req.files["image"] && req.files["image"][0]) {
        const image = await imageKit.upload(
            {
                file: req.files["image"][0].buffer.toString('base64'), //required
                fileName: req.files["image"][0].originalname, //required,
                folder: `internHub/companies/${companyId}`,
                useUniqueFileName: true
            },
        );
        req.body.profileImage = image.url
    }

    const company = await companyModel.findOneAndUpdate({companyId: companyId}, {$set: req.body}, {runValidators: true})
    sendResponse(res, constans.RESPONSE_SUCCESS, "profile updated success", company.companyId, [])
}


const acceptedOrRejectedIntern=async(req,res)=>{
    try {
        const {status,userId,jobId}=req.body
        const {companyId}=req.user
        const checkValid=await jobModel.findOne({companyId,jobId})
        if(checkValid){
            const newStatus=status.toLowerCase()
            const convertStatus=await applicantModel.findOneAndUpdate({userId,jobId},{status:newStatus})
            if(convertStatus){
                sendResponse(res,constans.RESPONSE_SUCCESS,"Done",{},[])
            }
            else{
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"something wrong",{},[])
            }
        }
        else{
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"something wrong",{},[])
            
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, []);
        
    }
}


const startCaht = async(req,res)=>{
    try {
        const {userId} = req.body
        const {companyId} = req.user
        const chat = await chatModel.findOne({companyId, userId});
        if(!chat){
            const newChat = await chatModel({
                companyId,
                userId,
                messages: []
            });
            await newChat.save();
            return sendResponse(res,constans.RESPONSE_CREATED,"Done",{},{});
        }
        const userName = await userModel.findOne({userId}).select('userName');
        sendResponse(res,constans.RESPONSE_FORBIDDEN,`already have chat with ${userName.userName}`,{},{});
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, []);
    }
}

const closeCaht = async(req,res)=>{
    try {
        const {userId} = req.body
        const {companyId} = req.user
        await chatModel.findOneAndUpdate({companyId, userId},{status: 'close'});
        sendResponse(res,constans.RESPONSE_CREATED,"Done",{},{});
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, {}, []);
    }
}



module.exports = {
    createIntern,
    updateIntren,
    closeIntern,
    companyJobs,
    applicantStatus,
    companyData,
    companyProfile,
    acceptedOrRejectedIntern,
    startCaht,
    closeCaht
};
