const jobModel = require("../DB/models/job.schema.js");
const {paginationWrapper, sendResponse} = require("../utils/util.service.js");
const constans = require("../utils/constants.js");
const userModel = require("../DB/models/user.Schema.js");
const applicantModel = require("../DB/models/applicant.schema.js");
const { addCompanyNameAndImageToResponse, prepareQuery } = require("./helper.js");
const userSkills = require("../DB/skills.js");
const companyModel = require("../DB/models/company.Schema.js");



const recommendedJobs = async (req, res) => {
    try {
        const {userId} = req.user;
        const {skip, size} = req.query
        const user = await userModel.findOne({userId});
        if (!user) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "User not found", [], []);
        }

        const {skills: userSkills} = user;
        const jobsData = await jobModel.find({skills: {$in: userSkills}}).skip(skip).limit(size).sort({createdAt: -1});

        if (jobsData.length) {
            return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", jobsData, []);
        }

        sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, [], []);
    }
};

//......All jobs that user apply to ............//
const Applications = async (req, res) => {
    try {
        const {userId} = req.user;
        const {limit, offset} = paginationWrapper(
            req.query.page,
            req.query.size
        )
        const checkUser = await userModel.findOne({userId})
        if (!checkUser) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "User not found", "", []);
        } else {
            const applications = await applicantModel.find({userId: userId}).skip(offset || req.body.skip).limit(limit).sort({createdAt: -1}).populate([
                {
                    path: "user",
                    select: "email userName skills phone userName"
                },
                {
                    path: "job", populate: {
                        path: "company",
                        select: "name"
                    }
                }
            ])
            if (!applications) {
                return sendResponse(res, constans.RESPONSE_SUCCESS, "No application Found ,applay to Jobs", "", [])
            } else {

                const transformedApplications = applications.map(app => {
                    // Destructure the application document to extract fields you want to omit or modify
                    const {__v, ...rest} = app.toObject({getters: true});
                    const userObject = app.user[0];
                    const jobObject = app.job[0];
                    const companyObject = app.job[0].company[0]
                  
                    // Construct a new object with the fields you want to keep or add
                    return {
                        //.....applicants.....//
                        applicantId: rest?.applicantId,
                        numberOfApplicants: jobObject?.numberOfApplicants,
                        createdAt: rest?.createdAt,
                        //.....user......//
                        userId: rest?.userId,
                        email: userObject?.email,
                        phone: userObject?.phone,
                        userName: userObject?.userName,
                        resume: rest?.resume,
                        coverLetter: rest?.coverLetter,
                        userSkills: userObject?.skills,
                        status: rest?.status,
                        points: rest?.points,
                        missingSkills: rest?.missingSkills,
                        //.....Job.....//
                        jobId: rest?.jobId,
                        jobtitle: jobObject?.title,
                        //......company.....//
                        companyId: companyObject?.companyId,
                        companyName: companyObject?.name,
                    };
                });

                sendResponse(res, constans.RESPONSE_SUCCESS, "Done", transformedApplications, []);
            }
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const jobDetails = async (req, res) => {
    try {
        const {jobId} = req.params
        if (!jobId) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Invalid Job ID", "", [])
        } else {
            const jobdetails = await jobModel.findOne({jobId}).populate('company', 'name image')
                const job = jobdetails.toObject();
                job.companyName = job.company[0]?.name;
                job.companyImage = job.company[0]?.image;
                delete job.company;
            if (!job) {
                sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Job is Not found", "", [])
            } else {
                sendResponse(res, constans.RESPONSE_SUCCESS, "Done", job, []);
            }
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const jobApplicants = async (req, res) => {
    try {
        const {limit, offset} = paginationWrapper(
            req.query.page,
            req.query.size
        )
        const {companyId} = req.user;
        const {jobId} = req.params;
        if (!jobId) {
            return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Invalid Job ID", "", [])
        }
        const pipeline=[
            {
                $match:{
                    jobId,
                    companyId
                }
            },
            {
                $lookup: {
                    from: "applicants", // Collection name to populate from
                    let: { jobId: "$jobId" }, // Local variables for the pipeline
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$$jobId", "$jobId"] } // Match foreignField with localField
                            }
                        },
                        {
                            $sort: { createdAt: -1}
                        },
                        {
                            $skip: parseInt(offset) // Skip documents based on pagination
                        },
                        {
                            $limit: parseInt(limit) // Limit the number of documents returned
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "userId",
                                as: "user"
                            }
                        },
                        {
                            $addFields: {
                                user: { $arrayElemAt: ["$user", 0] } 
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                userId:1,
                                jobId: 1,
                                companyId: 1,
                                resume:1,
                                points:1,
                                coverLetter:1,
                                status:1,
                                question:1,
                                missingSkills:1,
                                // Merge fields from user into the document
                                userName: "$user.userName",
                                email: "$user.email",
                                country: "$user.address.country",
                                phone:"$user.phone",
                                skills: "$user.skills",
                                gender: "$user.gender",
                                experienceYears: "$user.experienceYears",
                            }
                        
                    }
                    ],
                    as: "applicants" // Name of the array field to populate
                },
            }
        ]
        const job= await jobModel.aggregate(pipeline)
        if (!job) {
            sendResponse(res, constans.RESPONSE_UNAUTHORIZED, "job Not found Or Something error ", '', []);
        } else {
            sendResponse(res, constans.RESPONSE_SUCCESS, "Done", job, []);
        }
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
    }
}

