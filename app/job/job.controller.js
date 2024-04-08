const jobModel = require("../DB/models/job.schema.js");
const { paginationWrapper, sendResponse } = require("../utils/util.service.js");
const constans=require("../utils/constants.js");
const userModel = require("../DB/models/user.Schema.js");
const applicantModel = require("../DB/models/applicant.schema.js");



async function fetchJobsBasedOnSkills(skills) {
    const allJobs = await jobModel.find();
    return allJobs.filter(job =>
        job.skills.some(skill => skills.includes(skill))
    );
}



const getAllJobs=async (req,res,next)=>{
    try {
        const{limit,offset}=paginationWrapper(
            page=req.query.page,
            size=req.query.size
          )
            const query={}
        if(req.query.search){
            query.search=req.query.search
        }
        const filteredData  = await jobModel.find({$or:[
            { skills: { $regex: new RegExp(query.search, 'i') } },
            {title: { $regex: new RegExp(query.search, 'i') }},
            {description:{ $regex: new RegExp(query.search, 'i') }}
        ]}).populate([
            {
                path:"company",
                select:"name image"
            }
        ]).skip(offset||req.query.skip).limit(limit).sort({createdAt:-1})
        const updatedFilteredData = filteredData.map(document => {
            const job = document.toObject();
            job.companyName = job.company[0]?.name; 
            job.companyImage=job.company[0]?.image
            // Remove the company field
            delete job.company;
            return job;
        });
        updatedFilteredData.length?sendResponse(res,constans.RESPONSE_SUCCESS,"Done",updatedFilteredData ,[]):sendResponse(res,constans.RESPONSE_SUCCESS,"No Job found",{} ,[])
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
}


const recommendedJobs = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const {init,limit}=req.query
        const user = await userModel.findOne({ userId });
        if (!user) {
            return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"User not found", "", []);
        }
        const { skills } = user;
        const jobs = await fetchJobsBasedOnSkills(skills);
        if (jobs.length === 0) {
            return sendResponse(res,constans.RESPONSE_SUCCESS,"No recommended jobs for you.", "", []);
        }
        else{
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const numberOfJobsToSend = limit||10
        const initNumber=init||0
        const limitedJobs = jobs.slice(initNumber, numberOfJobsToSend);
        return sendResponse(res,constans.RESPONSE_SUCCESS,"recommended jobs",limitedJobs,[]);
        }
      
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '',[]);
    }
};



const Applications=async(req,res)=>{
        const {userId}=req.user;
        const{limit,offset}=paginationWrapper(
            page=req.query.page,
            size=req.query.size
          )
        const checkUser=await userModel.findOne({userId})
        if(!checkUser)
        {
            return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"User not found", "", []);
        }
        else{
            const  applications=await applicantModel.find({userId:userId}).skip(offset||req.body.skip).limit(limit).sort({createdAt:-1}).populate([
                {
                    path:"user",
                    select:"email userName skills phone userName"
                },
                {
                    path:"job",populate:{
                        path:"company",
                        select:"name"
                    }
                }
            ])
            if(!applications){
                return sendResponse(res,constans.RESPONSE_SUCCESS,"No application Found ,applay to Jobs","",[])
            }
            else{
                const transformedApplications = applications.map(app => {
                    // Destructure the application document to extract fields you want to omit or modify
                    const { __v, ...rest } = app.toObject({ getters: true });
                    const userObject = app.user[0];
                    const jobObject = app.job[0];
                    const companyObject=app.job[0].company[0]
                    // Construct a new object with the fields you want to keep or add
                    const newObject = {
                        //.....applicants.....//
                        applicantId:res.applicantId,
                        numberOfApplicants:jobObject.numberOfApplicants,
                        createdAt:rest.createdAt,
                        //.....user......//
                        userId:rest.userId,
                        email:userObject.email,
                        phone:userObject.phone,
                        userName:userObject.userName,
                        resume:rest.resume,
                        coverLetter:rest.coverLetter,
                        userSkills:userObject.skills,
                        status:rest.status,
                        points:rest.points,
                        missingSkills:rest.missingSkills,
                        //.....Job.....//
                        jobId:rest.jobId,
                        jobtitle:jobObject.title,
                        //......company.....//
                        companyId:companyObject.companyId,
                        companyName:companyObject.name,
                    };
                
                    return newObject;
                });
                sendResponse(res,constans.RESPONSE_SUCCESS,"Done",transformedApplications,[]);
            }
         
        }
}

const jobDetails=async(req,res,next)=>{
    const {jobId}=req.params
    if(!jobId){
        return sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Invalid Job ID","",[])
    }
    else{
        const jobdetails=await jobModel.findOne({jobId})
        if(!jobdetails){
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Job is Not found","",[])
    }
    else{
        sendResponse(res,constans.RESPONSE_SUCCESS,"Done",jobdetails,[]);
    }
    }
   }







module.exports={
    getAllJobs,
    recommendedJobs,
    Applications,
    jobDetails
}