const getAllJobs = async (req, res) => {    
    try {
        const {limit, offset} = paginationWrapper(req.query.page, req.query.size)
        const search = req.query.search || '';
        const regex = new RegExp(search, 'i');
        const {title, salary, type, location, duration, salaryType, jobType, skills,durationType} = req.query;
        let query =prepareQuery(title, type, location, duration, salary, salaryType, jobType, skills,durationType);
            if (salary) {
                query.Salary = { $gte: salary }; 
            }
            if(search){
                query={}
            }
        let filteredData
        if(search){
            filteredData= await jobModel.find({$or:[
                {skills: {$regex: regex}},
                {title: {$regex: regex}},
            ]}).populate('company', 'name image')
                .skip(offset || req.query.skip)
                .limit(limit)
                .sort({createdAt: -1});
        }

        if(Object.values(query).length>0){
            filteredData= await jobModel.find(query).populate('company', 'name image')
                .skip(offset || req.query.skip)
                .limit(limit)
                .sort({createdAt: -1});
        }
            //.....this function used to addCompanyNameAndImageToResponse.....//
        const updatedFilteredData = addCompanyNameAndImageToResponse(filteredData);
        if (updatedFilteredData.length) {
            return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", updatedFilteredData, []);
        }
        sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
    } catch (error) {
        sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, [], []);
    }
}

const applyPageDetails=async(req,res)=>{
    const {jobId}=req.params;
    const job=await jobModel.findOne({jobId})
    if(!job){
        sendResponse(res,constans.RESPONSE_BAD_REQUEST,"JobId is in_valid",{},[])
    }
    else{
        const details=await jobModel.findOne({jobId}).select("questions")
        if(!details.questions||details.questions.length==0){
           return  sendResponse(res,constans.RESPONSE_SUCCESS,"there is no questions found",[],[])
        }
       const data= details.questions.map((item=>{
            return item
        }))
        sendResponse(res,constans.RESPONSE_SUCCESS,"Done",data,[])
    }
}

//.....used to get the top 10 companies that create the most jobs...//
const topBrands=async(req,res)=>{
    const topCompanies = await jobModel.aggregate([
        { $group: { _id: '$companyId', totalJobs: { $sum: 1 } } },
        { $sort: { totalJobs: -1 } },
        { $limit: 10 }
      ]);
     const data=await Promise.all( topCompanies.map(async (item) => {
        return await companyModel.findOne({ companyId: item._id }).select("name")
        }))
      sendResponse(res,constans.RESPONSE_SUCCESS,"Done",data,[])
}


const newjobs=async(req,res)=>{
    const data=await jobModel.find().populate({path:"company"}).sort({createdAt:-1}).limit(10)
    const updatedFilteredData = addCompanyNameAndImageToResponse(data);
    if (updatedFilteredData.length) {
        return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", updatedFilteredData, []);
    }
    sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
    sendResponse(res,constans.RESPONSE_SUCCESS,"Done",data,[])
}



module.exports = {
    getAllJobs,
    recommendedJobs,
    Applications,
    jobDetails,
    jobApplicants,
    applyPageDetails,
    topBrands,
    newjobs
    // getJobs: filterJobs,
}








// const getAllJobs = async (req, res) => {    
//     try {
//         const {limit, offset} = paginationWrapper(req.query.page, req.query.size)
//         const search = req.query.search || '';
//         const regex = new RegExp(search, 'i');
//         const filteredData= await jobModel.find({
//             $or: [
//                 {skills: {$regex: regex}},
//                 {title: {$regex: regex}},
//                 {description: {$regex: regex}}
//             ]
//         }).populate('company', 'name image')
//             .skip(offset || req.query.skip)
//             .limit(limit)
//             .sort({createdAt: -1});
//             //.....this function used to addCompanyNameAndImageToResponse.....//
//         const updatedFilteredData = addCompanyNameAndImageToResponse(filteredData);

//         if (updatedFilteredData.length) {
//             return sendResponse(res, constans.RESPONSE_SUCCESS, "Done", updatedFilteredData, []);
//         }

//         sendResponse(res, constans.RESPONSE_NOT_FOUND, "No Jobs Found", [], []);
//     } catch (error) {
//         sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, [], []);
//     }
// }


//......................................................................//
// const filterJobs = async (req, res) => {
//     try {
//         const {limit, offset} = paginationWrapper(req.query.page, req.query.size);
//         const {title, salary, type, location, duration, salaryType, jobType, skills,durationType} = req.query;
//         const query = prepareQuery(title, type, location, duration, salary, salaryType, jobType, skills,durationType);
//         if (salary) {
//             const salaryCondition = {};
//             salaryCondition.Salary = { $gte: salary }; 
//             Object.assign(query, salaryCondition);
//         }
//         const filteredData = await  jobModel.find(query).populate("company", "name image")
//         .skip(offset || req.query.skip)
//         .limit(limit)
//         .sort({createdAt: -1});

//         const updatedFilteredData = addCompanyNameAndImageToResponse(filteredData);

//         const message = updatedFilteredData.length ? "Done" : "No Job found";
//         sendResponse(res, constans.RESPONSE_SUCCESS, message, updatedFilteredData, []);
//     } catch (error) {
//         sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, error.message, '', []);
//     }
// }










